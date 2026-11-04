import React, { useState, useEffect } from 'react';
import { FOLLOW_UP_PROBES, INTERVIEW_TAGS } from '../data/researchData';
import { Participant, QuestionResponse, RecordingMediaType } from '../types';
import { MediaRecorderStudio } from './MediaRecorderStudio';
import {
  Mic,
  Video,
  ArrowRight,
  ArrowLeft,
  FileText,
  RotateCw,
  Clock,
  Sparkles,
  CheckCircle2,
  Tag,
  Quote,
  Radio,
  User,
  ListOrdered,
  Smartphone,
  Laptop,
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
  onJumpToQuestion?: (idx: number) => void;
  // Active participant
  activeParticipant?: Participant | null;
  // Media & Recording state
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
  // Per-question responses
  responses: Record<number, QuestionResponse>;
  onSaveQuestionResponse: (index: number, response: Partial<QuestionResponse>) => void;
  // Overall Notes
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
  onJumpToQuestion,
  activeParticipant,
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
  responses,
  onSaveQuestionResponse,
  notes,
  onNotesChange,
}) => {
  const currentQuestion = questions[currentIndex] || 'No question available';
  const progressPercent = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // Active question response data
  const currentResponse = responses[currentIndex] || {
    questionIndex: currentIndex,
    questionText: currentQuestion,
    answer: '',
    quote: '',
    tags: [],
  };

  const [currentAnswer, setCurrentAnswer] = useState(currentResponse.answer || '');
  const [currentQuote, setCurrentQuote] = useState(currentResponse.quote || '');
  const [currentTags, setCurrentTags] = useState<string[]>(currentResponse.tags || []);
  const [showQuoteInput, setShowQuoteInput] = useState(Boolean(currentResponse.quote));

  // Sync state when currentIndex changes
  useEffect(() => {
    const resp = responses[currentIndex] || {
      questionIndex: currentIndex,
      questionText: questions[currentIndex] || '',
      answer: '',
      quote: '',
      tags: [],
    };
    setCurrentAnswer(resp.answer || '');
    setCurrentQuote(resp.quote || '');
    setCurrentTags(resp.tags || []);
    setShowQuoteInput(Boolean(resp.quote));
  }, [currentIndex, responses, questions]);

  // Computer Scientist Ergonomics: Hands-free Field Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        if (!isRecording) {
          onStartRecording();
        } else if (isPaused) {
          onResumeRecording();
        } else {
          onPauseRecording();
        }
      } else if (e.altKey && e.key === 'ArrowRight' && !isInput) {
        e.preventDefault();
        onNextQuestion();
      } else if (e.altKey && e.key === 'ArrowLeft' && !isInput) {
        e.preventDefault();
        onPrevQuestion();
      } else if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
        e.preventDefault();
        setShowQuoteInput((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, isPaused, onStartRecording, onPauseRecording, onResumeRecording, onNextQuestion, onPrevQuestion]);

  const handleAnswerChange = (val: string) => {
    setCurrentAnswer(val);
    onSaveQuestionResponse(currentIndex, {
      questionIndex: currentIndex,
      questionText: currentQuestion,
      answer: val,
      quote: currentQuote,
      tags: currentTags,
      timestamp: Date.now(),
    });
  };

  const handleQuoteChange = (val: string) => {
    setCurrentQuote(val);
    onSaveQuestionResponse(currentIndex, {
      questionIndex: currentIndex,
      questionText: currentQuestion,
      answer: currentAnswer,
      quote: val,
      tags: currentTags,
      timestamp: Date.now(),
    });
  };

  const toggleTag = (tag: string) => {
    const updated = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    setCurrentTags(updated);
    onSaveQuestionResponse(currentIndex, {
      questionIndex: currentIndex,
      questionText: currentQuestion,
      answer: currentAnswer,
      quote: currentQuote,
      tags: updated,
      timestamp: Date.now(),
    });
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

  const answeredCount = Object.values(responses).filter((r) => r.answer?.trim()).length;

  return (
    <div className="space-y-4">
      {/* Active Participant Banner */}
      {activeParticipant ? (
        <div className="border border-emerald-200 bg-emerald-50/70 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
              {activeParticipant.id}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                <span>{activeParticipant.name}</span>
                <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">
                  {cohortName}
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                {activeParticipant.experienceLevel} · {modeName}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-900 uppercase bg-white px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
            Cohort Session
          </span>
        </div>
      ) : (
        <div className="border border-slate-200 bg-slate-50 rounded-2xl p-2.5 text-xs text-slate-600 flex items-center justify-between">
          <span>Ad-Hoc Interview · {cohortName}</span>
          <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-semibold text-slate-700">
            {modeName}
          </span>
        </div>
      )}

      {/* Main Responsive Grid: On wide screens (laptop) renders side-by-side; on mobile stacks vertically */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (Laptop: Video & Voice Studio + Scratchpad) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Integrated Video & Voice Studio */}
          <MediaRecorderStudio
            mediaType={mediaType}
            onMediaTypeChange={onMediaTypeChange}
            isRecording={isRecording}
            isPaused={isPaused}
            recordedSeconds={recordedSeconds}
            onStartRecording={onStartRecording}
            onPauseRecording={onPauseRecording}
            onResumeRecording={onResumeRecording}
            onStopRecording={onStopRecording}
            mediaBlobUrl={mediaBlobUrl}
            onMediaRecorded={onMediaRecorded}
            cohortName={cohortName}
            participantName={activeParticipant?.name}
          />

          {/* Follow-up Probe Box (Desktop / Laptop side) */}
          <div className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-xs">
            <div className="flex items-center justify-between gap-1 mb-1.5">
              <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Coach / Discovery Probe</span>
              </span>
              <button
                type="button"
                onClick={cycleProbe}
                className="text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCw className="w-2.5 h-2.5" />
                <span>Next probe</span>
              </button>
            </div>
            <p className="text-xs font-medium text-emerald-950 italic bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
              "{currentProbe}"
            </p>
          </div>

          {/* General Researcher Scratchpad */}
          <div className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                RESEARCHER OBSERVATIONS & SYNTHESIS
              </label>
              <span className="text-[10px] text-slate-400">
                {notes.length > 0 ? `${notes.length} chars` : 'Scratchpad'}
              </span>
            </div>

            <div className="flex flex-wrap gap-1 mb-2">
              <button
                type="button"
                onClick={() => addNoteSnippet('[Observation]:')}
                className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
              >
                + Observation
              </button>
              <button
                type="button"
                onClick={() => addNoteSnippet('[Pain Point]:')}
                className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
              >
                + Pain Point
              </button>
              <button
                type="button"
                onClick={() => addNoteSnippet('[Body Language]:')}
                className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors"
              >
                + Body Language
              </button>
            </div>

            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Record overarching observations, participant hesitations, equipment insights..."
              className="w-full min-h-[85px] p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 resize-y"
            />
          </div>
        </div>

        {/* Right Column (Laptop: Active Question Card & Question Responses) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
            {/* Question Progress Header */}
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5 flex-wrap gap-1">
              <span className="flex items-center gap-1.5 text-slate-800">
                <span className="font-bold">Question {currentIndex + 1}</span> of {questions.length}
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Mom Test Certified
                </span>
              </span>
              <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {answeredCount} of {questions.length} Logged
              </span>
            </div>

            {/* Computer Scientist Ergonomics: Hands-Free Shortcuts Guide */}
            <div className="hidden sm:flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 mb-2 font-mono">
              <span className="font-bold text-slate-700">Field Ergonomics:</span>
              <span>[Space] Record/Pause</span>
              <span>•</span>
              <span>[Alt + →] Next</span>
              <span>•</span>
              <span>[Alt + ←] Prev</span>
              <span>•</span>
              <span>[Alt + Q] Quote</span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full bg-emerald-800 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Question Quick Jump Pills */}
            {onJumpToQuestion && (
              <div className="flex gap-1 overflow-x-auto py-1 mb-2.5 no-scrollbar">
                {questions.map((_, i) => {
                  const hasAnswer = Boolean(responses[i]?.answer?.trim());
                  const isCurrent = i === currentIndex;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onJumpToQuestion(i)}
                      className={`w-6 h-6 rounded-md text-[10px] font-mono font-bold flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-800 text-white shadow-2xs'
                          : hasAnswer
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title={`Jump to Q${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Question Text */}
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug tracking-tight my-2.5 min-h-[50px]">
              {currentQuestion}
            </h2>

            {/* Participant Response Input */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Participant Response (Q{currentIndex + 1})</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowQuoteInput(!showQuoteInput)}
                  className="text-[10px] font-semibold text-slate-500 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                >
                  <Quote className="w-3 h-3" />
                  <span>{showQuoteInput ? 'Hide Quote' : '+ Add Verbatim Quote'}</span>
                </button>
              </div>

              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type participant's answers, verbatim stories, reactions to this question..."
                className="w-full min-h-[95px] p-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 resize-y"
              />

              {showQuoteInput && (
                <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl animate-fadeIn">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-900 uppercase mb-1">
                    <Quote className="w-3 h-3 text-amber-700" />
                    <span>Verbatim Quote</span>
                  </div>
                  <input
                    type="text"
                    value={currentQuote}
                    onChange={(e) => handleQuoteChange(e.target.value)}
                    placeholder="Exact wording (e.g., 'I bought a swing trainer but gave up because...')"
                    className="w-full p-2 border border-amber-300 rounded-lg text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              )}

              {/* Tag Selector */}
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[10px] font-semibold text-slate-400 self-center mr-1">Tags:</span>
                {INTERVIEW_TAGS.map((t) => {
                  const active = currentTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={onPrevQuestion}
                  className="px-3 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
              )}

              <button
                type="button"
                onClick={onNextQuestion}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <span>
                  {currentIndex < questions.length - 1 ? 'Save & Next Question' : 'Complete to Review'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onGoToReview}
              className="w-full mt-2 py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Go to Review & Verification</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
