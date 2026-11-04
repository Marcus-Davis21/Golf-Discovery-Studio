import React from 'react';
import { TabType } from '../types';
import { Users, Video, ClipboardCheck, Layers } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isRecording?: boolean;
  cohortCompletedCount: number;
  cohortTargetCount?: number;
  totalCompletedCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  isRecording,
  cohortCompletedCount,
  cohortTargetCount = 25,
  totalCompletedCount,
}) => {
  const isPostInterviewActive =
    activeTab === 'post_interview' ||
    activeTab === 'transcribe' ||
    activeTab === 'dashboard' ||
    activeTab === 'storage' ||
    activeTab === 'ord';

  const tabs: {
    id: TabType;
    label: string;
    mobileLabel: string;
    icon: (isActive: boolean) => React.ReactNode;
    badge?: string | number;
    badgeType?: 'rec' | 'quota' | 'count';
  }[] = [
    {
      id: 'participants',
      label: 'Cohort Roster',
      mobileLabel: 'Roster',
      icon: (isActive) => (
        <Users
          className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform ${
            isActive ? 'text-emerald-800 scale-105' : 'text-slate-500'
          }`}
        />
      ),
      badge: `${cohortCompletedCount}/${cohortTargetCount}`,
      badgeType: 'quota',
    },
    {
      id: 'interview',
      label: 'Video & Voice',
      mobileLabel: 'Interview',
      icon: (isActive) => (
        <Video
          className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform ${
            isRecording
              ? 'text-rose-600 animate-pulse'
              : isActive
              ? 'text-emerald-800 scale-105'
              : 'text-slate-500'
          }`}
        />
      ),
      badge: isRecording ? 'REC' : undefined,
      badgeType: 'rec',
    },
    {
      id: 'review',
      label: 'Review Session',
      mobileLabel: 'Review',
      icon: (isActive) => (
        <ClipboardCheck
          className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform ${
            isActive ? 'text-emerald-800 scale-105' : 'text-slate-500'
          }`}
        />
      ),
    },
    {
      id: 'post_interview',
      label: 'Post-Interview Hub',
      mobileLabel: 'Hub',
      icon: (isActive) => (
        <Layers
          className={`w-5 h-5 sm:w-4 sm:h-4 transition-transform ${
            isActive ? 'text-indigo-700 scale-105' : 'text-slate-500'
          }`}
        />
      ),
      badge: totalCompletedCount > 0 ? totalCompletedCount : undefined,
      badgeType: 'count',
    },
  ];

  return (
    <nav className="w-full border-b border-slate-200 bg-white sticky top-[69px] z-20 shadow-xs">
      {/* 4 Equal-Width Tabs for Spacious, High-Visibility Mobile Navigation */}
      <div className="grid grid-cols-4 w-full">
        {tabs.map((t) => {
          const isActive =
            t.id === 'post_interview' ? isPostInterviewActive : activeTab === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`py-3 sm:py-3.5 px-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-center transition-all border-b-2 relative cursor-pointer min-h-[52px] sm:min-h-[48px] ${
                isActive
                  ? t.id === 'post_interview'
                    ? 'text-indigo-950 border-indigo-600 bg-indigo-50/60 font-bold'
                    : 'text-emerald-950 border-emerald-800 bg-emerald-50/60 font-bold'
                  : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {t.icon(isActive)}
                {t.badge && t.badgeType === 'rec' && (
                  <span className="sm:hidden absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                )}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-[11px] sm:text-xs tracking-tight">
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="inline sm:hidden">{t.mobileLabel}</span>
                </span>

                {t.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                      t.badgeType === 'rec'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : isActive
                        ? t.id === 'post_interview'
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'bg-emerald-100 text-emerald-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
