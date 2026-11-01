import React from 'react';
import { Smartphone, Monitor, Database, Mail, Laptop } from 'lucide-react';

interface HeaderProps {
  isFramed: boolean;
  onToggleFrame: () => void;
  storageEmail?: string;
  onNavigateToStorage?: () => void;
  sessionCount?: number;
  totalTargetCount?: number;
  activeCohortName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isFramed,
  onToggleFrame,
  storageEmail = 'research-archive@golfdiscovery.org',
  onNavigateToStorage,
  sessionCount = 0,
  totalTargetCount = 125,
  activeCohortName,
}) => {
  return (
    <header className="px-4 sm:px-5 pt-3.5 pb-2.5 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-sm z-30 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Target: 25 / Cohort · Unlimited Sessions
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {sessionCount} Completed
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-tight">
            Golf Discovery Studio
          </h1>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
            <span>Storage Email:</span>
            <button
              type="button"
              onClick={onNavigateToStorage}
              className="text-emerald-800 hover:text-emerald-950 font-semibold underline truncate max-w-[190px] cursor-pointer"
              title="Click to configure storage email"
            >
              {storageEmail}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onToggleFrame}
            title={isFramed ? "Switch to Laptop (Wide) Mode" : "Switch to Mobile Phone Mode"}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {isFramed ? (
              <>
                <Laptop className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-[11px]">Laptop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-[11px]">Mobile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
