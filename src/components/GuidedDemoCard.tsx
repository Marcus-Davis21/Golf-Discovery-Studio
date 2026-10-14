import React from 'react';
import { DEMO_STEPS } from '../data/researchData';
import { Play, ArrowLeft, ArrowRight, X, RotateCcw, Clock, Sparkles } from 'lucide-react';

interface GuidedDemoCardProps {
  isDemoActive: boolean;
  demoStep: number;
  demoSeconds: number;
  isDemoFinished: boolean;
  onStartDemo: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onStopDemo: () => void;
}

export const GuidedDemoCard: React.FC<GuidedDemoCardProps> = ({
  isDemoActive,
  demoStep,
  demoSeconds,
  isDemoFinished,
  onStartDemo,
  onNextStep,
  onPrevStep,
  onStopDemo,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const currentStep = DEMO_STEPS[demoStep] || DEMO_STEPS[0];

  return (
    <div className="space-y-3 mb-4">
      {/* Presentation Notice Banner */}
      <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed shadow-xs flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-amber-950">September 24 stakeholder presentation.</strong>{' '}
          Use Guided Demo for a 5-minute walkthrough of the research experience. Recording controls demonstrate interface behavior; they do not save audio/video.
        </div>
      </div>

      {/* Guided Demo Box */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs transition-all">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold shrink-0 mt-0.5">
              🎬
            </div>
            <div>
              <strong className="text-sm font-bold text-slate-900 block leading-tight">
                5-Minute Guided Demo
              </strong>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                Presenter prompts and timed checkpoints for a consistent stakeholder walkthrough.
              </p>
            </div>
          </div>

          {!isDemoActive && (
            <button
              onClick={onStartDemo}
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Guided Demo</span>
            </button>
          )}
        </div>

        {isDemoActive && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                {isDemoFinished
                  ? 'Walkthrough Complete'
                  : `Step ${demoStep + 1} of ${DEMO_STEPS.length} · ${currentStep.title}`}
              </div>

              <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                <Clock className="w-3 h-3 text-emerald-700" />
                <span>{formatTime(demoSeconds)} remaining</span>
              </div>
            </div>

            <p className="mt-2.5 text-xs text-slate-800 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {isDemoFinished
                ? 'Demo complete! Stakeholders can now freely test cohorts, questions, simulated recording states, and review sessions.'
                : currentStep.prompt}
            </p>

            <div className="flex items-center gap-2 mt-3">
              {!isDemoFinished && (
                <button
                  onClick={onPrevStep}
                  disabled={demoStep === 0}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back</span>
                </button>
              )}

              {isDemoFinished ? (
                <button
                  onClick={onStartDemo}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restart Walkthrough</span>
                </button>
              ) : (
                <button
                  onClick={onNextStep}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
                >
                  <span>{demoStep === DEMO_STEPS.length - 1 ? 'Finish Demo' : 'Next Step'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              <button
                onClick={onStopDemo}
                className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Exit Demo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
