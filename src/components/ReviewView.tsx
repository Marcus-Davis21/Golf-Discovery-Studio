import React from 'react';
import { CheckCircle2, ArrowLeft, Save, Mic, HelpCircle, FileText } from 'lucide-react';

interface ReviewViewProps {
  cohortName: string;
  modeName: string;
  questionsCovered: number;
  totalQuestions: number;
  recordedSeconds: number;
  isRecording: boolean;
  isPaused: boolean;
  notes: string;
  onSaveSession: () => void;
  onReturnToInterview: () => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  cohortName,
  modeName,
  questionsCovered,
  totalQuestions,
  recordedSeconds,
  isRecording,
  isPaused,
  notes,
  onSaveSession,
  onReturnToInterview,
}) => {
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getRecordingStatusText = () => {
    if (isRecording) {
      return isPaused ? `Paused (${formatTimer(recordedSeconds)})` : `Recording (${formatTimer(recordedSeconds)})`;
    }
    if (recordedSeconds > 0) {
      return `Stopped · ${formatTimer(recordedSeconds)} captured`;
    }
    return 'Not started';
  };

  return (
    <div className="space-y-3.5">
      <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Review & Submit</h3>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            Checkpoint
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Stakeholder test checkpoint · Validate research completeness before saving
        </p>

        {/* Stats Grid */}
        <div className="divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Cohort</span>
            <b className="font-semibold text-slate-900 text-right max-w-[200px] truncate">
              {cohortName || '—'}
            </b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Interview Mode</span>
            <b className="font-semibold text-slate-900">{modeName}</b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Questions covered</span>
            <b className="font-semibold text-slate-900">
              {questionsCovered} of {totalQuestions}
            </b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Recording status</span>
            <b className="font-semibold text-emerald-800">{getRecordingStatusText()}</b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Observations captured</span>
            <b className="font-semibold text-slate-900">
              {notes.trim().length > 0 ? `${notes.trim().split(/\s+/).length} words` : 'None logged'}
            </b>
          </div>
        </div>

        {/* Notes Preview */}
        {notes.trim().length > 0 && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wide">
              <FileText className="w-3 h-3 text-slate-500" />
              Researcher Notes Preview
            </div>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <button
            onClick={onSaveSession}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Discovery Session</span>
          </button>

          <button
            onClick={onReturnToInterview}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
