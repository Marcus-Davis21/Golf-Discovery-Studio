import React from 'react';
import {
  PostInterviewSubTab,
  SavedSession,
  Participant,
  StorageConfig,
  CohortId,
  AIQualitativeAnalysis,
} from '../types';
import { TranscriberView } from './TranscriberView';
import { DashboardView } from './DashboardView';
import { StorageView } from './StorageView';
import { ORDView } from './ORDView';
import {
  Sparkles,
  BarChart3,
  Database,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface PostInterviewHubProps {
  activeSubTab: PostInterviewSubTab;
  onSubTabChange: (subTab: PostInterviewSubTab) => void;
  // Transcriber props
  savedSessions: SavedSession[];
  activeRecordingBlobUrl?: string;
  activeRecordingType?: 'video_voice' | 'voice_only' | 'simulated';
  activeRecordingSeconds?: number;
  activeParticipantName?: string;
  activeCohortId?: CohortId;
  onUpdateSessionAnalysis: (sessionId: string, analysis: AIQualitativeAnalysis) => void;
  onNavigateToInterview: () => void;
  // Dashboard props
  sessionCount: number;
  activeCohortName: string;
  participants: Participant[];
  storageEmail?: string;
  targetCountPerCohort?: number;
  onClearSessions: () => void;
  onDeleteSession?: (id: string) => void;
  onNavigateToStorage: () => void;
  // Storage props
  storageConfig: StorageConfig;
  onUpdateStorageConfig: (config: StorageConfig) => Promise<void> | void;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export const PostInterviewHub: React.FC<PostInterviewHubProps> = ({
  activeSubTab,
  onSubTabChange,
  savedSessions,
  activeRecordingBlobUrl,
  activeRecordingType,
  activeRecordingSeconds,
  activeParticipantName,
  activeCohortId,
  onUpdateSessionAnalysis,
  onNavigateToInterview,
  sessionCount,
  activeCohortName,
  participants,
  storageEmail,
  targetCountPerCohort,
  onClearSessions,
  onDeleteSession,
  onNavigateToStorage,
  storageConfig,
  onUpdateStorageConfig,
  onSyncNow,
  isSyncing,
}) => {
  const subTabs: {
    id: PostInterviewSubTab;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'transcribe',
      title: 'AI Transcriber',
      subtitle: 'Video transcription & 5-pillar discovery',
      icon: <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />,
      badge: 'Cloud AI',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    },
    {
      id: 'dashboard',
      title: 'All Cohorts',
      subtitle: '25-interview quotas & session archive',
      icon: <BarChart3 className="w-5 h-5 text-emerald-800 shrink-0" />,
      badge: `${savedSessions.length} Saved`,
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    },
    {
      id: 'storage',
      title: 'Storage & Email',
      subtitle: 'Persistence, cloud sync & CSV export',
      icon: <Database className="w-5 h-5 text-blue-700 shrink-0" />,
      badge: 'Dual-Tier',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    },
    {
      id: 'ord',
      title: 'ORD & PM Review',
      subtitle: 'Methodology, question audit & checklist',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />,
      badge: 'Approved',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Second Screen Navigation Banner */}
      <div className="border border-indigo-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/30">
                  Second Screen · Post-Interview Hub
                </span>
                <span className="text-[10px] text-emerald-300 font-mono">
                  {savedSessions.length} Study Sessions
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
                Research Intelligence & Operations
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToInterview}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Live Interview</span>
          </button>
        </div>

        {/* Spacious 4-Tab Post-Interview Selector with Large Visible Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5 pt-3 border-t border-white/15">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSubTabChange(tab.id)}
                className={`p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer border flex flex-col justify-between min-h-[76px] sm:min-h-[84px] ${
                  isActive
                    ? 'bg-white text-slate-900 border-white shadow-md ring-2 ring-indigo-400/50'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full mb-1">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive ? 'bg-indigo-50' : 'bg-white/10'
                    }`}
                  >
                    {tab.icon}
                  </div>
                  {tab.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                        isActive
                          ? tab.badgeColor || 'bg-slate-100 text-slate-800'
                          : 'bg-white/10 text-white border-white/20'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>

                <div>
                  <div className={`text-xs font-bold leading-tight ${isActive ? 'text-slate-900' : 'text-white'}`}>
                    {tab.title}
                  </div>
                  <div className={`text-[10px] leading-tight truncate mt-0.5 ${isActive ? 'text-slate-500' : 'text-slate-300'}`}>
                    {tab.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render the Active Second-Screen View */}
      <div className="pt-1">
        {activeSubTab === 'transcribe' && (
          <TranscriberView
            savedSessions={savedSessions}
            activeRecordingBlobUrl={activeRecordingBlobUrl}
            activeRecordingType={activeRecordingType}
            activeRecordingSeconds={activeRecordingSeconds}
            activeParticipantName={activeParticipantName}
            activeCohortId={activeCohortId}
            onUpdateSessionAnalysis={onUpdateSessionAnalysis}
            onNavigateToInterview={onNavigateToInterview}
          />
        )}

        {activeSubTab === 'dashboard' && (
          <DashboardView
            sessionCount={sessionCount}
            activeCohortName={activeCohortName}
            savedSessions={savedSessions}
            participants={participants}
            storageEmail={storageEmail}
            targetCountPerCohort={targetCountPerCohort}
            onClearSessions={onClearSessions}
            onDeleteSession={onDeleteSession}
            onNavigateToStorage={onNavigateToStorage}
            onNavigateToTranscribe={() => onSubTabChange('transcribe')}
            onUpdateSessionAnalysis={onUpdateSessionAnalysis}
          />
        )}

        {activeSubTab === 'storage' && (
          <StorageView
            storageConfig={storageConfig}
            onUpdateStorageConfig={onUpdateStorageConfig}
            savedSessions={savedSessions}
            participants={participants}
            onSyncNow={onSyncNow}
            isSyncing={isSyncing}
          />
        )}

        {activeSubTab === 'ord' && <ORDView />}
      </div>
    </div>
  );
};
