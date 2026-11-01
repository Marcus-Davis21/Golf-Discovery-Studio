import React, { useState, useEffect, useRef } from 'react';
import { RecordingMediaType } from '../types';
import {
  Video,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Camera,
  SwitchCamera,
  Download,
  AlertCircle,
  Volume2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface MediaRecorderStudioProps {
  mediaType: RecordingMediaType;
  onMediaTypeChange: (type: RecordingMediaType) => void;
  isRecording: boolean;
  isPaused: boolean;
  recordedSeconds: number;
  onStartRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onStopRecording: () => void;
  mediaBlobUrl?: string;
  onMediaRecorded?: (blobUrl: string, sizeKb: number) => void;
  cohortName: string;
  participantName?: string;
}

export const MediaRecorderStudio: React.FC<MediaRecorderStudioProps> = ({
  mediaType,
  onMediaTypeChange,
  isRecording,
  isPaused,
  recordedSeconds,
  onStartRecording,
  onPauseRecording,
  onResumeRecording,
  onStopRecording,
  mediaBlobUrl,
  onMediaRecorded,
  cohortName,
  participantName,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string>(mediaBlobUrl || '');
  const [recordedSizeKb, setRecordedSizeKb] = useState<number>(0);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const playbackVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Start hardware camera/microphone stream
  const startCameraStream = async (type: RecordingMediaType, facing: 'user' | 'environment') => {
    stopCurrentStream();
    setErrorMessage('');

    if (type === 'simulated') {
      setHasPermission(true);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video:
          type === 'video_voice'
            ? {
                facingMode: facing,
                width: { ideal: 640 },
                height: { ideal: 480 },
              }
            : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);

      if (videoPreviewRef.current && type === 'video_voice') {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }

      // Audio Level Visualizer
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkVolume = () => {
            if (analyserRef.current) {
              analyserRef.current.getByteFrequencyData(dataArray);
              const sum = dataArray.reduce((a, b) => a + b, 0);
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(checkVolume);
            }
          };
          checkVolume();
        }
      } catch (audioErr) {
        console.warn('Audio visualization not supported:', audioErr);
      }
    } catch (err: any) {
      console.warn('Media devices access error:', err);
      setHasPermission(false);
      setErrorMessage(
        'Camera/Mic permission not available or denied. Switched to high-fidelity simulated recording.'
      );
      onMediaTypeChange('simulated');
    }
  };

  const stopCurrentStream = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  // Re-initialize stream when media type or camera changes
  useEffect(() => {
    startCameraStream(mediaType, facingMode);
    return () => {
      stopCurrentStream();
    };
  }, [mediaType, facingMode]);

  // Handle Recording Trigger
  const handleStartRealRecording = () => {
    if (mediaType === 'simulated' || !streamRef.current) {
      onStartRecording();
      return;
    }

    try {
      chunksRef.current = [];
      const options: MediaRecorderOptions = {};
      if (mediaType === 'video_voice') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
          options.mimeType = 'video/webm;codecs=vp8,opus';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          options.mimeType = 'video/mp4';
        }
      } else {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          options.mimeType = 'audio/webm;codecs=opus';
        }
      }

      const recorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const mime = options.mimeType || (mediaType === 'video_voice' ? 'video/webm' : 'audio/webm');
        const blob = new Blob(chunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        const sizeKb = Math.round(blob.size / 1024);
        setRecordedVideoUrl(url);
        setRecordedSizeKb(sizeKb);
        if (onMediaRecorded) {
          onMediaRecorded(url, sizeKb);
        }
      };

      recorder.start(1000); // 1-second time slices
      onStartRecording();
    } catch (e) {
      console.warn('Real MediaRecorder start failed, falling back to simulated:', e);
      onStartRecording();
    }
  };

  const handleStopRealRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recorder', e);
      }
    }
    onStopRecording();
  };

  const handlePauseRealRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    onPauseRecording();
  };

  const handleResumeRealRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    onResumeRecording();
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-3.5 sm:p-4 bg-white shadow-xs">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">
              Cohort Video & Voice Studio
            </h3>
            <p className="text-[10px] text-slate-500">
              Laptop & Mobile · {cohortName}
            </p>
          </div>
        </div>

        {/* Media Mode Selector */}
        <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-[10px] font-semibold">
          <button
            type="button"
            onClick={() => onMediaTypeChange('video_voice')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              mediaType === 'video_voice'
                ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>Video & Voice</span>
          </button>

          <button
            type="button"
            onClick={() => onMediaTypeChange('voice_only')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              mediaType === 'voice_only'
                ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mic className="w-3 h-3" />
            <span>Voice Only</span>
          </button>

          <button
            type="button"
            onClick={() => onMediaTypeChange('simulated')}
            className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              mediaType === 'simulated'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Simulated</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Video Viewfinder / Live Feed Display */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video sm:aspect-16/9 flex items-center justify-center text-white shadow-inner">
        {mediaType === 'video_voice' ? (
          <>
            <video
              ref={videoPreviewRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
            />
            {/* Viewfinder Overlay */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-semibold border border-white/20">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRecording && !isPaused
                    ? 'bg-rose-500 animate-pulse'
                    : isRecording && isPaused
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
              />
              <span>
                {isRecording
                  ? isPaused
                    ? 'PAUSED'
                    : 'REC'
                  : 'LIVE PREVIEW'}
              </span>
            </div>

            {/* Mobile Camera Flip Button */}
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="absolute top-2.5 right-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-xs p-1.5 rounded-full text-white/90 border border-white/20 transition-all cursor-pointer"
              title="Flip Camera (Front / Back)"
            >
              <SwitchCamera className="w-3.5 h-3.5" />
            </button>
          </>
        ) : mediaType === 'voice_only' ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                isRecording && !isPaused
                  ? 'bg-rose-600/30 text-rose-400 ring-4 ring-rose-500/40 animate-pulse'
                  : 'bg-slate-800 text-emerald-400'
              }`}
            >
              <Mic className="w-7 h-7" />
            </div>
            <div className="text-xs font-bold text-slate-200">
              {participantName ? `Voice Recording: ${participantName}` : `Cohort Voice Session`}
            </div>
            <div className="text-[10px] text-slate-400">High-fidelity voice audio capture active</div>
          </div>
        ) : (
          /* Simulated Video Preview with Golfer Avatar */
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 relative w-full h-full bg-linear-to-b from-slate-800 to-slate-950">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-lg">
              ⛳
            </div>
            <div className="text-xs font-bold text-white">
              {participantName || cohortName}
            </div>
            <div className="text-[10px] text-slate-400">
              Simulated Video & Voice Viewfinder for Stakeholder Walkthrough
            </div>
          </div>
        )}

        {/* Live Audio Level Meter Bar at Bottom of Video */}
        {mediaType !== 'simulated' && (
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/10 text-[10px]">
            <Volume2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-75 rounded-full"
                style={{ width: `${Math.max(8, audioLevel)}%` }}
              />
            </div>
            <span className="font-mono text-[9px] text-slate-300 shrink-0">MIC OK</span>
          </div>
        )}
      </div>

      {/* Timer and Status Bar */}
      <div className="flex items-center justify-between gap-3 mt-3 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-3.5 h-3.5">
            {isRecording && !isPaused && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isRecording
                  ? isPaused
                    ? 'bg-amber-500'
                    : 'bg-rose-600 shadow-xs'
                  : recordedSeconds > 0
                  ? 'bg-slate-600'
                  : 'bg-slate-400'
              }`}
            />
          </div>

          <div>
            <div className="text-xs font-bold text-slate-900">
              {isRecording
                ? isPaused
                  ? 'Recording Paused'
                  : 'Interview Live'
                : recordedSeconds > 0
                ? 'Recording Completed'
                : 'Ready to Record'}
            </div>
            <div className="text-[10px] text-slate-500">
              {mediaType === 'video_voice' ? 'Video + Audio stream' : mediaType === 'voice_only' ? 'Audio stream' : 'Simulated stream'}
            </div>
          </div>
        </div>

        <div className="font-mono text-base font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 tracking-tight">
          {formatTimer(recordedSeconds)}
        </div>
      </div>

      {/* Recording Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={handleStartRealRecording}
            className="col-span-2 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-emerald-200" />
            <span>Start {mediaType === 'video_voice' ? 'Video & Voice' : 'Voice'} Recording</span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleStopRealRecording}
              className="py-2.5 px-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop & Save Media</span>
            </button>

            <button
              type="button"
              onClick={isPaused ? handleResumeRealRecording : handlePauseRealRecording}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isPaused
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Recorded Media Preview (if available) */}
      {recordedVideoUrl && (
        <div className="mt-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2 animate-fadeIn text-xs">
          <div className="flex items-center justify-between font-bold text-emerald-950 text-[11px]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Recorded Interview Media Ready</span>
            </span>
            {recordedSizeKb > 0 && (
              <span className="font-mono text-[10px] text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {recordedSizeKb > 1024 ? `${(recordedSizeKb / 1024).toFixed(1)} MB` : `${recordedSizeKb} KB`}
              </span>
            )}
          </div>

          {mediaType === 'video_voice' ? (
            <video
              ref={playbackVideoRef}
              src={recordedVideoUrl}
              controls
              className="w-full rounded-lg max-h-48 bg-black object-contain"
            />
          ) : (
            <audio src={recordedVideoUrl} controls className="w-full mt-1" />
          )}

          <div className="flex items-center justify-end pt-1">
            <a
              href={recordedVideoUrl}
              download={`cohort-${cohortName.toLowerCase().replace(/\s+/g, '-')}-interview-${Date.now()}.${mediaType === 'video_voice' ? 'webm' : 'webm'}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline"
            >
              <Download className="w-3 h-3" />
              <span>Download Media File</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
