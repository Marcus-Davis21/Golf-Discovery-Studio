import React, { useState } from 'react';
import { SavedSession } from '../types';
import { DISCOVERY_THEMES } from '../data/researchData';
import {
  BarChart3,
  Calendar,
  Clock,
  FileText,
  Trash2,
  Download,
  CheckCircle2,
  TrendingUp,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DashboardViewProps {
  sessionCount: number;
  activeCohortName: string;
  savedSessions: SavedSession[];
  onClearSessions: () => void;
  onSelectCohortForNewSession?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessionCount,
  activeCohortName,
  savedSessions,
  onClearSessions,
}) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const exportData = () => {
    const dataStr = JSON.stringify(savedSessions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `golf-discovery-sessions-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3.5">
      {/* Research Dashboard Overview Card */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-800" />
            <span>Research Dashboard</span>
          </h3>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
            Stakeholder Review
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Sessions captured</span>
            <b className="font-bold text-emerald-800 text-sm">{sessionCount}</b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Active cohort</span>
            <b className="font-semibold text-slate-900 max-w-[200px] truncate text-right">
              {activeCohortName || '—'}
            </b>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Framework</span>
            <b className="font-semibold text-slate-800">Iteration 1 preserved</b>
          </div>
        </div>
      </div>

      {/* Discovery Themes Card */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <strong className="text-xs font-bold text-slate-900 block mb-2 tracking-wide uppercase">
          Discovery themes to watch
        </strong>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {DISCOVERY_THEMES.map((theme) => (
            <span
              key={theme.label}
              className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-[11px] font-semibold"
              title={theme.description}
            >
              {theme.label}
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          Use stakeholder testing to observe whether the flow feels natural, questions are understandable, and follow-ups encourage concrete stories.
        </p>
      </div>

      {/* Captured Sessions History Card */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <strong className="text-xs font-bold text-slate-900 tracking-wide uppercase flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Captured Discovery Sessions ({savedSessions.length})</span>
          </strong>

          {savedSessions.length > 0 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={exportData}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-md transition-colors"
                title="Export session data"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClearSessions}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-md transition-colors"
                title="Reset session history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {savedSessions.length === 0 ? (
          <div className="text-center py-6 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <div className="text-xs font-semibold text-slate-700">No sessions saved yet</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Complete an interview and tap "Save Discovery Session" on the Review screen to record findings.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedSessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const dateStr = new Date(session.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={session.id}
                  className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-all text-xs"
                >
                  <div
                    className="flex items-start justify-between gap-2 cursor-pointer"
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{session.cohortName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{session.modeName}</span>
                        <span>•</span>
                        <span>{session.questionsAnswered} questions</span>
                        <span>•</span>
                        <span>{formatTimer(session.recordedSeconds)} rec</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    <button className="text-slate-400 hover:text-slate-600 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-2.5 pt-2.5 border-t border-slate-200 text-slate-700">
                      <div className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                        Field Observations
                      </div>
                      <p className="whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                        {session.notes || 'No specific notes recorded for this session.'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
