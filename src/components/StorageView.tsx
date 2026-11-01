import React, { useState } from 'react';
import { StorageConfig, SavedSession, Participant, CohortId } from '../types';
import { COHORTS_DATA } from '../data/researchData';
import {
  Mail,
  HardDrive,
  Send,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Server,
  Database,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  Video,
  Mic,
  Layers,
} from 'lucide-react';

interface StorageViewProps {
  storageConfig: StorageConfig;
  onUpdateStorageConfig: (config: StorageConfig) => Promise<void> | void;
  savedSessions: SavedSession[];
  participants: Participant[];
  onSyncNow?: () => void;
  isSyncing?: boolean;
}

export const StorageView: React.FC<StorageViewProps> = ({
  storageConfig,
  onUpdateStorageConfig,
  savedSessions,
  participants,
  onSyncNow,
  isSyncing,
}) => {
  const [emailInput, setEmailInput] = useState(storageConfig.storageEmail || '');
  const [secondaryEmailInput, setSecondaryEmailInput] = useState(storageConfig.secondaryEmail || '');
  const [studyTitleInput, setStudyTitleInput] = useState(
    storageConfig.studyTitle || '5-Cohort Golf Discovery Study (25 Per Cohort)'
  );
  const [targetPerCohortInput, setTargetPerCohortInput] = useState(
    storageConfig.targetCountPerCohort || 25
  );
  const [isSaved, setIsSaved] = useState(false);
  const [copiedBriefing, setCopiedBriefing] = useState(false);

  const totalTargetCount = targetPerCohortInput * 5; // 25 * 5 = 125
  const completedCount = savedSessions.length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalTargetCount) * 100));

  const totalMediaSecs = savedSessions.reduce((acc, s) => acc + (s.recordedSeconds || 0), 0);
  const videoSessionsCount = savedSessions.filter((s) => s.mediaType === 'video_voice').length;
  const voiceSessionsCount = savedSessions.filter((s) => s.mediaType === 'voice_only').length;

  const estimatedStorageKb = Math.round(
    (JSON.stringify(savedSessions).length + JSON.stringify(participants).length) / 1024
  );

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      alert('Please enter a valid storage email address.');
      return;
    }
    await onUpdateStorageConfig({
      ...storageConfig,
      storageEmail: emailInput.trim(),
      secondaryEmail: secondaryEmailInput.trim(),
      studyTitle: studyTitleInput.trim(),
      targetCountPerCohort: Number(targetPerCohortInput) || 25,
      totalTargetCount: (Number(targetPerCohortInput) || 25) * 5,
      lastExportAt: Date.now(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Generate markdown executive briefing
  const generateMarkdownBriefing = () => {
    let md = `# ${studyTitleInput}\n\n`;
    md += `**Target Storage Destination:** ${emailInput}\n`;
    if (secondaryEmailInput) {
      md += `**Secondary / CC:** ${secondaryEmailInput}\n`;
    }
    md += `**Date of Report:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n`;
    md += `**Overall Quota:** ${completedCount} Completed (Target: ${targetPerCohortInput} per Cohort · ${totalTargetCount} Total Target · Unlimited Capacity)\n`;
    md += `**Media Logged:** ${videoSessionsCount} Video & Voice, ${voiceSessionsCount} Voice-Only\n`;
    md += `**Total Media Duration:** ${Math.floor(totalMediaSecs / 60)}m ${totalMediaSecs % 60}s\n\n`;
    md += `---\n\n`;

    // Cohort breakdown
    md += `## Cohort Breakdown (Target: ${targetPerCohortInput} Each)\n\n`;
    const cohorts: CohortId[] = ['aspiring', 'novice', 'amateur', 'mid', 'coach'];
    cohorts.forEach((cid) => {
      const cInfo = COHORTS_DATA[cid];
      const cSessions = savedSessions.filter((s) => s.cohortId === cid);
      md += `### ${cInfo.name}: ${cSessions.length} of ${targetPerCohortInput} Completed (${Math.round((cSessions.length / targetPerCohortInput) * 100)}%)\n`;
      if (cSessions.length > 0) {
        cSessions.forEach((s, idx) => {
          md += `- **[#${idx + 1}] ${s.participantName || s.participantId || 'Participant'}** (${s.modeName})\n`;
          md += `  * Media: ${s.mediaType} (${Math.floor(s.recordedSeconds / 60)}m ${s.recordedSeconds % 60}s)\n`;
          md += `  * Questions: ${s.questionsAnswered} of ${s.totalQuestions}\n`;
          if (s.notes) md += `  * Notes: ${s.notes.slice(0, 200)}...\n`;
        });
      } else {
        md += `*No sessions completed yet for this cohort.*\n`;
      }
      md += `\n`;
    });

    return md;
  };

  const copyBriefingToClipboard = () => {
    const text = generateMarkdownBriefing();
    navigator.clipboard.writeText(text);
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 2000);
  };

  // Dispatch direct email via mailto
  const openMailtoArchive = () => {
    const subject = encodeURIComponent(
      `[Golf Discovery Archive] ${studyTitleInput} - ${completedCount} Interviews Recorded`
    );
    const bodyContent =
      `Hello Research Stakeholders,\n\n` +
      `Here is the latest customer discovery data archive for: ${studyTitleInput}.\n\n` +
      `Target Storage Email: ${emailInput}\n` +
      `Interviews Completed: ${completedCount} (Target: ${targetPerCohortInput} per cohort across 5 cohorts)\n` +
      `Video & Voice Sessions: ${videoSessionsCount}\n` +
      `Voice-Only Sessions: ${voiceSessionsCount}\n` +
      `Total Recorded Duration: ${Math.floor(totalMediaSecs / 60)} minutes\n\n` +
      `EXECUTIVE SUMMARY & COHORT BREAKDOWN:\n` +
      `====================================\n` +
      generateMarkdownBriefing()
        .replace(/#/g, '')
        .replace(/\*/g, '')
        .slice(0, 1800) +
      `\n\n[Full dataset exported and stored in file-backed database]`;

    const mailtoUrl = `mailto:${encodeURIComponent(emailInput)}?subject=${subject}&body=${encodeURIComponent(
      bodyContent
    )}`;
    window.location.href = mailtoUrl;
  };

  // Export full JSON dataset
  const exportFullJson = () => {
    const exportBundle = {
      studyTitle: studyTitleInput,
      storageEmail: emailInput,
      secondaryEmail: secondaryEmailInput,
      targetPerCohort: targetPerCohortInput,
      totalTargetCount,
      completedCount,
      exportedAt: new Date().toISOString(),
      participants,
      sessions: savedSessions,
    };
    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golf-discovery-5cohort-archive-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export full CSV dataset
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
      'Recorded Seconds',
      'Date Completed',
      'Notes & Observations',
    ];

    const rows = savedSessions.map((s) => [
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
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `golf-discovery-all-cohorts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Target Storage Email Card */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Storage & Delivery Email
              </h3>
              <p className="text-[11px] text-slate-500">
                Designate the external email address for all video, voice, and interview findings
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Active Store
          </span>
        </div>

        <form onSubmit={handleSaveConfig} className="mt-3.5 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Primary Storage Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                placeholder="e.g. discovery-storage@yourcompany.com"
                className="w-full pl-3 pr-20 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400">
                Storage Target
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Video & voice interview archives can be dispatched directly to this email address.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Secondary / CC Email (Optional)
              </label>
              <input
                type="email"
                value={secondaryEmailInput}
                onChange={(e) => setSecondaryEmailInput(e.target.value)}
                placeholder="stakeholder@company.com"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Target Quota Per Cohort
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={targetPerCohortInput}
                onChange={(e) => setTargetPerCohortInput(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
              <span className="text-[9px] text-slate-400 mt-0.5 block">
                Total Target: {targetPerCohortInput * 5} (Unlimited Allowed)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Persisted on server disk and client store</span>
            </span>

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : null}
              <span>{isSaved ? 'Storage Email Saved!' : 'Save Storage Email'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Storage Capacity & Health Card */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-sm font-bold text-slate-900 leading-tight block">
                Unlimited Cohort Storage Capacity
              </strong>
              <span className="text-[11px] text-slate-500">
                Laptop and mobile media files · File database & local dual sync
              </span>
            </div>
          </div>

          {onSyncNow && (
            <button
              type="button"
              onClick={onSyncNow}
              disabled={isSyncing}
              className="text-[11px] font-semibold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          )}
        </div>

        {/* Capacity Bar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
            <span className="text-slate-700">5-Cohort Study Progress</span>
            <span className="text-emerald-800 font-bold">
              {completedCount} / {totalTargetCount} ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-800 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>25 interviews per specific cohort (5 cohorts)</span>
            <span>Unlimited interviews supported</span>
          </div>
        </div>

        {/* Detailed Media Storage Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-500 text-[10px] uppercase font-bold">Video & Voice Media</div>
            <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-emerald-700" />
              <span>{videoSessionsCount} Videos · {voiceSessionsCount} Voices</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Duration: {Math.floor(totalMediaSecs / 60)}m {totalMediaSecs % 60}s</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-slate-500 text-[10px] uppercase font-bold">Database Storage</div>
            <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span>{estimatedStorageKb} KB JSON Data</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Persisted to server/data</div>
          </div>
        </div>
      </div>

      {/* Dispatch & Export Actions */}
      <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-xs">
        <strong className="text-xs font-bold text-slate-900 block mb-2 uppercase tracking-wide">
          Archive & Email Dispatch Options
        </strong>

        <div className="space-y-2">
          {/* Send via Email button */}
          <button
            type="button"
            onClick={openMailtoArchive}
            className="w-full py-3 px-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-between transition-colors shadow-xs cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Send Full Archive to {emailInput || 'Storage Email'}</span>
            </span>
            <span className="text-[10px] font-semibold bg-emerald-700/80 px-2 py-0.5 rounded-md">
              1-Tap Dispatch
            </span>
          </button>

          {/* Copy Markdown Report */}
          <button
            type="button"
            onClick={copyBriefingToClipboard}
            className="w-full py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {copiedBriefing ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copiedBriefing ? 'Report Copied to Clipboard!' : 'Copy 5-Cohort Stakeholder Summary'}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Markdown</span>
          </button>

          {/* Export JSON and CSV */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={exportCsv}
              className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download CSV</span>
            </button>

            <button
              type="button"
              onClick={exportFullJson}
              className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
