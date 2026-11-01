import React from 'react';
import { TabType, CohortId } from '../types';
import { Users, Video, ClipboardCheck, BarChart3, Database } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isRecording?: boolean;
  hasRecorded?: boolean;
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
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      id: 'participants',
      label: 'Cohort Roster',
      icon: <Users className="w-3.5 h-3.5" />,
      badge: `${cohortCompletedCount}/${cohortTargetCount}`,
    },
    {
      id: 'interview',
      label: 'Video & Voice',
      icon: <Video className="w-3.5 h-3.5" />,
      badge: isRecording ? 'REC' : undefined,
    },
    {
      id: 'review',
      label: 'Review',
      icon: <ClipboardCheck className="w-3.5 h-3.5" />,
    },
    {
      id: 'dashboard',
      label: 'All Cohorts',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      badge: totalCompletedCount > 0 ? totalCompletedCount : undefined,
    },
    {
      id: 'storage',
      label: 'Storage & Email',
      icon: <Database className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <nav className="flex overflow-x-auto border-b border-slate-200 bg-white sticky top-[73px] z-20 shadow-xs no-scrollbar">
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onTabChange(t.id)}
            className={`flex-1 min-w-[76px] sm:min-w-[92px] py-3 px-1.5 flex items-center justify-center gap-1 text-[11px] font-semibold tracking-tight transition-all border-b-2 relative cursor-pointer ${
              isActive
                ? 'text-emerald-800 border-emerald-800 bg-emerald-50/50'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="shrink-0">{t.icon}</span>
            <span className="truncate">{t.label}</span>
            {t.badge && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                  t.badge === 'REC'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
