import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  ClubKey,
  DimpleProfileId,
  FlightTrajectoryPoint,
  FlightShotTelemetry,
  VideoFlightExtraction,
  SavedSession,
  CohortId,
} from '../types';
import {
  STITCH_CLUBS,
  DIMPLE_PROFILES,
  calculateBallFlight,
} from '../utils/ballFlightPhysics';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Eraser,
  List,
  Video,
  Upload,
  Sparkles,
  Wind,
  Gauge,
  Compass,
  Download,
  CheckCircle2,
  ArrowLeft,
  Crosshair,
  Activity,
} from 'lucide-react';

interface BallFlightSimulatorHubProps {
  savedSessions: SavedSession[];
  activeRecordingBlobUrl?: string;
  activeRecordingType?: 'video_voice' | 'voice_only' | 'simulated';
  activeParticipantName?: string;
  activeCohortId?: CohortId;
  handoffVideoUrl?: string;
  handoffVideoLabel?: string;
  onNavigateToHub1Transcriber: () => void;
  flightShots: FlightShotTelemetry[];
  onSaveFlightShot: (shot: FlightShotTelemetry) => Promise<void> | void;
  onClearFlightShots: () => Promise<void> | void;
}

export const BallFlightSimulatorHub: React.FC<BallFlightSimulatorHubProps> = ({
  savedSessions,
  activeRecordingBlobUrl,
  activeRecordingType,
  activeParticipantName,
  handoffVideoUrl,
  handoffVideoLabel,
  onNavigateToHub1Transcriber,
  flightShots,
  onSaveFlightShot,
  onClearFlightShots,
}) => {
  // --- Video Source Bridge (Hub 1 -> Hub 2) ---
  const sessionsWithMedia = savedSessions.filter((s) => Boolean(s.mediaBlobUrl));
  const [videoSourceMode, setVideoSourceMode] = useState<'handoff' | 'current' | 'session' | 'upload'>(() => {
    if (handoffVideoUrl) return 'handoff';
    if (activeRecordingBlobUrl && activeRecordingType === 'video_voice') return 'current';
    if (sessionsWithMedia.length > 0) return 'session';
    return 'upload';
  });
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessionsWithMedia[0]?.id || '');
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>('');
  const [uploadedVideoName, setUploadedVideoName] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showReticleOverlay, setShowReticleOverlay] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync handoff URL from Hub 1 Transcriber if updated
  useEffect(() => {
    if (handoffVideoUrl) {
      setVideoSourceMode('handoff');
    }
  }, [handoffVideoUrl]);

  // Clean up local object URL
  useEffect(() => {
    return () => {
      if (uploadedVideoUrl) {
        URL.revokeObjectURL(uploadedVideoUrl);
      }
    };
  }, [uploadedVideoUrl]);

  const selectedSession = savedSessions.find((s) => s.id === selectedSessionId);
  let effectiveVideoUrl: string | undefined;
  let effectiveVideoLabel = 'No Hub 1 Video Selected';

  if (videoSourceMode === 'handoff' && handoffVideoUrl) {
    effectiveVideoUrl = handoffVideoUrl;
    effectiveVideoLabel = handoffVideoLabel || 'Hub 1 AI Transcriber Video';
  } else if (videoSourceMode === 'current' && activeRecordingBlobUrl) {
    effectiveVideoUrl = activeRecordingBlobUrl;
    effectiveVideoLabel = `Live Capture (${activeParticipantName || 'Active Golfer'})`;
  } else if (videoSourceMode === 'session' && selectedSession?.mediaBlobUrl) {
    effectiveVideoUrl = selectedSession.mediaBlobUrl;
    effectiveVideoLabel = `${selectedSession.participantName || 'Participant'} (${selectedSession.cohortName})`;
  } else if (videoSourceMode === 'upload' && uploadedVideoUrl) {
    effectiveVideoUrl = uploadedVideoUrl;
    effectiveVideoLabel = uploadedVideoName || 'Uploaded Swing Clip';
  }

  // --- Google Stitch Simulator Controls State ---
  const [selectedClubKey, setSelectedClubKey] = useState<ClubKey>('driver');
  const [viewMode, setViewMode] = useState<'side' | 'top'>('side');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  const [clubSpeed, setClubSpeed] = useState<number>(105);
  const [launchAngle, setLaunchAngle] = useState<number>(13.5);
  const [sideSpinAngle, setSideSpinAngle] = useState<number>(-3.0);
  const [attackAngle, setAttackAngle] = useState<number>(2.5);
  const [spinRateOverride, setSpinRateOverride] = useState<number | undefined>(undefined);

  // --- Engineering Design MVP Aerodynamics & Golf Resistance Controls ---
  const [swingResistanceLbs, setSwingResistanceLbs] = useState<number>(1.25);
  const [dimpleProfile, setDimpleProfile] = useState<DimpleProfileId>('tour_332');

  // --- Video Telemetry AI Analysis State ---
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState<boolean>(false);
  const [videoTelemetry, setVideoTelemetry] = useState<VideoFlightExtraction | null>(null);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

  // --- Canvas & Animation State ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const currentTrajectoryRef = useRef<FlightTrajectoryPoint[]>([]);
  const activeColorRef = useRef<string>(STITCH_CLUBS.driver.color);
  const completedTracesRef = useRef<{ points: FlightTrajectoryPoint[]; color: string }[]>([]);
  const showGhostPreviewRef = useRef<boolean>(true);
  const hasAutoLaunchedRef = useRef<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string>('driver_draw');
  const [hudLive, setHudLive] = useState<{ x: number; y: number; t: number }>({ x: 0, y: 0, t: 0 });
  const [simStateLabel, setSimStateLabel] = useState<string>('Ready for Swing');

  // Audio Context Ref (Web Audio API Synth from Stitch)
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playImpactSound = useCallback(
    (speed: number) => {
      if (!audioEnabled) return;
      try {
        if (!audioCtxRef.current) {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioCtx) {
            audioCtxRef.current = new AudioCtx();
          }
        }
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const baseFreq = 180 + speed * 1.5;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.75, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } catch {
        // Ignore browser audio autoplay restrictions
      }
    },
    [audioEnabled]
  );

  // Real-time computed preview metrics (memoized so references stay stable)
  const currentPreview = useMemo(
    () =>
      calculateBallFlight({
        clubKey: selectedClubKey,
        clubSpeed,
        launchAngle,
        sideSpinAngle,
        attackAngle,
        swingResistanceLbs,
        dimpleProfile,
        spinRateOverride,
      }),
    [selectedClubKey, clubSpeed, launchAngle, sideSpinAngle, attackAngle, swingResistanceLbs, dimpleProfile, spinRateOverride]
  );

  const hangTimeSec =
    currentPreview.points.length > 0
      ? currentPreview.points[currentPreview.points.length - 1].t
      : currentPreview.apexTime * 2;

  // Keep latest render parameters in a ref so drawScene identity never churns and never kills rAF
  const sceneStateRef = useRef({
    viewMode,
    selectedClubKey,
    currentPreview,
  });
  sceneStateRef.current = {
    viewMode,
    selectedClubKey,
    currentPreview,
  };

  // --- Canvas Drawing Routine (Stable Identity — Reads Latest Refs) ---
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (w === 0 || h === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { viewMode: vm, selectedClubKey: clubKey, currentPreview: preview } = sceneStateRef.current;

    ctx.clearRect(0, 0, w, h);

    const padLeft = 34;
    const padBottom = 22;
    const drawW = w - padLeft - 12;
    const drawH = h - padBottom - 14;

    const maxX = 350;
    const maxY = 60;
    const maxZ = 30;

    const mapX = (xYds: number) => padLeft + (xYds / maxX) * drawW;
    const mapY = (yYds: number) => h - padBottom - (yYds / maxY) * drawH;
    const mapZ = (zYds: number) => h / 2 + (zYds / maxZ) * (drawH / 2);

    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748B';
    ctx.font = '9px "JetBrains Mono", monospace';

    if (vm === 'side') {
      ctx.beginPath();
      ctx.moveTo(padLeft, h - padBottom);
      ctx.lineTo(w - 10, h - padBottom);
      ctx.strokeStyle = 'rgba(0, 230, 153, 0.35)';
      ctx.stroke();

      for (let x = 50; x <= maxX; x += 50) {
        const cx = mapX(x);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.moveTo(cx, 10);
        ctx.lineTo(cx, h - padBottom);
        ctx.stroke();
        ctx.fillText(`${x}y`, cx - 8, h - 8);
      }

      for (let y = 20; y <= maxY; y += 20) {
        const cy = mapY(y);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.moveTo(padLeft, cy);
        ctx.lineTo(w - 10, cy);
        ctx.stroke();
        ctx.fillText(`${y}y`, 5, cy + 3);
      }
    } else {
      const centerY = mapZ(0);
      ctx.beginPath();
      ctx.moveTo(padLeft, centerY);
      ctx.lineTo(w - 10, centerY);
      ctx.strokeStyle = 'rgba(0, 230, 153, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let x = 50; x <= maxX; x += 50) {
        const cx = mapX(x);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.moveTo(cx, 10);
        ctx.lineTo(cx, h - 10);
        ctx.stroke();
        ctx.fillText(`${x}y`, cx - 8, h - 8);
      }

      for (let z = -20; z <= 20; z += 10) {
        if (z === 0) continue;
        const cz = mapZ(z);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.moveTo(padLeft, cz);
        ctx.lineTo(w - 10, cz);
        ctx.stroke();
        ctx.fillText(`${z > 0 ? 'R' : 'L'}${Math.abs(z)}y`, 5, cz + 3);
      }
    }

    // Tee origin marker
    const originX = mapX(0);
    const originY = vm === 'side' ? mapY(0) : mapZ(0);
    ctx.beginPath();
    ctx.arc(originX, originY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00E699';
    ctx.fill();

    // Preview ghost curve when idle (suppressed immediately after user taps Erase)
    if (currentTrajectoryRef.current.length === 0 && showGhostPreviewRef.current) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      preview.points.forEach((pt, idx) => {
        const px = mapX(pt.x);
        const py = vm === 'side' ? mapY(pt.y) : mapZ(pt.z);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Historical completed traces
    completedTracesRef.current.forEach((trace) => {
      ctx.beginPath();
      ctx.strokeStyle = trace.color || 'rgba(100, 116, 139, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      trace.points.forEach((pt, idx) => {
        const px = mapX(pt.x);
        const py = vm === 'side' ? mapY(pt.y) : mapZ(pt.z);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Active animated ball flight trace + glowing golf ball movement
    const activePts = currentTrajectoryRef.current;
    if (activePts.length > 0) {
      const clubColor = activeColorRef.current || STITCH_CLUBS[clubKey].color;
      ctx.beginPath();
      ctx.strokeStyle = clubColor;
      ctx.lineWidth = 3.2;
      ctx.shadowColor = clubColor;
      ctx.shadowBlur = 10;

      activePts.forEach((pt, idx) => {
        const px = mapX(pt.x);
        const py = vm === 'side' ? mapY(pt.y) : mapZ(pt.z);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      const head = activePts[activePts.length - 1];
      const headX = mapX(head.x);
      const headY = vm === 'side' ? mapY(head.y) : mapZ(head.z);

      // Ground projection shadow in Side View so altitude over turf is visually obvious
      if (vm === 'side') {
        const groundY = mapY(0);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.moveTo(headX, headY);
        ctx.lineTo(headX, groundY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.ellipse(headX, groundY, 4.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 230, 153, 0.45)';
        ctx.fill();
      }

      // Outer glowing halo around moving golf ball
      ctx.beginPath();
      ctx.arc(headX, headY, 9.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 230, 153, 0.24)';
      ctx.fill();

      // Solid high-contrast white golf ball core
      ctx.beginPath();
      ctx.arc(headX, headY, 5.2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = clubColor;
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Live floating yardage label next to moving ball
      ctx.fillStyle = '#E2E8F0';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      const labelX = Math.min(w - 58, headX + 10);
      const labelY = Math.max(18, headY - 8);
      ctx.fillText(`${head.x.toFixed(0)}y`, labelX, labelY);
    }
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    drawScene();
  }, [drawScene]);

  // Mount-only listener & cleanup (never re-runs during animation frames!)
  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [resizeCanvas]);

  // Redraw scene when static parameters change while idle
  useEffect(() => {
    if (!isAnimating) {
      drawScene();
    }
  }, [drawScene, isAnimating, viewMode, selectedClubKey, currentPreview]);

  // --- Trigger Real-Time Ball Flight Animation & Persist Shot ---
  const triggerSwing = useCallback(
    (
      overrideParams?: Partial<{
        clubKey: ClubKey;
        clubSpeed: number;
        launchAngle: number;
        sideSpinAngle: number;
        attackAngle: number;
        swingResistanceLbs: number;
        dimpleProfile: DimpleProfileId;
        spinRateOverride?: number;
        source: 'manual' | 'video_ai';
        sourceLabel: string;
        skipPersist?: boolean;
      }>
    ) => {
      // Cancel any prior active flight cleanly so Play never locks up
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      const targetClub = overrideParams?.clubKey ?? selectedClubKey;
      const simResult = calculateBallFlight({
        clubKey: targetClub,
        clubSpeed: overrideParams?.clubSpeed ?? clubSpeed,
        launchAngle: overrideParams?.launchAngle ?? launchAngle,
        sideSpinAngle: overrideParams?.sideSpinAngle ?? sideSpinAngle,
        attackAngle: overrideParams?.attackAngle ?? attackAngle,
        swingResistanceLbs: overrideParams?.swingResistanceLbs ?? swingResistanceLbs,
        dimpleProfile: overrideParams?.dimpleProfile ?? dimpleProfile,
        spinRateOverride:
          overrideParams && 'spinRateOverride' in overrideParams
            ? overrideParams.spinRateOverride
            : spinRateOverride,
        source: overrideParams?.source ?? 'manual',
        sourceLabel: overrideParams?.sourceLabel,
      });

      showGhostPreviewRef.current = true;
      activeColorRef.current = simResult.color;
      if (!overrideParams?.skipPersist) {
        playImpactSound(simResult.clubSpeed);
      }

      setIsAnimating(true);
      setSimStateLabel('Ball In Flight...');
      currentTrajectoryRef.current = simResult.points.length > 0 ? [simResult.points[0]] : [];

      const totalFlightSeconds =
        simResult.points.length > 0 ? simResult.points[simResult.points.length - 1].t : 3.0;
      const startTimestamp = performance.now();

      const animateStep = (now: number) => {
        // Real-time 1.0x flight clock in seconds
        const elapsedSec = (now - startTimestamp) / 1000;

        if (elapsedSec < totalFlightSeconds) {
          // Collect all trajectory points up to current real-time second
          const visiblePts = simResult.points.filter((pt) => pt.t <= elapsedSec);
          if (visiblePts.length === 0 && simResult.points.length > 0) {
            visiblePts.push(simResult.points[0]);
          }
          currentTrajectoryRef.current = visiblePts;
          const head = visiblePts[visiblePts.length - 1];
          if (head) {
            setHudLive({ x: head.x, y: head.y, t: elapsedSec });
          }
          drawScene();
          animationFrameRef.current = requestAnimationFrame(animateStep);
        } else {
          // Flight landed: show full curve & final coordinates
          currentTrajectoryRef.current = [...simResult.points];
          const finalPt = simResult.points[simResult.points.length - 1];
          if (finalPt) {
            setHudLive({ x: finalPt.x, y: Math.max(0, finalPt.y), t: finalPt.t });
          }
          drawScene();

          animationFrameRef.current = null;
          setIsAnimating(false);
          setSimStateLabel('Ready for Swing');

          completedTracesRef.current.push({
            points: [...simResult.points],
            color: simResult.color,
          });

          if (!overrideParams?.skipPersist) {
            const savedShot: FlightShotTelemetry = {
              ...simResult,
              id: `shot-${Date.now()}`,
              timestamp: Date.now(),
            };
            onSaveFlightShot(savedShot);
          }
        }
      };

      animationFrameRef.current = requestAnimationFrame(animateStep);
    },
    [
      selectedClubKey,
      clubSpeed,
      launchAngle,
      sideSpinAngle,
      attackAngle,
      swingResistanceLbs,
      dimpleProfile,
      spinRateOverride,
      playImpactSound,
      drawScene,
      onSaveFlightShot,
    ]
  );

  // Auto-launch initial preset Ball In Flight on first open so ball movement is immediately visible
  useEffect(() => {
    if (hasAutoLaunchedRef.current) return;
    hasAutoLaunchedRef.current = true;
    const timer = setTimeout(() => {
      triggerSwing({ skipPersist: true });
    }, 180);
    return () => clearTimeout(timer);
  }, [triggerSwing]);

  // --- Preset Ball In Flight Launcher ---
  const handleRunPresetFlight = (preset: {
    id: string;
    clubKey: ClubKey;
    clubSpeed: number;
    launchAngle: number;
    sideSpinAngle: number;
    attackAngle: number;
    spinRateOverride?: number;
    resistanceLbs?: number;
  }) => {
    const nextResistance = preset.resistanceLbs !== undefined ? preset.resistanceLbs : swingResistanceLbs;
    if (preset.resistanceLbs !== undefined) {
      setSwingResistanceLbs(preset.resistanceLbs);
    }
    setActivePresetId(preset.id);
    setSelectedClubKey(preset.clubKey);
    setClubSpeed(preset.clubSpeed);
    setLaunchAngle(preset.launchAngle);
    setSideSpinAngle(preset.sideSpinAngle);
    setAttackAngle(preset.attackAngle);
    setSpinRateOverride(preset.spinRateOverride);
    showGhostPreviewRef.current = true;

    triggerSwing({
      clubKey: preset.clubKey,
      clubSpeed: preset.clubSpeed,
      launchAngle: preset.launchAngle,
      sideSpinAngle: preset.sideSpinAngle,
      attackAngle: preset.attackAngle,
      swingResistanceLbs: nextResistance,
      dimpleProfile,
      spinRateOverride: preset.spinRateOverride,
      source: 'manual',
    });
  };

  // --- Club Selector (Matches Launch Monitor Angles) ---
  const handleSelectClub = (key: ClubKey) => {
    showGhostPreviewRef.current = true;
    setSelectedClubKey(key);
    setLaunchAngle(STITCH_CLUBS[key].baseLoft);
    setSpinRateOverride(undefined);
  };

  // --- Clear & Reset (Stops active flight cleanly & wipes canvas traces) ---
  const handleClearTraces = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsAnimating(false);
    setSimStateLabel('Ready for Swing');
    completedTracesRef.current = [];
    currentTrajectoryRef.current = [];
    showGhostPreviewRef.current = false;
    setHudLive({ x: 0, y: 0, t: 0 });
    drawScene();
  };

  const handleResetAll = () => {
    handleClearTraces();
    showGhostPreviewRef.current = true;
    setActivePresetId('driver_draw');
    setSelectedClubKey('driver');
    setClubSpeed(105);
    setLaunchAngle(13.5);
    setSideSpinAngle(-3.0);
    setAttackAngle(2.5);
    setSpinRateOverride(undefined);
    setSwingResistanceLbs(1.25);
    setDimpleProfile('tour_332');
    setVideoTelemetry(null);
    setTelemetryError(null);
  };

  // --- Video File Upload Handler ---
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }
    const url = URL.createObjectURL(file);
    setUploadedFile(file);
    setUploadedVideoUrl(url);
    setUploadedVideoName(file.name);
    setVideoSourceMode('upload');
    setVideoTelemetry(null);
    setTelemetryError(null);
  };

  // --- Capture Current Video Frame & Analyze Video Trajectory via Server Gemini API ---
  const handleAnalyzeVideoFootage = async () => {
    setIsAnalyzingVideo(true);
    setTelemetryError(null);
    setSimStateLabel('Analyzing Video...');

    try {
      let frameBase64: string | undefined;
      let videoBase64: string | undefined;
      let mimeType = 'video/webm';

      // Extract visual keyframe from the video player if loaded
      const videoEl = videoRef.current;
      if (videoEl && videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
        try {
          const capCanvas = document.createElement('canvas');
          capCanvas.width = Math.min(640, videoEl.videoWidth);
          capCanvas.height = Math.round((capCanvas.width / videoEl.videoWidth) * videoEl.videoHeight);
          const capCtx = capCanvas.getContext('2d');
          if (capCtx) {
            capCtx.drawImage(videoEl, 0, 0, capCanvas.width, capCanvas.height);
            frameBase64 = capCanvas.toDataURL('image/jpeg', 0.8);
          }
        } catch {
          // Proceed even if frame capture unavailable
        }
      }

      // Read video blob if small enough (< 12MB) so Gemini analyzes full motion
      if (effectiveVideoUrl) {
        try {
          const blobRes = await fetch(effectiveVideoUrl);
          const blob = await blobRes.blob();
          mimeType = blob.type || uploadedFile?.type || 'video/webm';
          if (blob.size <= 12 * 1024 * 1024) {
            videoBase64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        } catch {
          // Use keyframe or contextual calibration
        }
      }

      const res = await fetch('/api/ai/video-flight-telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoBase64,
          frameBase64,
          mimeType,
          clubKey: selectedClubKey,
          swingResistanceLbs,
          dimpleProfile,
          participantName: activeParticipantName || selectedSession?.participantName || 'Golfer',
          sessionNotes: selectedSession?.notes || '',
        }),
      });

      if (!res.ok) {
        throw new Error(`Telemetry API error: HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        const extracted: VideoFlightExtraction = json.data;
        setVideoTelemetry(extracted);

        // Apply extracted aerodynamics directly into the Google Stitch Flight Simulator controls
        setSelectedClubKey(extracted.detectedClub);
        setClubSpeed(extracted.clubSpeedMph);
        setLaunchAngle(extracted.launchAngleDeg);
        setSideSpinAngle(extracted.sideSpinAngleDeg);
        setAttackAngle(extracted.attackAngleDeg);
        setDimpleProfile(extracted.recommendedDimpleProfile);

        // Immediately launch simulated trace from video feedback
        setTimeout(() => {
          triggerSwing({
            clubKey: extracted.detectedClub,
            clubSpeed: extracted.clubSpeedMph,
            launchAngle: extracted.launchAngleDeg,
            sideSpinAngle: extracted.sideSpinAngleDeg,
            attackAngle: extracted.attackAngleDeg,
            swingResistanceLbs,
            dimpleProfile: extracted.recommendedDimpleProfile,
            source: 'video_ai',
            sourceLabel: effectiveVideoLabel,
          });
        }, 120);
      } else {
        throw new Error('Invalid telemetry extraction response');
      }
    } catch (err: any) {
      setTelemetryError(err?.message || 'Unable to extract video telemetry');
      setSimStateLabel('Ready for Swing');
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  // --- Export Shot Telemetry CSV ---
  const handleExportShotsCsv = () => {
    if (flightShots.length === 0) return;
    const headers = [
      'Shot #',
      'Timestamp',
      'Source',
      'Club',
      'Swing Resistance (lbs)',
      'Dimple Profile',
      'Club Speed (mph)',
      'Ball Speed (mph)',
      'Smash Factor',
      'Launch Angle (deg)',
      'Attack Angle (deg)',
      'Spin Rate (rpm)',
      'Carry (yds)',
      'Total (yds)',
      'Apex (yds)',
      'Landing Angle (deg)',
      'Cd',
      'Cl',
      'Magnus Lift (N)',
      'Shape',
    ];
    const rows = flightShots.map((s, idx) => [
      flightShots.length - idx,
      new Date(s.timestamp).toISOString(),
      s.source === 'video_ai' ? 'Hub 1 Video AI' : 'Manual Sim',
      s.clubName,
      s.swingResistanceLbs.toFixed(2),
      DIMPLE_PROFILES[s.dimpleProfile]?.shortLabel || s.dimpleProfile,
      s.clubSpeed.toFixed(1),
      s.ballSpeed.toFixed(1),
      s.smash.toFixed(2),
      s.launchAngle.toFixed(1),
      s.attackAngle.toFixed(1),
      s.spinRate,
      s.carry.toFixed(1),
      s.total.toFixed(1),
      s.apex.toFixed(1),
      s.aerodynamics.landingAngleDeg.toFixed(1),
      s.aerodynamics.dragCoeffCd.toFixed(3),
      s.aerodynamics.liftCoeffCl.toFixed(3),
      s.aerodynamics.magnusLiftNewtons.toFixed(2),
      s.flightShape,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golf-resistance-hub2-telemetry-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  let sideLabelText = 'Straight (0°)';
  if (sideSpinAngle < 0) sideLabelText = `${Math.abs(sideSpinAngle).toFixed(1)}° (Draw)`;
  if (sideSpinAngle > 0) sideLabelText = `${sideSpinAngle.toFixed(1)}° (Fade)`;

  return (
    <div className="bg-[#0B0F17] text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* HUB 2 TOP TELEMETRY NAVBAR (Google Stitch Identity + Navigation) */}
      <div className="stitch-glass-panel px-4 py-3 flex items-center justify-between border-b border-white/10 gap-2 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20 shrink-0">
            G
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold tracking-tight text-white">
                Golf Resistance Ball Discovery Studio
              </h2>
              <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap">
                Hub 2 · Engineering MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Mobile Ball Flight Physics · Video Trajectory &amp; Dimple Aerodynamics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateToHub1Transcriber}
            className="px-2.5 py-2 rounded-lg bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-white/10 flex items-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap"
            title="Switch back to Hub 1 AI Transcriber Video Footage"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hub 1 Video</span>
          </button>

          <button
            type="button"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`px-2.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors border flex items-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap ${
              audioEnabled ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-400 border-white/10'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{audioEnabled ? 'Sound ON' : 'Sound OFF'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            title="Reset All Simulator Data"
            className="p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-white/10 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* RESPONSIVE SPLIT WORKSPACE: Single Column on Mobile (375-440px), Asymmetric 2-Column Telemetry Console on Laptop */}
      <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT / PRIMARY STAGE (7 cols on desktop): Ball Flight Canvas + Launch Monitor + Hub 1 Video Bridge */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {/* 1. BALL FLIGHT CANVAS DISPLAY SECTION (Google Stitch) */}
          <div className="relative w-full rounded-2xl stitch-glass-panel overflow-hidden border border-emerald-500/20 shadow-xl flex flex-col">
            <div className="px-3 py-2 bg-slate-950/70 border-b border-white/5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Activity
                  className={`w-3.5 h-3.5 ${
                    isAnimating || isAnalyzingVideo ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                  }`}
                />
                <span
                  className={`text-[11px] font-semibold tracking-wide uppercase ${
                    isAnimating || isAnalyzingVideo ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {simStateLabel}
                </span>
              </div>

              <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode('side')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    viewMode === 'side' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Side View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('top')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    viewMode === 'top' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Top-Down Tracer
                </button>
              </div>
            </div>

            <div className="relative w-full h-[230px] sm:h-[265px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
              <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

              {/* Live Flight HUD Overlay */}
              <div className="absolute top-2 left-2 flex gap-1.5 pointer-events-none text-[10px] font-mono-num">
                <div className="bg-slate-950/85 border border-emerald-500/30 px-2 py-0.5 rounded text-emerald-400">
                  Dist: {hudLive.x.toFixed(1)} yds
                </div>
                <div className="bg-slate-950/85 border border-cyan-500/30 px-2 py-0.5 rounded text-cyan-400">
                  H: {hudLive.y.toFixed(1)} yds
                </div>
                <div className="bg-slate-950/85 border border-purple-500/30 px-2 py-0.5 rounded text-purple-300">
                  T: {hudLive.t.toFixed(1)}s
                </div>
              </div>

              {/* Canvas Visual Legend */}
              <div className="absolute bottom-2 right-2 pointer-events-none text-[9px] text-slate-400 bg-slate-950/75 px-2 py-0.5 rounded border border-white/5 font-mono-num">
                {viewMode === 'side'
                  ? 'Grid: 50yd / 20yd (Side Elevation)'
                  : 'Grid: 50yd / 10yd Lateral (Top-Down Tracer)'}
              </div>
            </div>

            {/* Preset "Ball In Flight" Real-Time Bar */}
            <div className="px-3 py-2 bg-slate-950/80 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Preset Ball In Flight:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'driver_draw', label: 'Driver Draw', clubKey: 'driver' as ClubKey, clubSpeed: 105, launchAngle: 13.5, sideSpinAngle: -3.0, attackAngle: 2.5 },
                  { id: 'pdf_bench', label: '132mph Benchmark', clubKey: 'driver' as ClubKey, clubSpeed: 89.2, launchAngle: 14.0, sideSpinAngle: 0.0, attackAngle: 0.0, spinRateOverride: 3000, resistanceLbs: 0 },
                  { id: 'wood3_low', label: '3-Wood Low', clubKey: 'wood3' as ClubKey, clubSpeed: 98, launchAngle: 14.5, sideSpinAngle: 0.0, attackAngle: -0.5 },
                  { id: 'iron7_apex', label: '7-Iron Apex', clubKey: 'iron7' as ClubKey, clubSpeed: 90, launchAngle: 16.5, sideSpinAngle: -1.0, attackAngle: -3.5, spinRateOverride: 7097 },
                  { id: 'wedge_spin', label: 'Wedge Spin', clubKey: 'wedge' as ClubKey, clubSpeed: 83.6, launchAngle: 24.2, sideSpinAngle: 0.5, attackAngle: -5.0, spinRateOverride: 9304 },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleRunPresetFlight(preset)}
                    className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                      activePresetId === preset.id
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                        : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/25'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. LAUNCH MONITOR 10-CARD DISPLAY GRID (Google Stitch) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="stitch-glass-panel p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Club Speed
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-extrabold font-mono-num text-white">
                  {currentPreview.clubSpeed.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400">mph</span>
              </div>
            </div>

            <div className="stitch-glass-panel p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Ball Speed
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-extrabold font-mono-num text-emerald-400">
                  {currentPreview.ballSpeed.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400">mph</span>
              </div>
            </div>

            <div className="stitch-glass-panel p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Smash Factor
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-extrabold font-mono-num text-cyan-400">
                  {currentPreview.smash.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400">ratio</span>
              </div>
            </div>

            <div className="stitch-glass-panel p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Launch Angle
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-extrabold font-mono-num text-white">
                  {currentPreview.launchAngle.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400">deg</span>
              </div>
            </div>

            <div className="stitch-glass-panel p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Spin Rate
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-extrabold font-mono-num text-indigo-300">
                  {currentPreview.spinRate}
                </span>
                <span className="text-[10px] text-slate-400">rpm</span>
              </div>
            </div>

            <div className="stitch-glass-panel p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Shot Shape
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm sm:text-base font-bold font-mono-num text-amber-400 truncate">
                  {currentPreview.flightShape}
                </span>
              </div>
            </div>

            <div className="stitch-glass-panel p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/25">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 block">
                Carry
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black font-mono-num text-emerald-400">
                  {currentPreview.carry.toFixed(1)}
                </span>
                <span className="text-[10px] text-emerald-500">yds</span>
              </div>
            </div>

            <div className="stitch-glass-panel p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-950/25">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 block">
                Total Dist
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black font-mono-num text-cyan-400">
                  {currentPreview.total.toFixed(1)}
                </span>
                <span className="text-[10px] text-cyan-500">yds</span>
              </div>
            </div>

            <div className="stitch-glass-panel p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Apex Height
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-extrabold font-mono-num text-purple-300">
                  {currentPreview.apex.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400">yds</span>
              </div>
            </div>

            <div className="stitch-glass-panel p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Hang Time
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-extrabold font-mono-num text-white">
                  {hangTimeSec.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400">sec (Apex {currentPreview.apexTime.toFixed(1)}s)</span>
              </div>
            </div>
          </div>

          {/* 3. HUB 1 VIDEO FOOTAGE BRIDGE & DIRECT LAUNCH TELEMETRY EXTRACTION */}
          <div className="stitch-glass-panel p-3.5 rounded-2xl border border-cyan-500/20 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Hub 1 Video Footage → Ball Flight Extractor
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Analyze trajectory, launch angle, spin rate, and dimple aerodynamics from swing footage
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowReticleOverlay(!showReticleOverlay)}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer flex items-center gap-1 ${
                  showReticleOverlay
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40'
                    : 'bg-slate-800 text-slate-400 border-white/10'
                }`}
              >
                <Crosshair className="w-3 h-3" />
                <span>{showReticleOverlay ? 'Trajectory Overlay ON' : 'Overlay OFF'}</span>
              </button>
            </div>

            {/* Video Source Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {handoffVideoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoSourceMode('handoff')}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer truncate ${
                    videoSourceMode === 'handoff'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                      : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/25'
                  }`}
                >
                  Hub 1 Handoff
                </button>
              )}
              <button
                type="button"
                onClick={() => setVideoSourceMode('current')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer truncate ${
                  videoSourceMode === 'current'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                    : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/25'
                }`}
              >
                Live Camera ({activeRecordingBlobUrl ? 'Ready' : 'Empty'})
              </button>
              <button
                type="button"
                onClick={() => setVideoSourceMode('session')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer truncate ${
                  videoSourceMode === 'session'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                    : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/25'
                }`}
              >
                Saved Sessions ({sessionsWithMedia.length})
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border cursor-pointer flex items-center justify-center gap-1 ${
                  videoSourceMode === 'upload'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                    : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/25'
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>Upload Clip</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoFileUpload}
                className="hidden"
              />
            </div>

            {videoSourceMode === 'session' && sessionsWithMedia.length > 0 && (
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                {sessionsWithMedia.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.participantName || 'Participant'} · {s.cohortName} ({s.recordedSeconds}s)
                  </option>
                ))}
              </select>
            )}

            {/* Video Player + Trajectory Reticle Overlay */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-white/10 min-h-[175px] flex items-center justify-center">
              {effectiveVideoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={effectiveVideoUrl}
                    controls
                    playsInline
                    crossOrigin="anonymous"
                    className="w-full max-h-[240px] object-contain bg-black"
                  />
                  {showReticleOverlay && (
                    <svg
                      viewBox="0 0 320 180"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      {/* Impact Origin & Launch Vector */}
                      <line
                        x1="48"
                        y1="145"
                        x2="285"
                        y2="145"
                        stroke="rgba(255,255,255,0.22)"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <line
                        x1="48"
                        y1="145"
                        x2={48 + Math.cos((launchAngle * Math.PI) / 180) * 185}
                        y2={145 - Math.sin((launchAngle * Math.PI) / 180) * 185}
                        stroke="#00E699"
                        strokeWidth="2.5"
                      />
                      <circle cx="48" cy="145" r="5" fill="#00E699" fillOpacity="0.85" />
                      <text
                        x="58"
                        y="22"
                        fill="#00E699"
                        fontSize="10"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="700"
                      >
                        LAUNCH {launchAngle.toFixed(1)}° · SPIN {currentPreview.spinRate} RPM
                      </text>
                      <text
                        x="58"
                        y="35"
                        fill="#38BDF8"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {DIMPLE_PROFILES[dimpleProfile].shortLabel} · LOAD {swingResistanceLbs.toFixed(2)} LB
                      </text>
                    </svg>
                  )}
                </>
              ) : (
                <div className="p-5 text-center space-y-2">
                  <p className="text-xs text-slate-300 font-medium">
                    No active video loaded. Upload a swing video clip or capture footage in Hub 1.
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Swing Video</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAnalyzeVideoFootage}
                      disabled={isAnalyzingVideo}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold border border-emerald-500/30 cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run Calibrated Video Demo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] text-slate-400 truncate max-w-[260px]">
                Source: <strong className="text-slate-200">{effectiveVideoLabel}</strong>
              </span>

              <button
                type="button"
                onClick={handleAnalyzeVideoFootage}
                disabled={isAnalyzingVideo}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:brightness-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isAnalyzingVideo
                    ? 'Extracting Video Telemetry...'
                    : 'Analyze Video Trajectory & Populate Sim'}
                </span>
              </button>
            </div>

            {telemetryError && (
              <div className="text-xs text-rose-300 bg-rose-950/50 border border-rose-500/30 rounded-lg px-3 py-2">
                {telemetryError}
              </div>
            )}

            {videoTelemetry && (
              <div className="bg-slate-950/70 border border-emerald-500/25 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Video Aerodynamics Synced ({videoTelemetry.confidenceScore}% Confidence)
                  </span>
                  <span className="font-mono-num text-[10px] text-slate-400">
                    {videoTelemetry.modelUsed}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-white">Trajectory:</strong> {videoTelemetry.trajectoryObservation}
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-cyan-300">Dimple Aerodynamics ({videoTelemetry.estimatedDimpleCount}):</strong>{' '}
                  {videoTelemetry.dimpleAerodynamicsObservation}
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-emerald-300">Golf Resistance Effect:</strong>{' '}
                  {videoTelemetry.swingResistanceEffectSummary}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT / CONTROL & ENGINEERING MVP COLUMN (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* 1. GOOGLE STITCH CONTROL PANEL & ADJUSTMENTS */}
          <div className="stitch-glass-panel p-3.5 rounded-2xl border border-white/10 flex flex-col gap-3">
            {/* Club Selection Bar */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 block">
                Select Golf Club
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(STITCH_CLUBS) as ClubKey[]).map((key) => {
                  const club = STITCH_CLUBS[key];
                  const isActive = selectedClubKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectClub(key)}
                      className={`px-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow border border-emerald-400'
                          : 'bg-slate-800 text-slate-300 border border-white/10 hover:border-white/30'
                      }`}
                    >
                      {club.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Stitch Sliders */}
            <div className="space-y-3 bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-300 font-medium">Club Speed (Base Input)</span>
                  <span className="font-mono-num font-bold text-emerald-400">{clubSpeed} mph</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={125}
                  step={1}
                  value={clubSpeed}
                  onChange={(e) => {
                    showGhostPreviewRef.current = true;
                    setClubSpeed(Number(e.target.value));
                  }}
                  className="stitch-range-slider"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-300 font-medium">Launch Angle</span>
                  <span className="font-mono-num font-bold text-emerald-400">{launchAngle.toFixed(1)}°</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={32}
                  step={0.5}
                  value={launchAngle}
                  onChange={(e) => {
                    showGhostPreviewRef.current = true;
                    setLaunchAngle(Number(e.target.value));
                  }}
                  className="stitch-range-slider"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-300 font-medium">Face Angle / Curve (Side Spin)</span>
                  <span className="font-mono-num font-bold text-amber-400">{sideLabelText}</span>
                </div>
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={0.5}
                  value={sideSpinAngle}
                  onChange={(e) => {
                    showGhostPreviewRef.current = true;
                    setSideSpinAngle(Number(e.target.value));
                  }}
                  className="stitch-range-slider"
                />
                <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                  <span>Hook / Draw (-)</span>
                  <span>Straight (0)</span>
                  <span>Slice / Fade (+)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-300 font-medium">Attack Angle</span>
                  <span className="font-mono-num font-bold text-cyan-400">
                    {attackAngle > 0 ? `+${attackAngle.toFixed(1)}` : attackAngle.toFixed(1)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-6}
                  max={6}
                  step={0.5}
                  value={attackAngle}
                  onChange={(e) => {
                    showGhostPreviewRef.current = true;
                    setAttackAngle(Number(e.target.value));
                  }}
                  className="stitch-range-slider"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-300 font-medium">
                    Backspin Rate {spinRateOverride !== undefined ? '(Manual)' : '(Auto)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-num font-bold text-indigo-300">
                      {currentPreview.spinRate} rpm
                    </span>
                    {spinRateOverride !== undefined && (
                      <button
                        type="button"
                        onClick={() => setSpinRateOverride(undefined)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white border border-white/10 cursor-pointer"
                      >
                        Auto
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min={1200}
                  max={10500}
                  step={50}
                  value={spinRateOverride ?? currentPreview.spinRate}
                  onChange={(e) => {
                    showGhostPreviewRef.current = true;
                    setSpinRateOverride(Number(e.target.value));
                  }}
                  className="stitch-range-slider"
                />
              </div>
            </div>

            {/* MAIN ACTION BUTTONS (Google Stitch) */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  showGhostPreviewRef.current = true;
                  triggerSwing();
                }}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all stitch-neon-glow-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{isAnimating ? 'REPLAY SWING' : 'SWING NOW'}</span>
              </button>
              <button
                type="button"
                onClick={handleClearTraces}
                title="Erase All Flight Traces"
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-white/15 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer text-xs font-semibold"
              >
                <Eraser className="w-4 h-4 text-rose-400" />
                <span>Erase</span>
              </button>
            </div>
          </div>

          {/* 2. ENGINEERING DESIGN MVP: GOLF RESISTANCE & DIMPLE AERODYNAMICS */}
          <div className="stitch-glass-panel p-3.5 rounded-2xl border border-indigo-500/25 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Engineering Design MVP · Aerodynamics
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Swing resistance load &amp; dimple boundary-layer physics
                  </p>
                </div>
              </div>
              <span className="font-mono-num text-[10px] text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {currentPreview.aerodynamics.resistanceDeltaMph >= 0 ? '+' : ''}
                {currentPreview.aerodynamics.resistanceDeltaMph.toFixed(1)} mph
              </span>
            </div>

            {/* Swing Resistance Slider */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  Golf Resistance Swing Load
                </span>
                <span className="font-mono-num font-bold text-amber-400">
                  {swingResistanceLbs.toFixed(2)} lbs
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={3.0}
                step={0.25}
                value={swingResistanceLbs}
                onChange={(e) => setSwingResistanceLbs(Number(e.target.value))}
                className="stitch-range-slider"
              />
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[
                  { label: '0 lb Free', val: 0 },
                  { label: '0.75 lb Tempo', val: 0.75 },
                  { label: '1.25 lb Std GR', val: 1.25 },
                  { label: '2.00 lb Power', val: 2.0 },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setSwingResistanceLbs(preset.val)}
                    className={`py-1 px-1.5 rounded text-[10px] font-semibold border cursor-pointer truncate ${
                      swingResistanceLbs === preset.val
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                        : 'bg-slate-900 text-slate-400 border-white/10 hover:text-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dimple Pattern Geometry Selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Dimple Aerodynamics Profile
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(DIMPLE_PROFILES) as DimpleProfileId[]).map((pid) => {
                  const prof = DIMPLE_PROFILES[pid];
                  const active = dimpleProfile === pid;
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => setDimpleProfile(pid)}
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'bg-cyan-500/15 border-cyan-400/60 text-white'
                          : 'bg-slate-900/70 border-white/10 text-slate-400 hover:border-white/25'
                      }`}
                    >
                      <div className="text-[11px] font-bold flex items-center justify-between">
                        <span>{prof.shortLabel}</span>
                        <span className="font-mono-num text-[9px] text-cyan-300">
                          Cd {prof.baseDragCd}
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">
                        {prof.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Aerodynamic Telemetry Matrix */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <div className="bg-slate-950/70 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-400 uppercase block">Drag Cd</span>
                <span className="font-mono-num text-xs font-bold text-rose-300">
                  {currentPreview.aerodynamics.dragCoeffCd.toFixed(3)}
                </span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-400 uppercase block">Magnus Cl</span>
                <span className="font-mono-num text-xs font-bold text-emerald-300">
                  {currentPreview.aerodynamics.liftCoeffCl.toFixed(3)}
                </span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-400 uppercase block">Spin Sp</span>
                <span className="font-mono-num text-xs font-bold text-cyan-300">
                  {currentPreview.aerodynamics.spinFactorSp.toFixed(3)}
                </span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-400 uppercase block">Magnus Lift</span>
                <span className="font-mono-num text-xs font-bold text-white">
                  {currentPreview.aerodynamics.magnusLiftNewtons.toFixed(2)} N
                </span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-400 uppercase block">Drag Force</span>
                <span className="font-mono-num text-xs font-bold text-white">
                  {currentPreview.aerodynamics.dragForceNewtons.toFixed(2)} N
                </span>
              </div>
              <div className="bg-slate-950/70 p-2 rounded-lg border border-white/5">
                <span className="text-[9px] text-slate-400 uppercase block">Land Angle</span>
                <span className="font-mono-num text-xs font-bold text-amber-300">
                  {currentPreview.aerodynamics.landingAngleDeg.toFixed(1)}°
                </span>
              </div>
            </div>
            <div className="text-[10px] font-mono-num text-slate-400 flex items-center justify-between pt-1 border-t border-white/5">
              <span>Reynolds: {(currentPreview.aerodynamics.reynoldsNumber / 1000).toFixed(1)}k Re</span>
              <span>Lateral: {currentPreview.lateralYds > 0 ? 'R' : 'L'}{Math.abs(currentPreview.lateralYds).toFixed(1)} yds</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: SHOT HISTORY TELEMETRY LOG (Google Stitch + Engineering Telemetry) */}
      <div className="px-3 sm:px-4 pb-4">
        <div className="stitch-glass-panel rounded-2xl border border-white/10 p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <List className="w-3.5 h-3.5 text-emerald-400" />
              Shot History Telemetry ({flightShots.length})
            </h3>
            <div className="flex items-center gap-2">
              {flightShots.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportShotsCsv}
                  className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Export CSV</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClearFlightShots}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Clear Log
              </button>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-[11px] font-mono-num">
              <thead className="bg-slate-950/70 text-slate-400 font-semibold border-b border-white/5">
                <tr>
                  <th className="py-2 px-2">#</th>
                  <th className="py-2 px-2">Club</th>
                  <th className="py-2 px-2">Source</th>
                  <th className="py-2 px-2">Load</th>
                  <th className="py-2 px-2">Speed</th>
                  <th className="py-2 px-2">Launch</th>
                  <th className="py-2 px-2">Spin</th>
                  <th className="py-2 px-2">Carry</th>
                  <th className="py-2 px-2">Total</th>
                  <th className="py-2 px-2">Apex</th>
                  <th className="py-2 px-2">Shape</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {flightShots.length === 0 ? (
                  <tr className="text-slate-500 text-center">
                    <td colSpan={11} className="py-4 font-sans text-xs">
                      No swings recorded yet. Tap <strong>SWING NOW</strong> or analyze a Hub 1 video clip.
                    </td>
                  </tr>
                ) : (
                  flightShots.map((shot, idx) => (
                    <tr key={shot.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2 px-2 text-slate-400">#{flightShots.length - idx}</td>
                      <td className="py-2 px-2 font-sans font-semibold text-white">{shot.clubName}</td>
                      <td className="py-2 px-2 text-slate-300">
                        {shot.source === 'video_ai' ? 'Video AI' : 'Sim'}
                      </td>
                      <td className="py-2 px-2 text-amber-300">{shot.swingResistanceLbs.toFixed(2)}lb</td>
                      <td className="py-2 px-2 text-slate-300">{shot.clubSpeed.toFixed(0)} mph</td>
                      <td className="py-2 px-2 text-slate-300">{shot.launchAngle.toFixed(1)}°</td>
                      <td className="py-2 px-2 text-indigo-300">{shot.spinRate}</td>
                      <td className="py-2 px-2 text-emerald-400 font-bold">{shot.carry.toFixed(1)}y</td>
                      <td className="py-2 px-2 text-cyan-400 font-bold">{shot.total.toFixed(1)}y</td>
                      <td className="py-2 px-2 text-purple-300">{shot.apex.toFixed(1)}y</td>
                      <td className="py-2 px-2 text-amber-300 font-sans">{shot.flightShape}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
