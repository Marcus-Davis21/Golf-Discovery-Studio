import React from 'react';
import { CohortId } from '../types';
import { COHORTS_DATA } from '../data/researchData';
import { Zap, BookOpen, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

interface ParticipantsViewProps {
  selectedCohortId: CohortId;
  onCohortChange: (id: CohortId) => void;
  onStartInterview: (isFull: boolean) => void;
}

export const ParticipantsView: React.FC<ParticipantsViewProps> = ({
  selectedCohortId,
  onCohortChange,
  onStartInterview,
}) => {
  const currentCohort = COHORTS_DATA[selectedCohortId];
  const quickCount = Math.min(8, currentCohort.questions.length);
  const fullCount = currentCohort.questions.length;

  return (
    <div className="space-y-3.5">
      {/* Cohort Selector Card */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <label className="text-xs font-bold text-slate-600 block mb-2 tracking-wide uppercase">
          SELECT PARTICIPANT COHORT
        </label>

        <div className="relative">
          <select
            value={selectedCohortId}
            onChange={(e) => onCohortChange(e.target.value as CohortId)}
            className="w-full border border-slate-300 rounded-xl p-3 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 cursor-pointer shadow-2xs"
          >
            <option value="aspiring">Aspiring Golfer — Never Played</option>
            <option value="novice">Inexperienced / Novice Golfer</option>
            <option value="amateur">Amateur Golfer</option>
            <option value="mid">Mid-Level Golfer</option>
            <option value="coach">Professional Trainer / Coach</option>
          </select>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/50 text-[11px] font-bold">
            Customer discovery
          </span>
          <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/50 text-[11px] font-bold">
            Behavior focused
          </span>
          {currentCohort.tags.slice(2).map((t) => (
            <span
              key={t}
              className="inline-block px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium"
            >
              {t}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          {currentCohort.description}
        </p>
      </div>

      {/* Mode Card */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <strong className="text-sm font-bold text-slate-900">Interview mode</strong>
          <span className="text-[11px] text-slate-500 font-medium">Select pacing</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mt-2">
          <button
            onClick={() => onStartInterview(false)}
            className="flex flex-col items-center text-center p-3 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Quick Interview</span>
            <span className="text-[10px] text-slate-500 mt-0.5">{quickCount} key questions</span>
          </button>

          <button
            onClick={() => onStartInterview(true)}
            className="flex flex-col items-center text-center p-3 rounded-xl border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800">Full Interview</span>
            <span className="text-[10px] text-slate-500 mt-0.5">{fullCount} deep-dive questions</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-3 leading-relaxed flex items-start gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Questions focus on real experiences, behaviors, frustrations, barriers, and current solutions—not product pitching.
          </span>
        </p>
      </div>

      {/* Questions Preview Accordion / Inspection */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Cohort Question Bank ({currentCohort.questions.length})
          </span>
          <span className="text-[11px] text-emerald-800 font-semibold">
            {currentCohort.shortLabel}
          </span>
        </div>
        <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
          {currentCohort.questions.map((q, i) => (
            <div key={i} className="py-2 flex items-start gap-2 text-xs text-slate-600">
              <span className="font-mono text-[10px] text-slate-400 mt-0.5 shrink-0 w-4 text-right">
                {i + 1}.
              </span>
              <span className="leading-snug text-slate-800">{q}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
