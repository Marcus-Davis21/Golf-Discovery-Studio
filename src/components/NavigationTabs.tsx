import React from 'react';
import { TabType } from '../types';
import { Users, MessageSquare, ClipboardCheck, BarChart3 } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isRecording?: boolean;
  hasRecorded?: boolean;
  sessionCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  isRecording,
  sessionCount,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'participants', label: 'Participants', icon: <Users className="w-3.5 h-3.5" /> },
    {
      id: 'interview',
      label: 'Interview',
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      badge: isRecording ? 'REC' : undefined,
    },
    { id: 'review', label: 'Review', icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      badge: sessionCount > 0 ? sessionCount : undefined,
    },
  ];

  return (
    <nav className="flex overflow-x-auto border-b border-slate-200 bg-white sticky top-[75px] z-20 shadow-xs no-scrollbar">
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex-1 min-w-[92px] py-3.5 px-2 flex items-center justify-center gap-1.5 text-xs font-semibold tracking-tight transition-all border-b-2 relative ${
              isActive
                ? 'text-emerald-800 border-emerald-800 bg-emerald-50/40'
                : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
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
