import React, { useState } from 'react';
import { SavedSession, Participant, CohortId } from '../types';
import { DISCOVERY_THEMES, COHORTS_DATA } from '../data/researchData';
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
  Mail,
  Send,
  FileSpreadsheet,
  Quote,
  Users,
  HardDrive,
  Database,
  Video,
  Mic,
  Play,
  Layers,
  Sparkles,
  Brain,
  ShieldAlert,
  Wrench,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  sessionCount: number;
  activeCohortName: string;
  savedSessions: SavedSession[];
  participants?: Participant[];
  storageEmail?: string;
  targetCountPerCohort?: number;
  onClearSessions: () => void;
  onDeleteSession?: (id: string) => void;
  onNavigateToStorage?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessionCount,
  activeCohortName,
  savedSessions,
  participants = [],
  storageEmail = 'research-archive@golfdiscovery.org',
  targetCountPerCohort = 25,
  onClearSessions,
  onDeleteSession,
  onNavigateToStorage,
}) => {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [activeFilterCohort, setActiveFilterCohort] = useState<CohortId | 'all'>('all');

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const totalTargetCount = targetCountPerCohort * 5; // 125 total across 5 cohorts
  const totalCompleted = savedSessions.length;
  const overallProgress = Math.min(100, Math.round((totalCompleted / totalTargetCount) * 100));

  // Extract all quotes across all saved sessions
  const allQuotes: { quote: string; participantName?: string; cohortName: string; qText?: string }[] = [];
  savedSessions.forEach((s) => {
    if (s.responses) {
      Object.values(s.responses).forEach((r) => {
        if (r.quote?.trim()) {
          allQuotes.push({
            quote: r.quote.trim(),
            participantName: s.participantName,
            cohortName: s.cohortName,
            qText: r.questionText,
          });
        }
      });
    }
  });

  // Calculate cohort completion counts
  const cohortStats: Record<CohortId, { name: string; completed: number; target: number; videoCount: number }> = {
    aspiring: { name: 'Aspiring', completed: 0, target: targetCountPerCohort, videoCount: 0 },
    novice: { name: 'Novice', completed: 0, target: targetCountPerCohort, videoCount: 0 },
    amateur: { name: 'Amateur', completed: 0, target: targetCountPerCohort, videoCount: 0 },
    mid: { name: 'Mid-Level', completed: 0, target: targetCountPerCohort, videoCount: 0 },
    coach: { name: 'Coach', completed: 0, target: targetCountPerCohort, videoCount: 0 },
  };

  savedSessions.forEach((s) => {
    if (cohortStats[s.cohortId]) {
      cohortStats[s.cohortId].completed += 1;
      if (s.mediaBlobUrl) {
        cohortStats[s.cohortId].videoCount += 1;
      }
    }
  });

  // Filter sessions
  const filteredSessions = savedSessions.filter((s) => {
    if (activeFilterCohort !== 'all' && s.cohortId !== activeFilterCohort) return false;
    return true;
  });

  const exportData = () => {
    const dataStr = JSON.stringify(savedSessions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `golf-discovery-study-all-cohorts-${savedSessions.length}sessions.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const headers = [
      'Session ID',
      'Participant ID',
      'Participant Name',
      'Cohort',
      'Mode',
      'Media Type',
      'Questions Answered',
      'Total Questions',
      'Media Duration (Sec)',
      'Date Completed',
      'AI Analyzed',
      'Sentiment (Enthusiastic %)',
      'Sentiment (Frustrated %)',
      'Sentiment (Hesitant %)',
      'Direct Soundbites',
      'Identified Barriers',
      'Current Tools & Improvised Drills',
      'Verbatim Transcript Turns',
      'Notes & Observations',
    ];

    const rows = savedSessions.map((s) => {
      const hasAi = !!s.aiAnalysis;
      const soundbitesStr = s.aiAnalysis?.quotableSoundbites?.map((q) => `"${q.quote.replace(/"/g, '""')}" (${q.significance || q.context})`).join('; ') || '';
      const barriersStr = s.aiAnalysis?.identifiedBarriers?.map((b) => `[${b.severity.toUpperCase()}] ${b.barrier}: ${b.participantVerbatim}`).join('; ') || '';
      const drillsStr = s.aiAnalysis?.currentToolsAndDrills?.map((d) => `${d.toolOrDrill} (${d.source}): ${d.outcome}${d.abandonedReason ? ` [Abandoned: ${d.abandonedReason}]` : ''}`).join('; ') || '';
      const transcriptStr = s.aiAnalysis?.verbatimTranscript?.map((t) => `[${t.timestamp}] ${t.speaker}: ${t.text}`).join(' | ') || '';

      return [
        `"${s.id}"`,
        `"${s.participantId || ''}"`,
        `"${(s.participantName || '').replace(/"/g, '""')}"`,
        `"${s.cohortName}"`,
        `"${s.modeName}"`,
        `"${s.mediaType || 'audio'}"`,
        s.questionsAnswered,
        s.totalQuestions,
        s.recordedSeconds,
        `"${new Date(s.timestamp).toISOString()}"`,
        hasAi ? '"Yes"' : '"No"',
        hasAi ? s.aiAnalysis?.sentimentAnalysis?.breakdown?.enthusiasticScore || 0 : '""',
        hasAi ? s.aiAnalysis?.sentimentAnalysis?.breakdown?.frustratedScore || 0 : '""',
        hasAi ? s.aiAnalysis?.sentimentAnalysis?.breakdown?.hesitantScore || 0 : '""',
        `"${soundbitesStr.replace(/"/g, '""')}"`,
        `"${barriersStr.replace(/"/g, '""')}"`,
        `"${drillsStr.replace(/"/g, '""')}"`,
        `"${transcriptStr.replace(/"/g, '""')}"`,
        `"${(s.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golf-discovery-cohort-interviews-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* 5-Cohort Study Progress Quota Card (Target: 25 Per Cohort) */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-emerald-800" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              Cohort Quota Progress (Target: 25 Per Cohort)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {totalCompleted} / {totalTargetCount} Total
          </span>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 my-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
            <span>Overall Study Progress Across 5 Cohorts</span>
            <span className="text-emerald-800 font-bold">
              {totalCompleted} Completed (Unlimited Capacity)
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-800 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* 5-Cohort Individual Quota Matrix (Target: 25 each) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
          {(Object.keys(cohortStats) as CohortId[]).map((cid) => {
            const c = cohortStats[cid];
            const isTargetMet = c.completed >= targetCountPerCohort;
            const isFiltered = activeFilterCohort === cid;

            return (
              <button
                key={cid}
                type="button"
                onClick={() => setActiveFilterCohort(isFiltered ? 'all' : cid)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isFiltered
                    ? 'border-emerald-700 bg-emerald-800 text-white shadow-xs'
                    : isTargetMet
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`text-[10px] uppercase font-bold truncate ${isFiltered ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {c.name}
                </div>
                <div className={`text-base font-black mt-0.5 ${isFiltered ? 'text-white' : 'text-emerald-800'}`}>
                  {c.completed} / {c.target}
                </div>
                <div className={`text-[10px] flex items-center justify-between mt-1 ${isFiltered ? 'text-emerald-200' : 'text-slate-500'}`}>
                  <span>{Math.round((c.completed / c.target) * 100)}%</span>
                  {c.videoCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Video className="w-2.5 h-2.5" />
                      <span>{c.videoCount}</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Storage Destination & Email Status Banner */}
      <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-3.5 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>Target Storage Email:</span>
              <span className="font-mono text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {storageEmail}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Full-capacity file database · Storing all video, voice, and question transcripts
            </div>
          </div>
        </div>

        {onNavigateToStorage && (
          <button
            type="button"
            onClick={onNavigateToStorage}
            className="px-2.5 py-1.5 rounded-lg border border-emerald-600 bg-white text-emerald-800 hover:bg-emerald-50 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
          >
            Configure
          </button>
        )}
      </div>

      {/* Captured Verbatim Quotes Repository */}
      {allQuotes.length > 0 && (
        <div className="border border-amber-200 bg-amber-50/50 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <strong className="text-xs font-bold text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
              <Quote className="w-3.5 h-3.5 text-amber-700" />
              <span>Cross-Cohort Verbatim Quotes ({allQuotes.length})</span>
            </strong>
            <span className="text-[10px] text-amber-800 font-semibold">Discovery Insights</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {allQuotes.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-white border border-amber-200 rounded-xl text-xs text-slate-800 shadow-2xs"
              >
                <p className="italic font-medium text-slate-900">"{item.quote}"</p>
                <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                  <span className="font-semibold text-emerald-800">
                    {item.participantName || 'Golfer'} ({item.cohortName})
                  </span>
                  {item.qText && <span className="truncate max-w-[200px] text-slate-400">{item.qText}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Captured Sessions History & Media Library */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <strong className="text-xs font-bold text-slate-900 tracking-wide uppercase">
              Cohort Interviews Library ({filteredSessions.length})
            </strong>
            {activeFilterCohort !== 'all' && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Filtered: {activeFilterCohort}
              </span>
            )}
          </div>

          {savedSessions.length > 0 && (
            <div className="flex items-center gap-1.5">
              {activeFilterCohort !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveFilterCohort('all')}
                  className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 underline mr-1"
                >
                  Show All
                </button>
              )}

              <button
                type="button"
                onClick={exportCsv}
                className="text-[11px] font-semibold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Download CSV Spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>CSV</span>
              </button>

              <button
                type="button"
                onClick={exportData}
                className="text-[11px] font-semibold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-slate-200 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Export JSON raw file"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>JSON</span>
              </button>

              <button
                type="button"
                onClick={onClearSessions}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Reset session history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Video className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
            <div className="text-xs font-semibold text-slate-700">No interviews logged for this cohort yet</div>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
              Select a participant from the {activeFilterCohort !== 'all' ? activeFilterCohort : 'active'} cohort roster to conduct a video or voice interview.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredSessions.map((session) => {
              const isExpanded = expandedSessionId === session.id;
              const dateStr = new Date(session.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });
              const timeStr = new Date(session.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });
              const responsesCount = session.responses ? Object.keys(session.responses).length : session.questionsAnswered;

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
                      <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        {session.participantId && (
                          <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 px-1 rounded">
                            {session.participantId}
                          </span>
                        )}
                        <span>{session.participantName || session.cohortName}</span>
                        <span className="text-[10px] font-normal text-slate-500">
                          ({session.cohortName})
                        </span>
                        {session.mediaType === 'video_voice' ? (
                          <span className="text-[9px] font-bold bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Video className="w-2.5 h-2.5" /> Video
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Mic className="w-2.5 h-2.5" /> Voice
                          </span>
                        )}
                        {session.aiAnalysis && (
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-700" />
                            <span>AI Analyzed ({session.aiAnalysis.sentimentAnalysis.overall})</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                        <span>{session.modeName}</span>
                        <span>•</span>
                        <span>{responsesCount} questions logged</span>
                        <span>•</span>
                        <span>{formatTimer(session.recordedSeconds)} media</span>
                        <span>•</span>
                        <span>{dateStr} {timeStr}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {onDeleteSession && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete interview session for ${session.participantName || session.id}?`)) {
                              onDeleteSession(session.id);
                            }
                          }}
                          className="text-slate-300 hover:text-rose-600 p-1"
                          title="Delete session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button type="button" className="text-slate-400 hover:text-slate-600 p-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-slate-700 space-y-3 animate-fadeIn">
                      {/* Video / Audio playback if attached */}
                      {session.mediaBlobUrl && (
                        <div className="p-2.5 bg-slate-900 rounded-xl text-white">
                          <div className="text-[10px] font-bold text-slate-300 mb-1 flex items-center justify-between">
                            <span>Recorded Media Playback</span>
                            <a
                              href={session.mediaBlobUrl}
                              download={`session-${session.id}.webm`}
                              className="text-emerald-400 hover:underline flex items-center gap-1"
                            >
                              <Download className="w-2.5 h-2.5" /> Download
                            </a>
                          </div>
                          {session.mediaType === 'video_voice' ? (
                            <video src={session.mediaBlobUrl} controls className="w-full rounded max-h-48 bg-black object-contain" />
                          ) : (
                            <audio src={session.mediaBlobUrl} controls className="w-full" />
                          )}
                        </div>
                      )}

                      {/* Computer Scientist Cloud AI Qualitative Extraction Block */}
                      {session.aiAnalysis && (
                        <div className="p-3 bg-gradient-to-br from-emerald-50/70 to-slate-50 border border-emerald-200 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-emerald-950 flex items-center gap-1.5">
                              <Brain className="w-3.5 h-3.5 text-emerald-700" />
                              Computer Scientist Cloud AI Intelligence ({session.aiAnalysis.modelUsed || 'gemini-3.8-flash'})
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Sentiment: {session.aiAnalysis.sentimentAnalysis.overall}
                            </span>
                          </div>

                          {/* Sentiment Breakdown Bars */}
                          <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-lg border border-slate-200 text-[10px]">
                            <div>
                              <div className="flex justify-between text-emerald-800 font-semibold mb-0.5">
                                <span>Enthusiastic</span>
                                <span>{session.aiAnalysis.sentimentAnalysis.breakdown.enthusiasticScore}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-600 h-full rounded-full"
                                  style={{ width: `${session.aiAnalysis.sentimentAnalysis.breakdown.enthusiasticScore}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-rose-800 font-semibold mb-0.5">
                                <span>Frustrated</span>
                                <span>{session.aiAnalysis.sentimentAnalysis.breakdown.frustratedScore}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-rose-500 h-full rounded-full"
                                  style={{ width: `${session.aiAnalysis.sentimentAnalysis.breakdown.frustratedScore}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-amber-800 font-semibold mb-0.5">
                                <span>Hesitant</span>
                                <span>{session.aiAnalysis.sentimentAnalysis.breakdown.hesitantScore}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-amber-500 h-full rounded-full"
                                  style={{ width: `${session.aiAnalysis.sentimentAnalysis.breakdown.hesitantScore}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Direct Quotable Soundbites */}
                          {session.aiAnalysis.quotableSoundbites.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Quote className="w-3 h-3 text-emerald-700" />
                                Direct Quotable Soundbites ({session.aiAnalysis.quotableSoundbites.length})
                              </div>
                              <div className="space-y-1.5">
                                {session.aiAnalysis.quotableSoundbites.map((qb, i) => (
                                  <div key={i} className="bg-white p-2 rounded-lg border border-slate-200 text-[11px]">
                                    <div className="italic font-medium text-slate-900">"{qb.quote}"</div>
                                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                                      <span className="font-semibold text-emerald-800">Significance:</span>
                                      <span>{qb.significance}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Identified Barriers */}
                          {session.aiAnalysis.identifiedBarriers.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-rose-600" />
                                Identified Barriers & Friction Points
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {session.aiAnalysis.identifiedBarriers.map((bar, i) => (
                                  <div key={i} className="bg-white p-2 rounded-lg border border-slate-200 text-[10px]">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <span className="font-bold text-slate-800">{bar.barrier}</span>
                                      <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-rose-50 text-rose-800 uppercase font-bold">
                                        {bar.severity} · {bar.category}
                                      </span>
                                    </div>
                                    <p className="text-slate-600 italic">"{bar.participantVerbatim}"</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Current Tools & Improvised Drills */}
                          {session.aiAnalysis.currentToolsAndDrills.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <Wrench className="w-3 h-3 text-amber-700" />
                                Current Tools & Improvised Drills
                              </div>
                              <div className="space-y-1">
                                {session.aiAnalysis.currentToolsAndDrills.map((td, i) => (
                                  <div key={i} className="bg-white p-2 rounded-lg border border-slate-200 text-[10px] flex items-start justify-between gap-2">
                                    <div>
                                      <span className="font-bold text-slate-800">{td.toolOrDrill}</span>
                                      <span className="text-slate-500 text-[9px] ml-1.5 font-mono">({td.source})</span>
                                      <div className="text-slate-600 mt-0.5">Outcome: {td.outcome}</div>
                                      {td.abandonedReason && (
                                        <div className="text-rose-700 text-[9px] mt-0.5">Abandoned: {td.abandonedReason}</div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Verbatim Transcript */}
                          {session.aiAnalysis.verbatimTranscript.length > 0 && (
                            <div>
                              <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                <FileText className="w-3 h-3 text-slate-600" />
                                Anchored Verbatim Transcript ({session.aiAnalysis.verbatimTranscript.length} Turns)
                              </div>
                              <div className="bg-white p-2 rounded-lg border border-slate-200 max-h-36 overflow-y-auto space-y-1.5 text-[10px]">
                                {session.aiAnalysis.verbatimTranscript.map((t, i) => (
                                  <div key={i} className="flex gap-2">
                                    <span className="font-mono text-slate-400 font-bold shrink-0">{t.timestamp}</span>
                                    <div className="flex-1">
                                      <span className={`font-bold ${t.speaker === 'Interviewer' ? 'text-emerald-800' : 'text-slate-900'}`}>
                                        {t.speaker}:
                                      </span>{' '}
                                      <span className="text-slate-700">{t.text}</span>
                                      {t.questionAnchor && (
                                        <span className="text-[9px] text-slate-400 ml-1 font-mono">[{t.questionAnchor}]</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Notes block */}
                      {session.notes && (
                        <div>
                          <div className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                            Researcher Observations
                          </div>
                          <p className="whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800">
                            {session.notes}
                          </p>
                        </div>
                      )}

                      {/* Question responses block */}
                      {session.responses && Object.keys(session.responses).length > 0 && (
                        <div>
                          <div className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                            Question Responses ({Object.keys(session.responses).length})
                          </div>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                            {Object.values(session.responses).map((resp) => (
                              <div
                                key={resp.questionIndex}
                                className="bg-white p-2 rounded-lg border border-slate-200 text-[11px]"
                              >
                                <div className="font-semibold text-slate-800">
                                  Q{resp.questionIndex + 1}: {resp.questionText}
                                </div>
                                <div className="text-slate-600 mt-0.5">{resp.answer}</div>
                                {resp.quote && (
                                  <div className="italic text-amber-900 bg-amber-50 p-1 rounded mt-1 text-[10px]">
                                    "{resp.quote}"
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
