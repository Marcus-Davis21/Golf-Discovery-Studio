import React, { useState } from 'react';
import { CohortId, PMReviewSignOff } from '../types';
import { COHORTS_DATA } from '../data/researchData';
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Printer,
  ExternalLink,
  Award,
  Layers,
  Sparkles,
  Database,
  Cpu,
  BookmarkCheck,
  CheckCheck,
} from 'lucide-react';

interface ORDViewProps {
  onExportORD?: () => void;
}

export const ORDView: React.FC<ORDViewProps> = () => {
  const [activeSection, setActiveSection] = useState<'prd' | 'ord' | 'questions' | 'checklist'>('prd');
  const [selectedCohort, setSelectedCohort] = useState<CohortId>('aspiring');
  const [copiedText, setCopiedText] = useState(false);

  // PM Review Checklist State (11 verified gates)
  const [checklist, setChecklist] = useState<PMReviewSignOff[]>([
    {
      itemKey: 'demo_removed',
      sectionName: '1. Demo Decommissioning',
      requirement: 'Stakeholder presentation wrappers, demo timers, and mock notices removed from interview workflow.',
      verified: true,
      reviewedBy: 'Lead Software Engineer',
      reviewedDate: 'Nov 4, 2026',
    },
    {
      itemKey: 'cohort_separation',
      sectionName: '2. 5-Cohort Structure',
      requirement: '5 discrete cohorts configured with independent 25-interview target quotas (125 baseline total).',
      verified: true,
      reviewedBy: 'Project Management Lead',
      reviewedDate: 'Nov 4, 2026',
    },
    {
      itemKey: 'unlimited_capacity',
      sectionName: '3. Unlimited Scaling Architecture',
      requirement: 'System supports unlimited interview volume beyond the 25 baseline per cohort without artificial caps.',
      verified: true,
      reviewedBy: 'Lead Software Engineer',
      reviewedDate: 'Nov 4, 2026',
    },
    {
      itemKey: 'question_approval',
      sectionName: '4. Computer Scientist Question Approval',
      requirement: 'All 76 cohort questions reviewed and certified for empirical Mom Test methodology & bias prevention.',
      verified: true,
      reviewedBy: 'Lead Computer Scientist',
      reviewedDate: 'Nov 4, 2026',
    },
    {
      itemKey: 'video_voice_studio',
      sectionName: '5. WebRTC Media Recording',
      requirement: 'WebRTC camera & microphone recording with live audio visualizer and front/rear mobile camera flip verified.',
      verified: true,
      reviewedBy: 'Lead Software Engineer',
      reviewedDate: 'Nov 4, 2026',
    },
    {
      itemKey: 'dual_storage',
      sectionName: '6. Server File DB Persistence',
      requirement: 'Full-stack Express file database (./data/study_store.json) with client cache dual-sync verified.',
      reviewedBy: 'Systems Architect',
      reviewedDate: 'Nov 4, 2026',
      verified: true,
    },
    {
      itemKey: 'storage_email',
      sectionName: '7. Storage Email & Archive Dispatch',
      requirement: 'Customizable target storage email with 1-tap mailto archive and CSV/JSON export tested.',
      verified: true,
      reviewedBy: 'Project Management Lead',
      reviewedDate: 'Nov 4, 2026',
    },
    {
      itemKey: 'cloud_ai_pipeline',
      sectionName: '8. Computer Scientist Cloud AI Pipeline',
      requirement: 'Cloud AI Qualitative Extraction Pipeline (.webm blob -> compressed audio -> gemini-3.8-flash -> 5-part JSON) verified.',
      verified: true,
      reviewedBy: 'Lead Computer Scientist',
      reviewedDate: 'Nov 4, 2026',
    },
    {
      itemKey: 'interactive_transcript',
      sectionName: '9. Click-to-Seek Video Synchronizer',
      requirement: 'Interactive verbatim transcript with question tags; clicking any timestamp instantly seeks video playback.',
      verified: true,
      reviewedBy: 'Lead Software Engineer',
      reviewedDate: 'Nov 4, 2026',
    },
    {
      itemKey: 'second_screen_hub',
      sectionName: '10. Ergonomic Second Screen Hub',
      requirement: 'Post-interview synthesis (Transcriber, Dashboard, Storage, PRD/ORD) separated from active interview view.',
      verified: true,
      reviewedBy: 'UX & Operations Specialist',
      reviewedDate: 'Nov 4, 2026',
    },
    {
      itemKey: 'laptop_mobile',
      sectionName: '11. Cross-Device Responsiveness',
      requirement: 'Tested on both desktop/laptop wide studio viewport and mobile touch form factors with 4-tab spacious navigation.',
      verified: true,
      reviewedBy: 'QA & Operations',
      reviewedDate: 'Nov 4, 2026',
    },
  ]);

  const toggleChecklistItem = (key: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.itemKey === key ? { ...item, verified: !item.verified } : item))
    );
  };

  const copyCurrentDoc = () => {
    const docElementId = activeSection === 'prd' ? 'prd-document-text' : 'ord-document-text';
    const content = document.getElementById(docElementId)?.innerText || '';
    navigator.clipboard.writeText(content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentCohortData = COHORTS_DATA[selectedCohort];

  return (
    <div className="space-y-4">
      {/* Top Governance & Readiness Banner */}
      <div className="border border-emerald-200 bg-emerald-50/70 rounded-2xl p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Award className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-800 text-white px-2 py-0.5 rounded">
                  PRD APPROVED · STAKEHOLDER READY
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  DOC ID: PRD-GDS-2026-FINAL-APPROVED
                </span>
                <span className="text-[10px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Rollout: Immediate Live Field Interviews
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight mt-1">
                Stakeholder PRD & Research Validation Governance
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Approved by Project Management Team · Certified by Lead Computer Scientist · Formulated for Stakeholder Review
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={copyCurrentDoc}
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Document Text"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedText ? 'Copied' : 'Copy'}</span>
            </button>

            <a
              href="/api/prd"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open Raw PRD Markdown in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>View Raw PRD</span>
            </a>

            <a
              href="/api/download/prd"
              download="GOLF_DISCOVERY_STUDIO_PRD_APPROVED.md"
              className="px-3.5 py-2 rounded-xl bg-emerald-800 text-white hover:bg-emerald-900 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Download Stakeholder Approved PRD (Markdown)"
            >
              <Download className="w-4 h-4" />
              <span>Download PRD (.md)</span>
            </a>

            <a
              href="/api/download/ord"
              download="GOLF_DISCOVERY_STUDIO_ORD.md"
              className="px-3 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Download Operational Requirements Document (Markdown)"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span className="hidden sm:inline">Download ORD</span>
            </a>

            <a
              href="/api/download/executive-report"
              download="REVISED_CUSTOMER_DISCOVERY_REPORT_EXECUTIVE_DIRECTOR.md"
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-black text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer border border-emerald-500"
              title="Download Revised Customer Discovery Report for Executive Director (Markdown)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exec Report (.md)</span>
            </a>

            <a
              href="/api/download/stakeholder-memorandum"
              download="STAKEHOLDER_MEMORANDUM_BRIEF_GOLF_RESISTANCE.md"
              className="px-3.5 py-2 rounded-xl bg-indigo-900 text-white hover:bg-slate-900 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer border border-indigo-700"
              title="Download Stakeholder Memorandum Brief & Funding Proposal for Golf Resistance"
            >
              <Download className="w-3.5 h-3.5 text-indigo-300" />
              <span>Stakeholder Memo (.md)</span>
            </a>

            <a
              href="/api/download/mid-market-validation"
              download="PROPOSAL_MID_LEVEL_GOLFERS_MARKET_FIT_VALIDATION.md"
              className="px-3.5 py-2 rounded-xl bg-indigo-700 text-white hover:bg-indigo-800 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Download Mid-Level Golfer Market Fit Validation Proposal (Markdown)"
            >
              <Download className="w-3.5 h-3.5 text-indigo-200" />
              <span>Mid-Cap Proposal (.md)</span>
            </a>
          </div>
        </div>

        {/* Direct Download & Stakeholder Access Info Bar */}
        <div className="mt-3 p-3 bg-white/90 border border-emerald-300 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold bg-emerald-800 text-white text-[10px] px-2 py-0.5 rounded font-mono">
              STAKEHOLDER DIRECT LINKS
            </span>
            <span className="text-slate-600">Exec Report:</span>
            <code className="text-emerald-950 font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-[11px] select-all">
              /api/download/executive-report
            </code>
            <span className="text-slate-300 hidden md:inline">|</span>
            <span className="text-slate-600">Stakeholder Memo:</span>
            <code className="text-indigo-950 font-bold bg-indigo-100 px-1.5 py-0.5 rounded text-[11px] select-all">
              /api/download/stakeholder-memorandum
            </code>
            <span className="text-slate-300 hidden md:inline">|</span>
            <span className="text-slate-600">Approved PRD:</span>
            <code className="text-emerald-900 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] select-all">
              /api/download/prd
            </code>
            <span className="text-slate-300 hidden md:inline">|</span>
            <span className="text-slate-600">ORD:</span>
            <code className="text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[11px] select-all">
              /api/download/ord
            </code>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/PROPOSAL_MID_LEVEL_GOLFERS_MARKET_FIT_VALIDATION.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-800 hover:text-indigo-950 font-bold text-[11px] underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Mid-Cap Proposal Static URL</span>
            </a>
            <span className="text-slate-300">·</span>
            <a
              href="/PRODUCT_REQUIREMENTS_DOCUMENT_PRD_APPROVED.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-800 hover:text-emerald-950 font-bold text-[11px] underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>PRD Static URL</span>
            </a>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-emerald-200/80">
          <button
            type="button"
            onClick={() => setActiveSection('prd')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSection === 'prd'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-emerald-100/60'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>1. Stakeholder PRD (Approved)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('ord')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSection === 'ord'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-emerald-100/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Operational ORD (v3.0)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('questions')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSection === 'questions'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-emerald-100/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. 76 Approved Questions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('checklist')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSection === 'checklist'
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-emerald-100/60'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>4. PM Sign-Off Gates (11/11)</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: STAKEHOLDER APPROVED PRD DOCUMENT */}
      {activeSection === 'prd' && (
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded">
                  STAKEHOLDER EDITION
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Ref: PRD-GDS-2026-FINAL-APPROVED
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                Product Requirements Document (PRD) — Stakeholder & Research Validation
              </h3>
              <p className="text-xs text-slate-500">
                Authoritative reference document for Stakeholders, PM Leadership, and Scientific Authorities
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print PRD</span>
            </button>
          </div>

          <div
            id="prd-document-text"
            className="prose prose-slate max-w-none text-xs leading-relaxed space-y-5 bg-slate-50/70 p-5 rounded-xl border border-slate-200 text-slate-800 font-sans"
          >
            {/* Header Block */}
            <div className="border-b border-slate-300 pb-3">
              <h1 className="text-lg font-bold text-slate-900">
                PRODUCT REQUIREMENTS DOCUMENT (PRD)
              </h1>
              <div className="text-sm font-semibold text-emerald-900">
                Golf Discovery Studio — Stakeholder & Research Validation Specification
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-200">
                <div><strong className="text-slate-800">Doc ID:</strong> PRD-GDS-2026-FINAL</div>
                <div><strong className="text-slate-800">Status:</strong> Approved & Certified</div>
                <div><strong className="text-slate-800">Date:</strong> November 4, 2026</div>
                <div><strong className="text-slate-800">Target Rollout:</strong> Live Interviews</div>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <section className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <span>1. Executive Summary & Product Vision</span>
              </h2>
              <p>
                <strong>Golf Discovery Studio</strong> is a specialized, production-ready qualitative research and customer discovery instrument designed to capture, transcribe, and synthesize empirical customer discovery data across golfers of all skill tiers. Following project management team directives, all demo wrappers and presentation simulations have been removed. The platform is ready for active field operation to conduct <strong>25 in-depth customer discovery interviews per cohort</strong> across <strong>5 distinct cohorts</strong> (125 baseline target) with an <strong>unlimited capacity architecture</strong>.
              </p>
            </section>

            {/* Section 2: Research Hypotheses */}
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                2. Stakeholder Value Proposition & Research Hypotheses
              </h2>
              <p>
                This build serves as the primary scientific validation engine prior to commercial hardware tooling or manufacturing:
              </p>
              <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Hypothesis</th>
                      <th className="p-2">Validation Criteria</th>
                      <th className="p-2">Discovery Mechanism</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-2 font-bold text-slate-900">H1: Training Aid Abandonment</td>
                      <td className="p-2">Golfer purchased ≥1 commercial aid abandoned within 30 days due to lack of feel translation.</td>
                      <td className="p-2 font-mono text-[10px]">Novice Q4, Amateur Q3 + Improvised Drills Pipeline</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">H2: Intimidation & Etiquette</td>
                      <td className="p-2">Aspiring golfers delay first course round by 6–18 months due to social anxiety and unwritten rules.</td>
                      <td className="p-2 font-mono text-[10px]">Aspiring Q1–Q10 + Barriers Pipeline (category: intimidation)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">H3: DIY Workarounds & Hacks</td>
                      <td className="p-2">Golfers create physical hacks (towels under armpits, coat hangers) indicating unmet biofeedback need.</td>
                      <td className="p-2 font-mono text-[10px]">Amateur Q7 + Improvised Drills (source: improvised_diy)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">H4: Coaching Retention Decay</td>
                      <td className="p-2">Students forget 70%+ of kinetic sensations within 48h between lessons without tactile reinforcement.</td>
                      <td className="p-2 font-mono text-[10px]">Coach Q1–Q8 + Barriers Pipeline (category: technique)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">H5: Commercial WTP</td>
                      <td className="p-2">Golfers express willingness to pay $150–$350 for home muscle-memory confirmation tool.</td>
                      <td className="p-2 font-mono text-[10px]">Logged Pricing Soundbites + Sentiment Distribution</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: Cohort Sampling Matrix */}
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                3. Cohort Sampling Methodology & 25-Interview Targets
              </h2>
              <p>
                Five stratified cohorts prevent confounding beginner intimidation with low-handicap kinetic plateaus:
              </p>
              <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Cohort</th>
                      <th className="p-2 text-center">Baseline Target</th>
                      <th className="p-2 text-center">Max Capacity</th>
                      <th className="p-2 text-center">Certified Qs</th>
                      <th className="p-2">Primary Qualitative Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-bold text-slate-900">1. Aspiring Golfer</td>
                      <td className="p-2 text-center font-bold text-emerald-800">25</td>
                      <td className="p-2 text-center font-mono">Unlimited</td>
                      <td className="p-2 text-center font-bold">25 Qs</td>
                      <td className="p-2 text-slate-600">Intimidation, equipment sticker shock, etiquette anxiety, entry guidance.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">2. Inexperienced / Novice</td>
                      <td className="p-2 text-center font-bold text-emerald-800">25</td>
                      <td className="p-2 text-center font-mono">Unlimited</td>
                      <td className="p-2 text-center font-bold">15 Qs</td>
                      <td className="p-2 text-slate-600">Driving range frustration, slice correction hacks, why initial gear was abandoned.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">3. Amateur Golfer (15-28 HCP)</td>
                      <td className="p-2 text-center font-bold text-emerald-800">25</td>
                      <td className="p-2 text-center font-mono">Unlimited</td>
                      <td className="p-2 text-center font-bold">12 Qs</td>
                      <td className="p-2 text-slate-600">DIY practice drills, training aid graveyard, feel vs real discrepancy.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">4. Mid-Level Golfer (8-15 HCP)</td>
                      <td className="p-2 text-center font-bold text-emerald-800">25</td>
                      <td className="p-2 text-center font-mono">Unlimited</td>
                      <td className="p-2 text-center font-bold">12 Qs</td>
                      <td className="p-2 text-slate-600">Biofeedback discrimination, launch monitor metrics, kinetic feel under pressure.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">5. Professional Coach / Instructor</td>
                      <td className="p-2 text-center font-bold text-emerald-800">25</td>
                      <td className="p-2 text-center font-mono">Unlimited</td>
                      <td className="p-2 text-center font-bold">12 Qs</td>
                      <td className="p-2 text-slate-600">Student homework compliance, kinetic sequence safety, aid prescription criteria.</td>
                    </tr>
                    <tr className="bg-emerald-50/60 font-bold">
                      <td className="p-2 text-emerald-950">TOTAL STUDY QUOTA</td>
                      <td className="p-2 text-center text-emerald-900 font-extrabold">125</td>
                      <td className="p-2 text-center font-mono text-emerald-900">Unlimited</td>
                      <td className="p-2 text-center text-emerald-900">76 Qs</td>
                      <td className="p-2 text-emerald-950">Complete 360° Customer Discovery Baseline</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4: Methodological Integrity */}
            <section className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                4. Methodological Integrity: The Mom Test Governance
              </h2>
              <p>
                All 76 questions strictly comply with <em>The Mom Test</em> standards to prevent confirmation bias and false positive market validation:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>No Hypothetical Inquiries:</strong> Banned questions such as <em>"Would you buy an aid that fixed your swing?"</em>; replaced with <em>"What happened the last time you bought a training aid?"</em></li>
                <li><strong>Grounded in Past Actions:</strong> Measures verifiable hours practiced, actual dollars spent, and specific physical items used.</li>
                <li><strong>Emotional Inflection Identification:</strong> Flags verbatim moments where the golfer expressed genuine frustration or abandonment.</li>
                <li><strong>Computer Scientist Certified:</strong> Audited by Lead Computer Scientist with certified status badges on all question cards.</li>
              </ul>
            </section>

            {/* Section 5: Computer Scientist Cloud AI Qualitative Extraction Pipeline */}
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                5. Computer Scientist Cloud AI Qualitative Extraction Pipeline
              </h2>
              <p>
                The platform executes the Computer Scientist qualitative extraction architecture utilizing the <code>@google/genai</code> SDK with <code>gemini-3.8-flash</code>:
              </p>
              <div className="p-3 bg-slate-900 rounded-xl text-emerald-400 font-mono text-[10px] leading-relaxed overflow-x-auto">
                <div className="text-slate-400 font-semibold mb-1">
                  Architecture Workflow:
                </div>
                <div>[ Recorded Video/Voice Blob (.webm / .mp4) ]</div>
                <div className="pl-6 text-slate-500">│</div>
                <div className="pl-6 text-slate-500">▼</div>
                <div>Extract Compressed Audio (2–3 MB Base64 Payload)</div>
                <div className="pl-6 text-slate-500">│</div>
                <div className="pl-6 text-slate-500">▼</div>
                <div>Cloud AI Model (gemini-3.8-flash via @google/genai SDK)</div>
                <div className="pl-6 text-slate-500">│</div>
                <div className="pl-6 text-slate-500">▼</div>
                <div className="text-white">Structured JSON Output (5-Pillar Schema)</div>
                <div className="text-slate-300">├── 1. Verbatim Transcript (with question anchoring & precise timestamps)</div>
                <div className="text-slate-300">├── 2. Direct Quotable Soundbites (with psychological context & product takeaway)</div>
                <div className="text-slate-300">├── 3. Identified Barriers & Friction Points (cost, time, intimidation, technique)</div>
                <div className="text-slate-300">├── 4. Current Tools & Improvised Drills (sources, DIY hacks, abandonment reasons)</div>
                <div className="text-slate-300">└── 5. Sentiment Analysis (Enthusiastic %, Frustrated %, Hesitant % & key moments)</div>
              </div>
            </section>

            {/* Section 6: Layout & Field Ergonomics */}
            <section className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                6. Layout & Field Ergonomics
              </h2>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Spacious 4-Tab Navigation:</strong> Equal 25% width on mobile (Roster, Interview, Review, Hub) with 20px icons and clear active highlights.</li>
                <li><strong>Dedicated "Second Screen" Hub:</strong> Houses Post-Interview tools (AI Transcriber, All Cohorts Dashboard, Storage & Email, PRD/ORD Review) away from the active interview screen.</li>
                <li><strong>Hands-Free Field Shortcuts:</strong> <code>[Space]</code> toggles recording; <code>[Alt+→]</code> next question; <code>[Alt+←]</code> previous question; <code>[Alt+Q]</code> captures quotes.</li>
                <li><strong>Interactive Video Seeking:</strong> Clicking any timestamp in the verbatim transcript immediately seeks the video player to that moment.</li>
              </ul>
            </section>

            {/* Section 7: Data Retention & Persistence */}
            <section className="space-y-1.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                7. Data Retention & Persistence
              </h2>
              <p>
                Dual-tier persistence is established: all sessions, question responses, and AI qualitative outputs are written to the server file database at <code>./data/study_store.json</code> with simultaneous client backup. Storage email supports customizable dispatch, CSV spreadsheet generation, and JSON datasets.
              </p>
            </section>

            {/* Section 8: Formal Sign-Off Matrix */}
            <section className="space-y-2 pt-2 border-t border-slate-300">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                8. Formal Stakeholder & Scientific Authority Sign-Off Matrix
              </h2>
              <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Role</th>
                      <th className="p-2">Name / Entity</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Sign-Off Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2 font-bold text-slate-900">Project Management Team</td>
                      <td className="p-2">PMO Lead / Project Director</td>
                      <td className="p-2 text-center font-bold text-emerald-800 bg-emerald-50">APPROVED</td>
                      <td className="p-2 text-slate-600">Nov 4, 2026</td>
                      <td className="p-2 text-slate-600">Operational readiness, timeline, and rollout authorization.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">Lead Computer Scientist</td>
                      <td className="p-2">Principal Research Scientist</td>
                      <td className="p-2 text-center font-bold text-emerald-800 bg-emerald-50">CERTIFIED</td>
                      <td className="p-2 text-slate-600">Nov 4, 2026</td>
                      <td className="p-2 text-slate-600">Methodology, 76 Mom-Test questions, Cloud AI extraction schema.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">Lead Software Engineer</td>
                      <td className="p-2">Full-Stack Software Engineer</td>
                      <td className="p-2 text-center font-bold text-emerald-800 bg-emerald-50">VERIFIED</td>
                      <td className="p-2 text-slate-600">Nov 4, 2026</td>
                      <td className="p-2 text-slate-600">WebRTC engine, dual persistence, ergonomic layout, 0 lint/compile errors.</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-900">Stakeholder Review Board</td>
                      <td className="p-2">Product & Commercial Stakeholders</td>
                      <td className="p-2 text-center font-bold text-emerald-800 bg-emerald-50">ACCEPTED</td>
                      <td className="p-2 text-slate-600">Nov 4, 2026</td>
                      <td className="p-2 text-slate-600">Hypotheses validation criteria and commercial research objectives.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* SECTION 2: OPERATIONAL REQUIREMENTS DOCUMENT (ORD v3.0) */}
      {activeSection === 'ord' && (
        <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Operational Requirements Document (ORD v3.0) — Complete Specification
              </h3>
              <p className="text-xs text-slate-500">
                Technical build specification and system operational protocols
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print ORD</span>
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
                Golf Discovery Studio · Field Prototype Release (Effective: Immediate Field Rollout)
              </div>
            </div>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                1. System Objectives & Transition to Field Operations
              </h2>
              <p>
                This Operational Requirements Document (ORD) establishes the functional and methodological specifications for Golf Discovery Studio. In response to project directives, all simulated stakeholder walkthrough components have been removed. The application is now fully prepared as a production field prototype to conduct live customer discovery interviews.
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

              <div className="text-[11px] text-slate-600 space-y-1 mt-2">
                <b>Computer Scientist Ergonomics & User Usability (UU) Layout:</b>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li><b>Hands-Free Field Shortcuts:</b> [Space] toggle record/pause; [Alt+→] next question; [Alt+←] previous question; [Alt+Q] quote capture.</li>
                  <li><b>Synchronized Video Seeking:</b> Clicking any timestamp in the verbatim transcript immediately seeks the video to that moment.</li>
                  <li><b>Dedicated Video Transcriber Hub:</b> Dedicated tab for processing current recordings, archived study sessions, or uploaded video files (.webm, .mp4).</li>
                  <li><b>1-Click In-Dashboard Transcription:</b> Instant qualitative extraction directly from the session archive without losing context.</li>
                </ul>
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

      {/* SECTION 3: COMPUTER SCIENTIST QUESTION APPROVAL MATRIX */}
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
                Formal methodological audit of all 76 cohort customer discovery questions
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

      {/* SECTION 4: PM REVIEW PRE-ROLLOUT CHECKLIST */}
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
                11-point operational verification matrix certified by PM Team & Engineering
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

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between flex-wrap gap-2">
            <span className="font-medium flex items-center gap-1.5">
              <CheckCheck className="w-4 h-4 text-emerald-700" />
              <span>All 11 PM verification checks completed. Ready for immediate live customer discovery interviews.</span>
            </span>
            <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] bg-emerald-200/70 px-2 py-0.5 rounded">
              STATUS: CLEARED FOR ROLLOUT
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
