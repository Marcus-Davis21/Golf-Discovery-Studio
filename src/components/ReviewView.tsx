import React, { useState } from 'react';
import { Participant, QuestionResponse, RecordingMediaType, AIQualitativeAnalysis } from '../types';
import { AIQualitativePanel } from './AIQualitativePanel';
import {
  CheckCircle2,
  ArrowLeft,
  Save,
  Send,
  FileText,
  User,
  Quote,
  ChevronDown,
  ChevronUp,
  HardDrive,
  Mail,
  Video,
  Mic,
  Download,
  Sparkles,
  ChevronRight,
  Layers,
} from 'lucide-react';

interface ReviewViewProps {
  cohortName: string;
  modeName: string;
  questionsCovered: number;
  totalQuestions: number;
  recordedSeconds: number;
  isRecording: boolean;
  isPaused: boolean;
  mediaType: RecordingMediaType;
  mediaBlobUrl?: string;
  mediaSizeKb?: number;
  notes: string;
  responses?: Record<number, QuestionResponse>;
  activeParticipant?: Participant | null;
  storageEmail?: string;
  // Computer Scientist AI Pipeline Props
  aiAnalysis?: AIQualitativeAnalysis;
  onRunAIAnalysis: () => Promise<void> | void;
  isLoadingAIAnalysis: boolean;
  onSaveSession: (dispatchEmail?: boolean) => void;
  onReturnToInterview: () => void;
  onNavigateToTranscribe?: () => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  cohortName,
  modeName,
  questionsCovered,
  totalQuestions,
  recordedSeconds,
  isRecording,
  isPaused,
  mediaType,
  mediaBlobUrl,
  mediaSizeKb,
  notes,
  responses = {},
  activeParticipant,
  storageEmail = 'research-archive@golfdiscovery.org',
  aiAnalysis,
  onRunAIAnalysis,
  isLoadingAIAnalysis,
  onSaveSession,
  onReturnToInterview,
  onNavigateToTranscribe,
}) => {
  const [showFullResponses, setShowFullResponses] = useState(false);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const answeredList = Object.values(responses).filter((r) => r.answer?.trim());
  const quotesList = Object.values(responses).filter((r) => r.quote?.trim());

  return (
    <div className="space-y-4">
      {/* Session Verification Overview Card */}
      <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Review & Verify Cohort Session
          </h3>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            Target 25 / Cohort
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Verify participant observations, recorded media, and AI qualitative intelligence before committing to {cohortName} archives
        </p>

        {/* Video / Voice Preview if recorded */}
        {mediaBlobUrl && (
          <div className="mb-4 p-3 bg-slate-900 rounded-2xl text-white space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5">
                {mediaType === 'video_voice' ? <Video className="w-3.5 h-3.5 text-emerald-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                <span>Recorded {mediaType === 'video_voice' ? 'Video & Voice' : 'Voice'} Media</span>
              </span>
              <span className="font-mono text-[10px] text-slate-300">
                {formatTimer(recordedSeconds)} {mediaSizeKb ? `· ${mediaSizeKb > 1024 ? `${(mediaSizeKb / 1024).toFixed(1)} MB` : `${mediaSizeKb} KB`}` : ''}
              </span>
            </div>

            {mediaType === 'video_voice' ? (
              <video src={mediaBlobUrl} controls className="w-full rounded-xl max-h-52 bg-black object-contain" />
            ) : (
              <audio src={mediaBlobUrl} controls className="w-full" />
            )}

            <div className="flex items-center justify-between text-[11px] pt-1">
              {onNavigateToTranscribe ? (
                <button
                  type="button"
                  onClick={onNavigateToTranscribe}
                  className="text-[10px] font-bold text-emerald-300 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Open in Synchronized Video Transcriber</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              ) : <div />}

              <a
                href={mediaBlobUrl}
                download={`interview-${cohortName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.webm`}
                className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 underline"
              >
                <Download className="w-3 h-3" />
                <span>Save Local Copy</span>
              </a>
            </div>
          </div>
        )}

        {/* Participant & Session Details */}
        <div className="divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Participant</span>
            <b className="font-semibold text-slate-900 flex items-center gap-1.5">
              {activeParticipant ? (
                <>
                  <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                    {activeParticipant.id}
                  </span>
                  <span>{activeParticipant.name}</span>
                </>
              ) : (
                'Ad-Hoc Participant'
              )}
            </b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Specific Cohort</span>
            <b className="font-semibold text-slate-900 text-right max-w-[200px] truncate">
              {cohortName}
            </b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Interview Mode</span>
            <b className="font-semibold text-slate-900">{modeName}</b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Media Recording Mode</span>
            <b className="font-semibold text-emerald-800 capitalize">
              {mediaType.replace('_', ' ')}
            </b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Question Responses Logged</span>
            <b className="font-bold text-emerald-800">
              {answeredList.length} of {totalQuestions} answered
            </b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Verbatim Quotes Tagged</span>
            <b className="font-semibold text-slate-900">{quotesList.length} quotes</b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Recorded Media Duration</span>
            <b className="font-semibold text-slate-900 font-mono">{formatTimer(recordedSeconds)}</b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Storage Destination</span>
            <span className="font-mono text-[11px] text-slate-700 font-semibold truncate max-w-[190px]">
              {storageEmail}
            </span>
          </div>
        </div>

        {/* Quotes Highlight Section */}
        {quotesList.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs">
            <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1 mb-1.5">
              <Quote className="w-3 h-3 text-amber-700" />
              <span>Verbatim Quotes Captured ({quotesList.length})</span>
            </div>
            <div className="space-y-1.5">
              {quotesList.map((q, idx) => (
                <div key={idx} className="italic text-slate-800 text-[11px] pl-2 border-l-2 border-amber-400">
                  "{q.quote}"
                  <span className="not-italic text-[10px] text-slate-500 block">
                    — Q{q.questionIndex + 1}: {q.questionText.slice(0, 45)}...
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-Question Answers Accordion */}
        {answeredList.length > 0 && (
          <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowFullResponses(!showFullResponses)}
              className="w-full p-2.5 bg-slate-50 flex items-center justify-between text-left font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span>View All Logged Question Responses ({answeredList.length})</span>
              {showFullResponses ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showFullResponses && (
              <div className="p-3 divide-y divide-slate-100 max-h-56 overflow-y-auto space-y-2 bg-white">
                {answeredList.map((resp) => (
                  <div key={resp.questionIndex} className="pt-2 first:pt-0">
                    <div className="font-bold text-slate-900 text-[11px]">
                      Q{resp.questionIndex + 1}: {resp.questionText}
                    </div>
                    <p className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50/70 p-2 rounded-lg text-[11px]">
                      {resp.answer}
                    </p>
                    {resp.tags && resp.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {resp.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-semibold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Researcher Notes Preview */}
        {notes.trim().length > 0 && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wide">
              <FileText className="w-3 h-3 text-slate-500" />
              General Field Observations
            </div>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto font-mono text-[11px]">
              {notes}
            </p>
          </div>
        )}
      </div>

      {/* Computer Scientist Pipeline: Cloud AI Qualitative Extraction Panel */}
      <AIQualitativePanel
        analysis={aiAnalysis}
        onRunAnalysis={onRunAIAnalysis}
        isLoading={isLoadingAIAnalysis}
        participantName={activeParticipant?.name}
        hasMediaRecording={Boolean(mediaBlobUrl)}
      />

      {/* Action Buttons Card */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs space-y-2.5">
        <button
          type="button"
          onClick={() => onSaveSession(false)}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save to {cohortName} Study Database</span>
        </button>

        <button
          type="button"
          onClick={() => onSaveSession(true)}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 text-emerald-800" />
          <span>Save & Email Full Package to {storageEmail}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onSaveSession(false);
            if (onNavigateToTranscribe) onNavigateToTranscribe();
          }}
          className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-950 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-700" />
          <span>Save & View Post-Interview Hub (Second Screen)</span>
        </button>

        <button
          type="button"
          onClick={onReturnToInterview}
          className="w-full py-2 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Interview</span>
        </button>
      </div>
    </div>
  );
};
