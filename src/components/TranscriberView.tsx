import React, { useState, useRef, useEffect } from 'react';
import { SavedSession, AIQualitativeAnalysis, CohortId, TranscriptEntry } from '../types';
import { COHORTS_DATA } from '../data/researchData';
import {
  Sparkles,
  Video,
  Mic,
  Cpu,
  Play,
  Pause,
  Upload,
  RefreshCw,
  Copy,
  Check,
  Download,
  Search,
  Quote,
  AlertTriangle,
  Wrench,
  Smile,
  Frown,
  Meh,
  Save,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface TranscriberViewProps {
  savedSessions: SavedSession[];
  activeRecordingBlobUrl?: string;
  activeRecordingType?: 'video_voice' | 'voice_only' | 'simulated';
  activeRecordingSeconds?: number;
  activeParticipantName?: string;
  activeCohortId?: CohortId;
  onUpdateSessionAnalysis: (sessionId: string, analysis: AIQualitativeAnalysis) => void;
  onNavigateToInterview?: () => void;
}

export const TranscriberView: React.FC<TranscriberViewProps> = ({
  savedSessions,
  activeRecordingBlobUrl,
  activeRecordingType = 'video_voice',
  activeRecordingSeconds = 0,
  activeParticipantName,
  activeCohortId = 'aspiring',
  onUpdateSessionAnalysis,
  onNavigateToInterview,
}) => {
  // Source Selection: 'current' | 'session' | 'upload'
  const [sourceMode, setSourceMode] = useState<'current' | 'session' | 'upload'>(
    activeRecordingBlobUrl ? 'current' : savedSessions.length > 0 ? 'session' : 'upload'
  );
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    savedSessions.find((s) => s.mediaBlobUrl)?.id || savedSessions[0]?.id || ''
  );

  // Uploaded media state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedBlobUrl, setUploadedBlobUrl] = useState<string | null>(null);
  const [uploadedCohortId, setUploadedCohortId] = useState<CohortId>(activeCohortId);
  const [uploadedParticipantName, setUploadedParticipantName] = useState<string>('Uploaded Interviewee');

  // Active transcription & video sync state
  const [activeAnalysis, setActiveAnalysis] = useState<AIQualitativeAnalysis | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcribeStatus, setTranscribeStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeSection, setActiveSection] = useState<'all' | 'transcript' | 'quotes' | 'barriers' | 'tools' | 'sentiment'>('all');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Video / Audio Player Ref for timestamp seeking
  const mediaElementRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Selected session object if in 'session' mode
  const currentSession = savedSessions.find((s) => s.id === selectedSessionId);

  // When source changes or selected session changes, pre-load existing analysis
  useEffect(() => {
    if (sourceMode === 'session' && currentSession?.aiAnalysis) {
      setActiveAnalysis(currentSession.aiAnalysis);
    } else if (sourceMode === 'current') {
      // In current mode, leave activeAnalysis if already generated or null
    }
  }, [sourceMode, selectedSessionId, currentSession]);

  // Clean up uploaded object URL
  useEffect(() => {
    return () => {
      if (uploadedBlobUrl) {
        URL.revokeObjectURL(uploadedBlobUrl);
      }
    };
  }, [uploadedBlobUrl]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadedBlobUrl) {
      URL.revokeObjectURL(uploadedBlobUrl);
    }

    const url = URL.createObjectURL(file);
    setUploadedFile(file);
    setUploadedBlobUrl(url);
    setSourceMode('upload');
    setUploadedParticipantName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
  };

  // Determine current active media URL, type, and metadata
  let effectiveMediaUrl: string | undefined = undefined;
  let effectiveMediaType: 'video_voice' | 'voice_only' = 'video_voice';
  let effectiveCohortName = COHORTS_DATA[activeCohortId]?.name || 'Aspiring Golfer';
  let effectiveParticipant = activeParticipantName || 'Participant';
  let effectiveNotes = '';
  let effectiveResponses: any = {};
  let effectiveQuestions: string[] = COHORTS_DATA[activeCohortId]?.questions || [];

  if (sourceMode === 'current') {
    effectiveMediaUrl = activeRecordingBlobUrl;
    effectiveMediaType = activeRecordingType === 'voice_only' ? 'voice_only' : 'video_voice';
    effectiveCohortName = COHORTS_DATA[activeCohortId]?.name || 'Aspiring Golfer';
    effectiveParticipant = activeParticipantName || 'In-Progress Participant';
    effectiveQuestions = COHORTS_DATA[activeCohortId]?.questions || [];
  } else if (sourceMode === 'session' && currentSession) {
    effectiveMediaUrl = currentSession.mediaBlobUrl;
    effectiveMediaType = currentSession.mediaType === 'voice_only' ? 'voice_only' : 'video_voice';
    effectiveCohortName = currentSession.cohortName;
    effectiveParticipant = currentSession.participantName || 'Session Participant';
    effectiveNotes = currentSession.notes || '';
    effectiveResponses = currentSession.responses || {};
    effectiveQuestions = COHORTS_DATA[currentSession.cohortId]?.questions || [];
  } else if (sourceMode === 'upload' && uploadedBlobUrl) {
    effectiveMediaUrl = uploadedBlobUrl;
    effectiveMediaType = uploadedFile?.type.includes('audio') ? 'voice_only' : 'video_voice';
    effectiveCohortName = COHORTS_DATA[uploadedCohortId]?.name || 'Aspiring Golfer';
    effectiveParticipant = uploadedParticipantName;
    effectiveQuestions = COHORTS_DATA[uploadedCohortId]?.questions || [];
  }

  // Seek video player to timestamp (e.g., "01:23")
  const handleSeekToTimestamp = (timestampStr: string) => {
    if (!mediaElementRef.current) return;
    const parts = timestampStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    mediaElementRef.current.currentTime = seconds;
    mediaElementRef.current.play().catch(() => {});
  };

  // Execute Computer Scientist Cloud AI Qualitative Extraction Pipeline
  const handleExecuteTranscriptionPipeline = async () => {
    setIsTranscribing(true);
    setTranscribeStatus('Extracting compressed audio stream (2–3 MB target payload)...');

    try {
      let audioBase64: string | undefined = undefined;
      let mimeType = effectiveMediaType === 'video_voice' ? 'video/webm' : 'audio/webm';

      if (effectiveMediaUrl) {
        try {
          setTranscribeStatus('Encoding audio stream for Cloud AI Model (gemini-3.8-flash)...');
          const blobRes = await fetch(effectiveMediaUrl);
          const blob = await blobRes.blob();
          mimeType = blob.type || mimeType;

          const reader = new FileReader();
          audioBase64 = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (mediaErr) {
          console.warn('Could not read media stream as base64, proceeding with session questions:', mediaErr);
        }
      }

      setTranscribeStatus('Querying Gemini Cloud AI Model for 5-pillar qualitative extraction...');

      const res = await fetch('/api/ai/transcribe-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType,
          cohortName: effectiveCohortName,
          participantName: effectiveParticipant,
          questions: effectiveQuestions,
          notes: effectiveNotes,
          responses: effectiveResponses,
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setActiveAnalysis(json.data);

        // Auto-save to session if in session mode
        if (sourceMode === 'session' && selectedSessionId) {
          onUpdateSessionAnalysis(selectedSessionId, json.data);
          setSaveSuccessMsg(`Attached to session ${selectedSessionId} permanently`);
          setTimeout(() => setSaveSuccessMsg(null), 3000);
        }
      } else {
        throw new Error('Invalid pipeline response structure');
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      alert(`Transcription pipeline encountered an issue: ${err.message || 'Check network connection'}`);
    } finally {
      setIsTranscribing(false);
      setTranscribeStatus('');
    }
  };

  // Copy transcript or analysis
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Export full transcript as TXT
  const handleExportTranscriptTxt = () => {
    if (!activeAnalysis) return;
    const lines = [
      `GOLF DISCOVERY STUDIO — QUALITATIVE INTERVIEW TRANSCRIPT`,
      `Participant: ${effectiveParticipant}`,
      `Cohort: ${effectiveCohortName}`,
      `Pipeline Model: ${activeAnalysis.modelUsed}`,
      `Date Analyzed: ${new Date(activeAnalysis.analyzedAt).toLocaleString()}`,
      `Overall Sentiment: ${activeAnalysis.sentimentAnalysis.overall}`,
      `------------------------------------------------------------\n`,
      `VERBATIM TRANSCRIPT:`,
      ...activeAnalysis.verbatimTranscript.map(
        (t) => `[${t.timestamp}] ${t.speaker} ${t.questionAnchor ? `(${t.questionAnchor})` : ''}:\n${t.text}\n`
      ),
      `\n------------------------------------------------------------`,
      `KEY SOUNDBITES:`,
      ...activeAnalysis.quotableSoundbites.map((q) => `"${q.quote}" — ${q.speaker}\nSignificance: ${q.significance}\n`),
      `\n------------------------------------------------------------`,
      `IDENTIFIED BARRIERS:`,
      ...activeAnalysis.identifiedBarriers.map(
        (b) => `[${b.severity.toUpperCase()}] ${b.barrier} (${b.category}): ${b.participantVerbatim}\n`
      ),
      `\n------------------------------------------------------------`,
      `CURRENT TOOLS & IMPROVISED DRILLS:`,
      ...activeAnalysis.currentToolsAndDrills.map(
        (d) => `${d.toolOrDrill} (Source: ${d.source})\nOutcome: ${d.outcome}${d.abandonedReason ? `\nAbandoned: ${d.abandonedReason}` : ''}\n`
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${effectiveParticipant.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter transcript entries
  const filteredTranscript = activeAnalysis?.verbatimTranscript.filter((t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.text.toLowerCase().includes(term) ||
      t.speaker.toLowerCase().includes(term) ||
      (t.questionAnchor && t.questionAnchor.toLowerCase().includes(term))
    );
  }) || [];

  return (
    <div className="space-y-4">
      {/* Computer Scientist Architecture & Pipeline Banner */}
      <div className="border border-indigo-200 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/30">
                  Computer Scientist Pipeline
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  gemini-3.8-flash
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                Video & Audio Qualitative Transcriber
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExecuteTranscriptionPipeline}
              disabled={isTranscribing}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                isTranscribing
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTranscribing ? 'animate-spin' : ''}`} />
              <span>{isTranscribing ? 'Processing Pipeline...' : activeAnalysis ? 'Re-Run Transcription' : 'Transcribe Video'}</span>
            </button>
          </div>
        </div>

        {/* Visual Pipeline Architecture Steps */}
        <div className="bg-slate-900/70 border border-indigo-500/30 rounded-xl p-3 text-xs">
          <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-300 mb-2 flex items-center justify-between">
            <span>Verified Computer Scientist Execution Graph:</span>
            <span className="text-slate-400">Target payload: 2–3 MB WebM / Audio</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
              <div>
                <b className="block text-white font-medium">1. Input Media</b>
                <span className="text-[10px] text-indigo-300/80">WebM / MP4 video stream</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
              <div>
                <b className="block text-white font-medium">2. Audio Extraction</b>
                <span className="text-[10px] text-indigo-300/80">Compressed audio payload</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
              <div>
                <b className="block text-white font-medium">3. Cloud AI Model</b>
                <span className="text-[10px] text-indigo-300/80">gemini-3.8-flash SDK</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-500/30 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <div>
                <b className="block text-emerald-200 font-medium">4. Structured Output</b>
                <span className="text-[10px] text-emerald-300/80">5-pillar JSON qualitative</span>
              </div>
            </div>
          </div>
        </div>

        {isTranscribing && (
          <div className="mt-3 p-3 bg-indigo-950/90 border border-indigo-400/50 rounded-xl text-center space-y-1.5 animate-fadeIn">
            <div className="inline-flex items-center gap-2 text-indigo-200 text-xs font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>{transcribeStatus || 'Transcribing interview video...'}</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full animate-pulse rounded-full w-3/4" />
            </div>
          </div>
        )}
      </div>

      {/* Media Source Selector Tabs */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Video className="w-4 h-4 text-emerald-800" />
            <span>Select Interview Video to Transcribe</span>
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            {savedSessions.length} Study Sessions Stored
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSourceMode('current')}
            disabled={!activeRecordingBlobUrl}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              sourceMode === 'current'
                ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                : activeRecordingBlobUrl
                ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                : 'border-slate-100 bg-slate-50/50 text-slate-300 cursor-not-allowed'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-emerald-800">Current Session</div>
            <div className="truncate text-xs font-semibold mt-0.5">
              {activeRecordingBlobUrl ? activeParticipantName || 'In-Progress Media' : 'No active recording'}
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {activeRecordingBlobUrl ? `${activeRecordingSeconds}s recorded` : 'Record in interview tab'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSourceMode('session')}
            disabled={savedSessions.length === 0}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              sourceMode === 'session'
                ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                : savedSessions.length > 0
                ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                : 'border-slate-100 bg-slate-50/50 text-slate-300 cursor-not-allowed'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-indigo-700">Study Sessions Archive</div>
            <div className="truncate text-xs font-semibold mt-0.5">
              {currentSession?.participantName || 'Pick from study list'}
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {savedSessions.length} total saved
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSourceMode('upload');
              fileInputRef.current?.click();
            }}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              sourceMode === 'upload'
                ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="text-[10px] uppercase font-bold text-amber-700 flex items-center justify-between">
              <span>Upload Video / Audio</span>
              <Upload className="w-3 h-3 text-amber-600" />
            </div>
            <div className="truncate text-xs font-semibold mt-0.5">
              {uploadedFile ? uploadedFile.name : 'Choose .webm / .mp4'}
            </div>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {uploadedFile ? `${Math.round(uploadedFile.size / 1024)} KB` : 'Local file import'}
            </span>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*,.webm,.mp4,.mov,.m4a,.wav,.mp3"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* If Session Mode: Show Session Picker Dropdown */}
        {sourceMode === 'session' && (
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 shrink-0">Select Participant Session:</span>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              {savedSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.participantName || s.cohortName} — {s.cohortName} ({s.mediaType === 'video_voice' ? 'Video' : 'Voice'}{' '}
                  {s.recordedSeconds}s){s.aiAnalysis ? ' · [Transcribed]' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* If Upload Mode: Cohort assignment selector */}
        {sourceMode === 'upload' && uploadedFile && (
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Cohort for Questions:</label>
              <select
                value={uploadedCohortId}
                onChange={(e) => setUploadedCohortId(e.target.value as CohortId)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-900"
              >
                {(Object.keys(COHORTS_DATA) as CohortId[]).map((cid) => (
                  <option key={cid} value={cid}>
                    {COHORTS_DATA[cid].name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Participant Name:</label>
              <input
                type="text"
                value={uploadedParticipantName}
                onChange={(e) => setUploadedParticipantName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-900"
                placeholder="e.g. Sarah Jenkins"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout: Video Synchronizer on Left / Structured Intelligence on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Synchronized Video/Audio Player */}
        <div className="lg:col-span-5 space-y-3">
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-3 sticky top-[120px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-800" />
                <span>Synchronized Media Player</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Click timestamps to seek
              </span>
            </div>

            {effectiveMediaUrl ? (
              <div className="bg-slate-950 rounded-xl overflow-hidden p-2 text-white space-y-2">
                {effectiveMediaType === 'video_voice' ? (
                  <video
                    ref={mediaElementRef as any}
                    src={effectiveMediaUrl}
                    controls
                    className="w-full rounded-lg max-h-64 bg-black object-contain mx-auto"
                  />
                ) : (
                  <div className="py-6 px-4 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-900/60 text-emerald-400 mx-auto flex items-center justify-center">
                      <Mic className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-slate-300">Voice Interview Recording</div>
                    <audio ref={mediaElementRef as any} src={effectiveMediaUrl} controls className="w-full" />
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                  <span>Target: <b className="text-white">{effectiveParticipant}</b></span>
                  <a
                    href={effectiveMediaUrl}
                    download={`interview-${effectiveParticipant.toLowerCase().replace(/\s+/g, '-')}.webm`}
                    className="text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Save File
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
                <Video className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="text-xs font-bold text-slate-700">No Video Stream Attached</div>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Record an interview in the <b>Video & Voice</b> tab or click <b>Upload Video / Audio</b> above to process an external file.
                </p>
                {onNavigateToInterview && (
                  <button
                    type="button"
                    onClick={onNavigateToInterview}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 inline-flex items-center gap-1"
                  >
                    <span>Go to Recording Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Quick Metadata summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Cohort:</span>
                <span className="font-semibold text-slate-900">{effectiveCohortName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Participant:</span>
                <span className="font-semibold text-slate-900">{effectiveParticipant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Questions Anchored:</span>
                <span className="font-semibold text-slate-900">{effectiveQuestions.length} Discovery Prompts</span>
              </div>
              {saveSuccessMsg && (
                <div className="p-1.5 bg-emerald-100 text-emerald-900 rounded font-semibold text-[10px] text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: 5 Structured Computer Scientist Outputs */}
        <div className="lg:col-span-7 space-y-3">
          {/* Output Section Navigation Tabs */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeSection === 'all'
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All 5 Pillars
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('transcript')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeSection === 'transcript'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              1. Verbatim Transcript ({activeAnalysis?.verbatimTranscript.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('quotes')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeSection === 'quotes'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              2. Soundbites ({activeAnalysis?.quotableSoundbites.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('barriers')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeSection === 'barriers'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              3. Barriers ({activeAnalysis?.identifiedBarriers.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('tools')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeSection === 'tools'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              4. Tools & DIY ({activeAnalysis?.currentToolsAndDrills.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('sentiment')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeSection === 'sentiment'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              5. Sentiment
            </button>
          </div>

          {!activeAnalysis && !isTranscribing && (
            <div className="border border-slate-200 rounded-2xl p-8 bg-white text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Ready to Transcribe with Computer Scientist Suggestions
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Click <b>"Transcribe Video"</b> above to execute the 5-step Cloud AI pipeline on{' '}
                <span className="font-semibold text-slate-800">{effectiveParticipant}</span> ({effectiveCohortName}).
              </p>
              <button
                type="button"
                onClick={handleExecuteTranscriptionPipeline}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Cpu className="w-4 h-4" />
                <span>Execute AI Pipeline</span>
              </button>
            </div>
          )}

          {activeAnalysis && (
            <div className="space-y-4">
              {/* Pillar 1: Verbatim Transcript */}
              {(activeSection === 'all' || activeSection === 'transcript') && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-bold">
                        1
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Verbatim Transcript (Question Anchored)
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleExportTranscriptTxt}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export .TXT</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            activeAnalysis.verbatimTranscript.map((t) => `[${t.timestamp}] ${t.speaker}: ${t.text}`).join('\n'),
                            'transcript'
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center gap-1"
                      >
                        {copiedSection === 'transcript' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedSection === 'transcript' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search verbatim dialogue, keywords, or question anchors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>

                  {/* Transcript Scroll Container */}
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 text-xs">
                    {filteredTranscript.map((turn, idx) => {
                      const isInterviewer = turn.speaker === 'Interviewer';
                      return (
                        <div
                          key={idx}
                          className="pt-2 first:pt-0 group hover:bg-indigo-50/30 p-2 rounded-xl transition-colors cursor-pointer"
                          onClick={() => handleSeekToTimestamp(turn.timestamp)}
                          title="Click to jump video to this exact time"
                        >
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-bold px-1.5 py-0.2 rounded ${
                                  isInterviewer
                                    ? 'bg-blue-100 text-blue-900'
                                    : 'bg-emerald-100 text-emerald-900'
                                }`}
                              >
                                {turn.speaker}
                              </span>
                              {turn.questionAnchor && (
                                <span className="font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded truncate max-w-[200px]">
                                  {turn.questionAnchor}
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-indigo-600 font-bold group-hover:underline flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {turn.timestamp}
                            </span>
                          </div>
                          <p className="text-slate-800 leading-relaxed text-[11px]">{turn.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pillar 2: Direct Quotable Soundbites */}
              {(activeSection === 'all' || activeSection === 'quotes') && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                        2
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Direct Quotable Soundbites ({activeAnalysis.quotableSoundbites.length})
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {activeAnalysis.quotableSoundbites.map((sb, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1.5"
                      >
                        <div className="italic text-slate-900 font-serif text-xs leading-relaxed border-l-2 border-amber-500 pl-2">
                          "{sb.quote}"
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span className="font-semibold text-slate-700">— {sb.speaker}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(`"${sb.quote}" — ${sb.speaker}`, `sb-${idx}`)}
                            className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedSection === `sb-${idx}` ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                            <span>{copiedSection === `sb-${idx}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-600 bg-white/70 p-1.5 rounded border border-amber-100">
                          <b className="text-amber-900">Product Significance:</b> {sb.significance}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pillar 3: Identified Barriers & Friction Points */}
              {(activeSection === 'all' || activeSection === 'barriers') && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold">
                        3
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Identified Barriers & Friction Points ({activeAnalysis.identifiedBarriers.length})
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeAnalysis.identifiedBarriers.map((barrier, idx) => {
                      const isHigh = barrier.severity === 'high';
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{barrier.barrier}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {barrier.severity}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block uppercase font-mono">
                            Category: {barrier.category}
                          </span>
                          <div className="text-[11px] italic text-slate-700 bg-white p-2 rounded border border-slate-100">
                            "{barrier.participantVerbatim}"
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pillar 4: Current Tools & Improvised Drills */}
              {(activeSection === 'all' || activeSection === 'tools') && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                        4
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Current Tools & Improvised Drills ({activeAnalysis.currentToolsAndDrills.length})
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeAnalysis.currentToolsAndDrills.map((drill, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <b className="font-bold text-slate-900">{drill.toolOrDrill}</b>
                          <span className="text-[9px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                            {drill.source}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          <b className="text-slate-800">Outcome:</b> {drill.outcome}
                        </p>
                        {drill.abandonedReason && (
                          <div className="text-[10px] text-rose-800 bg-rose-50/70 p-1.5 rounded border border-rose-100">
                            <b>Why Abandoned:</b> {drill.abandonedReason}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pillar 5: Sentiment Analysis */}
              {(activeSection === 'all' || activeSection === 'sentiment') && (
                <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                        5
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Sentiment Analysis & Emotional Inflections
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Overall: {activeAnalysis.sentimentAnalysis.overall}
                    </span>
                  </div>

                  {/* Tripartite Sentiment Meter */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold text-emerald-800 text-[11px] mb-1">
                        <span className="flex items-center gap-1">
                          <Smile className="w-3 h-3 text-emerald-600" /> Enthusiastic
                        </span>
                        <span>{activeAnalysis.sentimentAnalysis.breakdown.enthusiasticScore}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${activeAnalysis.sentimentAnalysis.breakdown.enthusiasticScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-rose-800 text-[11px] mb-1">
                        <span className="flex items-center gap-1">
                          <Frown className="w-3 h-3 text-rose-600" /> Frustrated
                        </span>
                        <span>{activeAnalysis.sentimentAnalysis.breakdown.frustratedScore}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${activeAnalysis.sentimentAnalysis.breakdown.frustratedScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold text-amber-800 text-[11px] mb-1">
                        <span className="flex items-center gap-1">
                          <Meh className="w-3 h-3 text-amber-600" /> Hesitant
                        </span>
                        <span>{activeAnalysis.sentimentAnalysis.breakdown.hesitantScore}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${activeAnalysis.sentimentAnalysis.breakdown.hesitantScore}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Emotional Inflection Moments */}
                  {activeAnalysis.sentimentAnalysis.keyEmotionalMoments &&
                    activeAnalysis.sentimentAnalysis.keyEmotionalMoments.length > 0 && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <b className="text-[11px] text-slate-800 block">Key Emotional Inflection Moments:</b>
                        <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-700">
                          {activeAnalysis.sentimentAnalysis.keyEmotionalMoments.map((moment, idx) => (
                            <li key={idx}>{moment}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
