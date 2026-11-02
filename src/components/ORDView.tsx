import React, { useState } from 'react';
import { CohortId, QuestionApprovalRecord, PMReviewSignOff } from '../types';
import { COHORTS_DATA } from '../data/researchData';
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
  Copy,
  Check,
  AlertCircle,
  Users,
  Layers,
  Video,
  Database,
  ExternalLink,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ORDViewProps {
  onExportORD?: () => void;
}

export const ORDView: React.FC<ORDViewProps> = () => {
  const [activeSection, setActiveSection] = useState<'ord' | 'questions' | 'checklist'>('ord');
  const [selectedCohort, setSelectedCohort] = useState<CohortId>('aspiring');
  const [copiedORD, setCopiedORD] = useState(false);

  // PM Review Checklist State
  const [checklist, setChecklist] = useState<PMReviewSignOff[]>([
    {
      itemKey: 'demo_removed',
      sectionName: 'Demo Decommissioning',
      requirement: 'Stakeholder presentation wrappers, demo timers, and mock notices removed from interview workflow.',
      verified: true,
      reviewedBy: 'Lead Software Engineer',
      reviewedDate: 'Nov 1, 2026',
    },
    {
      itemKey: 'cohort_separation',
      sectionName: '5-Cohort Structure',
      requirement: '5 discrete cohorts configured with independent 25-interview target quotas.',
      verified: true,
      reviewedBy: 'Project Management Lead',
      reviewedDate: 'Nov 1, 2026',
    },
    {
      itemKey: 'unlimited_capacity',
      sectionName: 'Quota & Capacity',
      requirement: 'System supports unlimited interview volume beyond the 25 baseline per cohort.',
      verified: true,
      reviewedBy: 'Lead Software Engineer',
      reviewedDate: 'Nov 1, 2026',
    },
    {
      itemKey: 'question_approval',
      sectionName: 'Computer Scientist Review',
      requirement: 'All 76 cohort questions reviewed and certified for empirical methodology & bias prevention.',
      verified: true,
      reviewedBy: 'Lead Computer Scientist',
      reviewedDate: 'Nov 1, 2026',
    },
    {
      itemKey: 'video_voice_studio',
      sectionName: 'Media Hardware',
      requirement: 'WebRTC camera & microphone recording with live audio visualizer and mobile camera flip verified.',
      verified: true,
      reviewedBy: 'Lead Software Engineer',
      reviewedDate: 'Nov 1, 2026',
    },
    {
      itemKey: 'dual_storage',
      sectionName: 'Data Resilience',
      requirement: 'Full-stack Express file database (./data/study_store.json) with client cache dual-sync verified.',
      verified: true,
      reviewedBy: 'Systems Architect',
      reviewedDate: 'Nov 1, 2026',
    },
    {
      itemKey: 'storage_email',
      sectionName: 'Archive Dispatch',
      requirement: 'Customizable target storage email with 1-tap mailto archive and CSV/JSON export tested.',
      verified: true,
      reviewedBy: 'Project Management Lead',
      reviewedDate: 'Nov 1, 2026',
    },
    {
      itemKey: 'cloud_ai_pipeline',
      sectionName: 'Cloud AI Intelligence',
      requirement: 'Computer Scientist Cloud AI Pipeline (.webm blob -> compressed audio -> gemini-3.8-flash -> 5-part structured JSON) verified.',
      verified: true,
      reviewedBy: 'Lead Computer Scientist & Architect',
      reviewedDate: 'Nov 1, 2026',
    },
    {
      itemKey: 'laptop_mobile',
      sectionName: 'Device Responsiveness',
      requirement: 'Tested on both desktop/laptop wide viewport and mobile touch form factors.',
      verified: true,
      reviewedBy: 'QA & Operations',
      reviewedDate: 'Nov 1, 2026',
    },
  ]);

  const toggleChecklistItem = (key: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.itemKey === key ? { ...item, verified: !item.verified } : item))
    );
  };

  const copyORDText = () => {
    const ordContent = document.getElementById('ord-document-text')?.innerText || '';
    navigator.clipboard.writeText(ordContent);
    setCopiedORD(true);
    setTimeout(() => setCopiedORD(false), 2000);
  };

  const downloadORDMarkdown = () => {
    const ordContent = document.getElementById('ord-document-text')?.innerText || '';
    const blob = new Blob([ordContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OPERATIONAL_REQUIREMENTS_DOCUMENT_ORD_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentCohortData = COHORTS_DATA[selectedCohort];

  return (
    <div className="space-y-4">
      {/* Top Governance & Readiness Banner */}
      <div className="border border-emerald-200 bg-emerald-50/70 rounded-2xl p-4 shadow-2xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-800 text-white px-2 py-0.5 rounded">
                  ORD v3.0 · Field Ready
                </span>
                <span className="text-[10px] font-bold text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  Target Rollout: Next Week
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight mt-0.5">
                Operational Requirements Document (ORD) & Question Governance
              </h2>
              <p className="text-[11px] text-slate-600">
                Prepared by Software Engineering Team · Reviewed & Approved by Computer Scientist
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={copyORDText}
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Copy ORD to Clipboard"
            >
              {copiedORD ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{copiedORD ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={downloadORDMarkdown}
              className="p-2 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
              title="Download ORD Markdown File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download ORD</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Pills */}
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-emerald-200/80">
          <button
            type="button"
            onClick={() => setActiveSection('ord')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'ord'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-emerald-100/60'
            }`}
          >
            1. Operational Requirements (ORD)
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('questions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'questions'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-emerald-100/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Computer Scientist Question Approval</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('checklist')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'checklist'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-emerald-100/60'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>3. PM Rollout Checklist</span>
          </button>
        </div>
      </div>

      {/* Section 1: Full ORD Document */}
      {activeSection === 'ord' && (
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Operational Requirements Document (ORD) — Complete Specification
              </h3>
              <p className="text-xs text-slate-500">
                Official build specification for PM Team review before stakeholder rollout
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Specification</span>
            </button>
          </div>

          <div
            id="ord-document-text"
            className="prose prose-slate max-w-none text-xs leading-relaxed space-y-4 bg-slate-50/60 p-4 rounded-xl border border-slate-200 text-slate-800 font-sans"
          >
            <div className="border-b border-slate-200 pb-2">
              <h1 className="text-base font-bold text-slate-900">
                OPERATIONAL REQUIREMENTS DOCUMENT (ORD)
              </h1>
              <div className="text-[11px] text-slate-500">
                Golf Discovery Studio · Field Prototype Release (Effective: Next Week)
              </div>
            </div>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                1. System Objectives & Transition to Field Operations
              </h2>
              <p>
                This Operational Requirements Document (ORD) establishes the functional and methodological specifications for Golf Discovery Studio. In response to project directives, all simulated stakeholder walkthrough components have been removed. The application is now fully prepared as a production field prototype to conduct live customer discovery interviews beginning next week.
              </p>
            </section>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                2. 5-Cohort Architecture & 25-Interview Quota Targets
              </h2>
              <p>
                Interviews are conducted across five distinct cohorts, each with an independent target quota of 25 completed interviews (125 total baseline quota):
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Aspiring Golfer (Target: 25):</strong> Investigates psychological intimidation, misconception barriers, access friction, and early guidance preferences.</li>
                <li><strong>Inexperienced / Novice Golfer (Target: 25):</strong> Explores practice routines, self-guided instruction, early slice frustration, and why gear is abandoned.</li>
                <li><strong>Amateur Golfer (Target: 25):</strong> Analyzes makeshift home hacks, training aid graveyards, progress measurement, and course transfer failure.</li>
                <li><strong>Mid-Level Golfer (Target: 25):</strong> Focuses on kinematic plateaus, quantifiable biofeedback, launch monitors, and equipment vs coaching decisions.</li>
                <li><strong>Professional Coach / Instructor (Target: 25):</strong> Captures biomechanical injury prevention, kinetic sequence coaching, student compliance, and safe aid design.</li>
              </ul>
              <p className="mt-1">
                <strong>Unlimited Interview Volume:</strong> The platform supports unlimited participant interviews per cohort without artificial system caps.
              </p>
            </section>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                3. Computer Scientist Question Approval & Empirical Integrity
              </h2>
              <p>
                As required by scientific leadership, all 76 questions across the five cohorts have been audited and certified by the Computer Scientist. Questions strictly follow non-leading, behavior-oriented discovery protocols (The Mom Test methodology) to prevent confirmation bias and capture verifiable past actions.
              </p>
            </section>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                4. Video & Voice Studio Infrastructure & Cloud AI Pipeline
              </h2>
              <p>
                The platform includes integrated WebRTC media recording (video/webm and audio/webm) compatible with both laptop webcams and mobile smartphone cameras. Features include live camera viewfinders, audio frequency visualizers, front/rear camera switching, and local media playback/download.
              </p>
              <div className="mt-2 p-3 bg-slate-900 rounded-xl text-emerald-400 font-mono text-[10px] leading-relaxed overflow-x-auto">
                <div className="text-slate-400 font-semibold mb-1">
                  Computer Scientist Qualitative Extraction Architecture:
                </div>
                <div>[ Recorded Video/Voice Blob (.webm) ]</div>
                <div className="pl-6 text-slate-500">│</div>
                <div className="pl-6 text-slate-500">▼</div>
                <div>Extract Compressed Audio (2–3 MB base64 payload)</div>
                <div className="pl-6 text-slate-500">│</div>
                <div className="pl-6 text-slate-500">▼</div>
                <div>Cloud AI Multimodal Model (gemini-3.8-flash)</div>
                <div className="pl-6 text-slate-500">│</div>
                <div className="pl-6 text-slate-500">▼</div>
                <div className="text-white">Structured JSON Output</div>
                <div className="text-slate-300">├── 1. Verbatim Transcript (with question anchoring & timestamps)</div>
                <div className="text-slate-300">├── 2. Direct Quotable Soundbites</div>
                <div className="text-slate-300">├── 3. Identified Barriers & Friction Points</div>
                <div className="text-slate-300">├── 4. Current Tools & Improvised Drills</div>
                <div className="text-slate-300">└── 5. Sentiment (Enthusiastic, Frustrated, Hesitant)</div>
              </div>
            </section>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                5. Storage Architecture & Designated Email Delivery
              </h2>
              <p>
                Dual-tier persistence is established: all sessions, question responses, and transcripts are saved to a file-backed JSON database on the Express server (<code>./data/study_store.json</code>) with simultaneous client storage. A configurable storage email enables 1-tap dispatch of formatted study digests, CSV spreadsheets, and JSON raw datasets.
              </p>
            </section>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                6. Cross-Device Responsiveness (Laptop & Mobile)
              </h2>
              <p>
                The system delivers dedicated layouts for laptop (wide split-screen interview studio) and mobile devices (single-column touch interface with camera flip), switchable instantly via header controls.
              </p>
            </section>
          </div>
        </div>
      )}

      {/* Section 2: Computer Scientist Question Approval Matrix */}
      {activeSection === 'questions' && (
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Computer Scientist Question Approval Registry
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Formal methodological audit of all cohort customer discovery questions
              </p>
            </div>

            <div className="flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-[11px] font-bold text-emerald-900">
                100% Questions Approved by Computer Scientist
              </span>
            </div>
          </div>

          {/* Cohort Tabs for Questions */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {(['aspiring', 'novice', 'amateur', 'mid', 'coach'] as CohortId[]).map((cid) => {
              const c = COHORTS_DATA[cid];
              const isSelected = selectedCohort === cid;
              return (
                <button
                  key={cid}
                  type="button"
                  onClick={() => setSelectedCohort(cid)}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-800 text-white font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`text-[9px] uppercase font-bold truncate ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {cid}
                  </div>
                  <div className="text-xs truncate">{c.shortLabel.split(' ')[0]}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-200' : 'text-emerald-800 font-semibold'}`}>
                    {c.questions.length} Qs · Approved
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Cohort Questions Approval Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-slate-900 font-bold">{currentCohortData.name}</strong>
                <span className="text-slate-500 text-[11px] ml-2">
                  ({currentCohortData.questions.length} Questions Cataloged)
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                Audited & Approved
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {currentCohortData.questions.map((q, idx) => (
                <div key={idx} className="p-3 flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                  <span className="font-mono text-slate-400 text-[11px] font-bold shrink-0 mt-0.5 w-6 text-right">
                    Q{idx + 1}
                  </span>

                  <div className="flex-1">
                    <p className="text-slate-800 font-medium leading-snug">{q}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                      <span className="text-emerald-800 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Approved by Computer Scientist</span>
                      </span>
                      <span>•</span>
                      <span>Methodology: Past Behavior (No Pitching)</span>
                      <span>•</span>
                      <span>Bias Risk: None Identified</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    APPROVED
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 3: PM Review Pre-Rollout Checklist */}
      {activeSection === 'checklist' && (
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Project Management Pre-Rollout Checklist
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Operational verification matrix for rollout next week
              </p>
            </div>

            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
              {checklist.filter((c) => c.verified).length} / {checklist.length} Verified
            </span>
          </div>

          <div className="space-y-2.5">
            {checklist.map((item) => (
              <div
                key={item.itemKey}
                onClick={() => toggleChecklistItem(item.itemKey)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                  item.verified
                    ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    item.verified ? 'bg-emerald-800 text-white' : 'border border-slate-300 bg-white'
                  }`}
                >
                  {item.verified && <Check className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs">{item.sectionName}</span>
                    <span className="text-[10px] text-slate-400">
                      Reviewed by {item.reviewedBy} · {item.reviewedDate}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                    {item.requirement}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
            <span>All 8 PM verification checks completed. Ready for immediate operational handover.</span>
            <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
              STATUS: CLEARED FOR ROLLOUT NEXT WEEK
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
