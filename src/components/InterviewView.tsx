import React from 'react';
import { FOLLOW_UP_PROBES } from '../data/researchData';
import {
  Mic,
  Square,
  Pause,
  Play,
  ArrowRight,
  ArrowLeft,
  FileText,
  RotateCw,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface InterviewViewProps {
  cohortName: string;
  modeName: string;
  questions: string[];
  currentIndex: number;
  currentProbe: string;
  onSelectProbe: (probe: string) => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onGoToReview: () => void;
  // Recording state
  isRecording: boolean;
  isPaused: boolean;
  recordedSeconds: number;
  recordingStatusMessage: string;
  onToggleRecord: () => void;
  onTogglePause: () => void;
  // Notes
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const InterviewView: React.FC<InterviewViewProps> = ({
  cohortName,
  modeName,
  questions,
  currentIndex,
  currentProbe,
  onSelectProbe,
  onNextQuestion,
  onPrevQuestion,
  onGoToReview,
  isRecording,
  isPaused,
  recordedSeconds,
  recordingStatusMessage,
  onToggleRecord,
  onTogglePause,
  notes,
  onNotesChange,
}) => {
  const currentQuestion = questions[currentIndex] || 'No question available';
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getRecLabel = () => {
    if (isRecording) {
      return isPaused ? 'Paused' : 'Recording';
    }
    return recordedSeconds > 0 ? 'Stopped' : 'Ready';
  };

  const cycleProbe = () => {
    const currentIdx = FOLLOW_UP_PROBES.indexOf(currentProbe);
    const nextIdx = (currentIdx + 1) % FOLLOW_UP_PROBES.length;
    onSelectProbe(FOLLOW_UP_PROBES[nextIdx]);
  };

  const addNoteSnippet = (snippet: string) => {
    const separator = notes && !notes.endsWith('\n') ? '\n' : '';
    onNotesChange(notes + separator + snippet + ' ');
  };

  return (
    <div className="space-y-3.5">
      {/* Active Question Card */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        {/* Header cohort & mode */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2.5">
          <span className="truncate max-w-[240px] text-slate-700">{cohortName}</span>
          <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0">
            {modeName}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-emerald-800 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Counter */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {Math.round(progressPercent)}% complete
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-lg font-bold text-slate-900 leading-snug tracking-tight my-2.5 min-h-[56px]">
          {currentQuestion}
        </h2>

        {/* Follow-up probe section */}
        <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100/80">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              Follow-up probe
            </span>
            <button
              onClick={cycleProbe}
              className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline cursor-pointer"
              title="Next probe idea"
            >
              <RotateCw className="w-2.5 h-2.5" />
              <span>Next probe</span>
            </button>
          </div>
          <p className="text-xs font-medium text-emerald-950 italic">
            "{currentProbe}"
          </p>
        </div>

        {/* Question Navigation Controls */}
        <div className="flex items-center gap-2 mt-4">
          {currentIndex > 0 && (
            <button
              onClick={onPrevQuestion}
              className="px-3 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
          )}

          <button
            onClick={onNextQuestion}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete to Review'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={onGoToReview}
          className="w-full mt-2 py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Review & Notes</span>
        </button>
      </div>

      {/* Simulated Recording Card */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <div className="border border-slate-200/80 rounded-xl p-3 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Pulsing indicator dot */}
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
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>{getRecLabel()}</span>
                {isRecording && (
                  <span className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider">
                    ● LIVE
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                Recording is simulated for stakeholder testing.
              </div>
            </div>
          </div>

          <div className="font-mono text-base font-bold text-slate-900 tracking-tight bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            {formatTimer(recordedSeconds)}
          </div>
        </div>

        {/* Recording Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={onToggleRecord}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
              isRecording
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop recording</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-rose-600" />
                <span>Start recording</span>
              </>
            )}
          </button>

          <button
            onClick={onTogglePause}
            disabled={!isRecording}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
              !isRecording
                ? 'opacity-45 bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : isPaused
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 cursor-pointer'
                : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 cursor-pointer'
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
        </div>

        {/* Status Message */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-100/90 text-xs text-slate-700 leading-snug border border-slate-200/60">
          {recordingStatusMessage}
        </div>

        <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          <span>Tip: test Start → Pause → Resume → Next Question.</span>
        </div>
      </div>

      {/* Notes Card */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 tracking-wide uppercase">
            INTERVIEW NOTES
          </label>
          <span className="text-[11px] text-slate-400">
            {notes.length > 0 ? `${notes.length} chars` : 'Empty'}
          </span>
        </div>

        {/* Quick Observation Chips */}
        <div className="flex flex-wrap gap-1 mb-2">
          <button
            onClick={() => addNoteSnippet('[Quote]:')}
            className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
          >
            + Quote
          </button>
          <button
            onClick={() => addNoteSnippet('[Barrier]:')}
            className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
          >
            + Barrier
          </button>
          <button
            onClick={() => addNoteSnippet('[Current Tool]:')}
            className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
          >
            + Current Tool
          </button>
          <button
            onClick={() => addNoteSnippet('[Frustration]:')}
            className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
          >
            + Frustration
          </button>
        </div>

        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Capture observations, exact phrases, behaviors, frustrations, or follow-ups..."
          className="w-full min-h-[110px] p-3 border border-slate-300 rounded-xl text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 resize-y"
        />
      </div>
    </div>
  );
};
