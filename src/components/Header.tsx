import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface HeaderProps {
  isFramed: boolean;
  onToggleFrame: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isFramed, onToggleFrame }) => {
  return (
    <header className="px-5 pt-4 pb-3 border-b border-slate-200 sticky top-0 bg-white/95 backdrop-blur-sm z-30 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1 border border-emerald-200/60">
            Stakeholder Test Build
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
            Golf Discovery Studio
          </h1>
          <div className="text-xs text-slate-500 font-medium">
            Iteration 2 · Expanded Research Questions
          </div>
        </div>

        <button
          onClick={onToggleFrame}
          title={isFramed ? "Switch to Wide Presentation View" : "Switch to Mobile Phone Frame"}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
        >
          {isFramed ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-emerald-700" />
              <span>Wide</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
              <span>Phone</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
