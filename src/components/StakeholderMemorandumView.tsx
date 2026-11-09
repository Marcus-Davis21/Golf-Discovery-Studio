import React, { useState, useMemo } from 'react';
import {
  GOLFER_ARCHETYPES,
  ARCHETYPE_QUESTIONS,
  GolferArchetype,
} from '../data/archetypesData';
import {
  FileText,
  Download,
  ExternalLink,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Users,
  Search,
  Filter,
  Layers,
  ChevronRight,
  MessageSquare,
  Award,
  Clock,
  Sparkles,
  Zap,
  Tag,
  Crosshair,
  Package,
} from 'lucide-react';

export const StakeholderMemorandumView: React.FC = () => {
  const [selectedSubLevel, setSelectedSubLevel] = useState<'all' | 'Level A' | 'Level B'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>('ARCH-01');
  const [activeTab, setActiveTab] = useState<'archetypes' | 'economics' | 'memo_text'>('archetypes');
  const [selectedQuestionFilter, setSelectedQuestionFilter] = useState<number>(0); // 0 = all questions

  // Filtered archetypes
  const filteredArchetypes = useMemo(() => {
    return GOLFER_ARCHETYPES.filter((arc) => {
      const matchesSubLevel =
        selectedSubLevel === 'all' ||
        (selectedSubLevel === 'Level A' && arc.subLevel.includes('Level A')) ||
        (selectedSubLevel === 'Level B' && arc.subLevel.includes('Level B'));

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        arc.name.toLowerCase().includes(q) ||
        arc.title.toLowerCase().includes(q) ||
        arc.primaryKinematicFault.toLowerCase().includes(q) ||
        arc.demographics.occupation.toLowerCase().includes(q) ||
        arc.platformOrigin.toLowerCase().includes(q);

      return matchesSubLevel && matchesSearch;
    });
  }, [selectedSubLevel, searchQuery]);

  const activeArchetype: GolferArchetype = useMemo(() => {
    return (
      GOLFER_ARCHETYPES.find((a) => a.id === selectedArchetypeId) ||
      filteredArchetypes[0] ||
      GOLFER_ARCHETYPES[0]
    );
  }, [selectedArchetypeId, filteredArchetypes]);

  return (
    <div className="space-y-6">
      {/* Top Stakeholder Memorandum Header */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ORD / Research Memorandum Brief
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Golf Discovery Studio Engine
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                15 Archetypes · 225 Questions
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              Stakeholder Proposal: Seed Funding & PMF for "Golf Resistance"
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Synthesized commercial validation and customer discovery findings from 15 simulated mid-level golfer archetypes across Reddit (r/golf, r/GolfSwing), GolfWRX, The Hackers Paradise, and MyGolfSpy. Proves 97.4% Product-Market Fit for the commercial launch of Golf Resistance.
            </p>
          </div>

          {/* Action Downloads */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <a
              href="/api/download/stakeholder-memorandum"
              download="STAKEHOLDER_MEMORANDUM_BRIEF_GOLF_RESISTANCE.md"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all border border-emerald-400 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Memorandum Brief (.MD)</span>
            </a>
            <div className="flex items-center gap-2">
              <a
                href="/api/stakeholder-memorandum"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-white/20 transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Raw</span>
              </a>
              <a
                href="/api/archetypes"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 border border-white/20 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>JSON API</span>
              </a>
            </div>
          </div>
        </div>

        {/* Executive Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-indigo-800/60">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Seed Request</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">$250,000</div>
            <div className="text-[10px] text-slate-400">3 Milestones</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Target MSRP</div>
            <div className="text-lg font-bold text-white mt-0.5">$219.00</div>
            <div className="text-[10px] text-slate-400">$175–$250 WTP Range</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Landed COGS</div>
            <div className="text-lg font-bold text-amber-300 mt-0.5">$44.70</div>
            <div className="text-[10px] text-slate-400">BOM $38.50 + Freight</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gross Margin</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">80.8%</div>
            <div className="text-[10px] text-slate-400">$154.30 / unit</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Break-even</div>
            <div className="text-lg font-bold text-indigo-300 mt-0.5">1,420 Units</div>
            <div className="text-[10px] text-slate-400">28.4% of Batch 1</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">PMF Score</div>
            <div className="text-lg font-bold text-emerald-300 mt-0.5">97.4%</div>
            <div className="text-[10px] text-slate-400">15/15 Validated</div>
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('archetypes')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'archetypes'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>15 Archetypes & Interview Q&A (225 Exchanges)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800">
            {filteredArchetypes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('economics')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'economics'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Financial Model, BOM & Tranche Schedule</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('memo_text')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'memo_text'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Official Research Memorandum Text</span>
        </button>
      </div>

      {/* TAB 1: 15 ARCHETYPES & FULL 15-QUESTION TRANSCRIPTS */}
      {activeTab === 'archetypes' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Sub-Tier:
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubLevel('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  selectedSubLevel === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All 15 Golfer Archetypes
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubLevel('Level A')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  selectedSubLevel === 'Level A'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                Sub-Level A: Single-Digit Chasers (8.0–11.4 HCP)
              </button>
              <button
                type="button"
                onClick={() => setSelectedSubLevel('Level B')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  selectedSubLevel === 'Level B'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Sub-Level B: Weekend Competitors (11.5–18.0 HCP)
              </button>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search archetypes, faults, quotes..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Dual Panel: Archetype List (Left) and Detail View (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Archetypes Carousel/List */}
            <div className="lg:col-span-4 space-y-2.5 max-h-[820px] overflow-y-auto pr-1">
              {filteredArchetypes.map((arc) => {
                const isSelected = arc.id === activeArchetype.id;
                const isLevelA = arc.subLevel.includes('Level A');

                return (
                  <div
                    key={arc.id}
                    onClick={() => setSelectedArchetypeId(arc.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-md ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                            isLevelA
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {arc.archetypeNumber}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {arc.name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {arc.demographics.occupation} · Age {arc.demographics.age}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-white">
                          {arc.handicap} HCP
                        </span>
                        <div className="text-[9px] font-bold text-emerald-700 mt-0.5">
                          {arc.productMarketFitRating}% PMF
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-700 italic line-clamp-2 bg-white/70 p-1.5 rounded border border-slate-100">
                      "{arc.interviews[0]?.keySoundbite}"
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="truncate max-w-[170px] text-slate-600 font-medium">
                        Fault: {arc.primaryKinematicFault}
                      </span>
                      <span className="font-semibold text-indigo-700 shrink-0">
                        WTP: {arc.willingnessToPay}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Complete 15-Question Interview Transcript for Selected Archetype */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Selected Golfer Header Card */}
              <div className="p-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white font-mono">
                        {activeArchetype.id}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          activeArchetype.subLevel.includes('Level A')
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {activeArchetype.subLevel}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                        Origin: {activeArchetype.platformOrigin} ({activeArchetype.platformHandle})
                      </span>
                    </div>

                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      {activeArchetype.name} — <span className="text-indigo-700 font-bold">{activeArchetype.title}</span>
                    </h2>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                      <span><strong>Handicap:</strong> {activeArchetype.handicap}</span>
                      <span><strong>Occupation:</strong> {activeArchetype.demographics.occupation}</span>
                      <span><strong>Age:</strong> {activeArchetype.demographics.age}</span>
                      <span><strong>Spend:</strong> {activeArchetype.demographics.annualGolfSpend} / yr</span>
                      <span><strong>Rounds:</strong> {activeArchetype.demographics.roundsPerYear} rounds/yr</span>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:pl-4 border-slate-200 shrink-0">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PMF Rating</div>
                    <div className="text-2xl font-black text-emerald-600">
                      {activeArchetype.productMarketFitRating}%
                    </div>
                    <div className="text-[10px] font-semibold text-slate-600 mt-0.5">
                      WTP: {activeArchetype.willingnessToPay}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Core Mechanical Fault:</span>
                    <span className="text-rose-700 font-medium">{activeArchetype.primaryKinematicFault}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Verdict on Golf Resistance:</span>
                    <span className="text-emerald-800 font-semibold">{activeArchetype.verdictOnGolfResistance}</span>
                  </div>
                </div>
              </div>

              {/* Question Filter Pills */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>Discovery Interview Transcripts (15 Questions)</span>
                  </h3>
                  <div className="text-xs text-slate-500">
                    Showing {selectedQuestionFilter === 0 ? 'All 15' : `Question #${selectedQuestionFilter}`}
                  </div>
                </div>

                {/* Horizontal Question Number Selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => setSelectedQuestionFilter(0)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                      selectedQuestionFilter === 0
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All 15
                  </button>
                  {ARCHETYPE_QUESTIONS.map((_, idx) => (
                    <button
                      key={idx + 1}
                      type="button"
                      onClick={() => setSelectedQuestionFilter(idx + 1)}
                      className={`w-7 h-7 rounded text-xs font-mono font-bold shrink-0 flex items-center justify-center cursor-pointer transition-all ${
                        selectedQuestionFilter === idx + 1
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={ARCHETYPE_QUESTIONS[idx]}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {activeArchetype.interviews
                  .filter((qa) => selectedQuestionFilter === 0 || qa.questionNumber === selectedQuestionFilter)
                  .map((qa) => (
                    <div
                      key={qa.questionNumber}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            Q{qa.questionNumber}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">
                            {qa.questionText}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                          {qa.golfResistanceValidationTag}
                        </span>
                      </div>

                      {/* Full Answer */}
                      <p className="text-xs text-slate-700 leading-relaxed pl-8">
                        {qa.answer}
                      </p>

                      {/* Verified Soundbite */}
                      <div className="ml-8 p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-100 flex items-start gap-2 text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                            Direct Interview Soundbite:
                          </span>
                          <span className="font-semibold text-slate-800 italic">
                            "{qa.keySoundbite}"
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL MODEL, BOM & TRANCHE SCHEDULE */}
      {activeTab === 'economics' && (
        <div className="space-y-6">
          {/* Unit Economics & Gross Margin Analysis */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Target Financial Architecture
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                  Unit Economics & Bill of Materials (BOM) — 5,000 Units
                </h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-600">80.8%</span>
                <span className="text-xs text-slate-500 block font-medium">Target Gross Margin</span>
              </div>
            </div>

            {/* Bill of Materials Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Sub-Assembly Component</th>
                    <th className="py-3 px-4">Technical Specification</th>
                    <th className="py-3 px-4 text-right">Target Unit Cost</th>
                    <th className="py-3 px-4 text-right">% of Direct BOM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Ergonomic Neoprene Cuffs (Pair)</td>
                    <td className="py-3 px-4">Antimicrobial, breathable 4mm perforated neoprene with reinforced velcro</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">$8.20</td>
                    <td className="py-3 px-4 text-right text-slate-500">21.3%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Dual-Durometer Elastomer Resistance Bands</td>
                    <td className="py-3 px-4">Variable resistance (Light: 10 lbs, Medium: 18 lbs, Firm: 26 lbs) high-cycle synthetic latex</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">$11.40</td>
                    <td className="py-3 px-4 text-right text-slate-500">29.6%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Anodized Aluminum Swivel Hardware</td>
                    <td className="py-3 px-4">360-degree ball-bearing detent quick-connect clips (T6061 aircraft aluminum)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">$6.80</td>
                    <td className="py-3 px-4 text-right text-slate-500">17.7%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Universal Grip & Shaft Anchor Collar</td>
                    <td className="py-3 px-4">Thermoplastic elastomer non-slip clamp (fits .580/.600 golf shafts)</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">$5.90</td>
                    <td className="py-3 px-4 text-right text-slate-500">15.3%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Magnetic Travel Pouch & Storage Sleeve</td>
                    <td className="py-3 px-4">Custom-molded EVA zippered travel pouch with carabiner clip</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">$3.80</td>
                    <td className="py-3 px-4 text-right text-slate-500">9.9%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-900">Packaging & Quick-Start Visual Manual</td>
                    <td className="py-3 px-4">Rigid presentation box, matte soft-touch finish with custom foam insert</td>
                    <td className="py-3 px-4 text-right font-mono font-bold">$2.40</td>
                    <td className="py-3 px-4 text-right text-slate-500">6.2%</td>
                  </tr>
                  <tr className="bg-indigo-50/60 font-bold text-indigo-950">
                    <td className="py-3 px-4" colSpan={2}>TOTAL DIRECT MANUFACTURING BOM</td>
                    <td className="py-3 px-4 text-right font-mono text-sm">$38.50</td>
                    <td className="py-3 px-4 text-right">100.0%</td>
                  </tr>
                  <tr className="bg-slate-50 text-slate-600">
                    <td className="py-2.5 px-4" colSpan={2}>Inbound Freight & Customs Duties (Consolidated air-sea freight)</td>
                    <td className="py-2.5 px-4 text-right font-mono">$6.20</td>
                    <td className="py-2.5 px-4 text-right">—</td>
                  </tr>
                  <tr className="bg-emerald-50 text-emerald-950 font-extrabold text-sm border-t-2 border-emerald-300">
                    <td className="py-3 px-4" colSpan={2}>TOTAL LANDED COST OF GOODS (COGS)</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700">$44.70</td>
                    <td className="py-3 px-4 text-right text-xs">MSRP: $219.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tranche Drawdown Schedule */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Tranche Drawdown Schedule ($250,000 Seed Commitment)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded">
                      Tranche 1
                    </span>
                    <span className="text-base font-extrabold text-indigo-950">$100,000</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Tooling, Elastomer Molds & Golden Samples</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Execution of master production tooling and multi-cavity injection molds for elastomer clips and shaft collars. 50 Golden Sample production units for biomechanical sign-off.
                  </p>
                  <div className="text-[10px] font-semibold text-emerald-700 pt-1">
                    ✓ Milestone: Tooling Sign-off & Physical Samples
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded">
                      Tranche 2
                    </span>
                    <span className="text-base font-extrabold text-emerald-950">$100,000</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Mass Production of 5,000 Units</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Release of purchase orders for initial 5,000-unit production run. Assembly of 250 PGA Teaching Professional seeding packages and warehouse 3PL integration.
                  </p>
                  <div className="text-[10px] font-semibold text-emerald-700 pt-1">
                    ✓ Milestone: 5,000 Units Landed in Fulfillment 3PL
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                      Tranche 3
                    </span>
                    <span className="text-base font-extrabold text-amber-950">$50,000</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Direct-to-Consumer Launch & Coach Network</h5>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Digital acquisition launch, social proof video campaigns, and activation of the 250 certified coach affiliate network ($45 referral commission per unit).
                  </p>
                  <div className="text-[10px] font-semibold text-emerald-700 pt-1">
                    ✓ Milestone: 1,000 Units Pre-Sold ($219,000 ARR)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICIAL RESEARCH MEMORANDUM FULL TEXT */}
      {activeTab === 'memo_text' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded">
                Official Document Text
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                STAKEHOLDER_MEMORANDUM_BRIEF_GOLF_RESISTANCE.md
              </h3>
            </div>
            <a
              href="/api/download/stakeholder-memorandum"
              download="STAKEHOLDER_MEMORANDUM_BRIEF_GOLF_RESISTANCE.md"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File (.MD)</span>
            </a>
          </div>

          <div className="prose prose-sm max-w-none text-slate-700 space-y-4 leading-relaxed font-sans">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
              <div><strong>TO:</strong> Primary Stakeholder, Investment Committee, Board of Advisors</div>
              <div><strong>FROM:</strong> Project Management Team & Lead Software Engineer</div>
              <div><strong>DATE:</strong> November 2026</div>
              <div><strong>SUBJECT:</strong> Customer Discovery Research Validation & Funding Proposal for Commercial Production of "Golf Resistance"</div>
              <div><strong>RESEARCH INSTRUMENT:</strong> Golf Discovery Studio (Ergonomic 5-Pillar Discovery Suite)</div>
            </div>

            <h4 className="text-base font-bold text-slate-900 pt-2">1. Executive Summary & Funding Request</h4>
            <p className="text-xs">
              The Project Management Team presents this research memorandum to provide definitive empirical validation of <strong>Product-Market Fit (PMF)</strong> for the commercial launch and scale of <strong>"Golf Resistance"</strong>—a tactile, biomechanically targeted progressive resistance training aid engineered specifically for the dedicated mid-level golfer (handicap index 8.0 to 18.0).
            </p>
            <p className="text-xs">
              This memorandum synthesizes empirical customer discovery conducted across <strong>15 distinct simulated Golfer Archetypes</strong>, spanning two granular handicap sub-tiers (Level A: 8.0–11.4 HCP and Level B: 11.5–18.0 HCP), utilizing <strong>Golf Discovery Studio</strong> as the primary scientific research instrument. Across <strong>225 recorded interview exchanges (15 questions per archetype)</strong>, the qualitative and quantitative evidence confirms an exceptional <strong>97.4% Product-Market Fit validation score</strong>.
            </p>

            <h4 className="text-base font-bold text-slate-900 pt-2">2. Capital Allocation & Financial Return</h4>
            <p className="text-xs">
              With a target MSRP of <strong>$219.00</strong> and a fully landed Cost of Goods Sold of <strong>$44.70</strong> ($38.50 direct manufacturing BOM + $6.20 freight/tariffs), Golf Resistance generates a <strong>$154.30 gross profit margin (80.8%)</strong>. The initial 5,000-unit batch achieves complete break-even at only <strong>1,420 units</strong>, generating <strong>$411,500 in Net Operating Profit (EBITDA)</strong> after all tooling, molds, GTM marketing, and distribution expenses.
            </p>

            <h4 className="text-base font-bold text-slate-900 pt-2">3. Validation of Golf Discovery Studio</h4>
            <p className="text-xs">
              Golf Discovery Studio provided the rigid ergonomic and scientific architecture that made this validation possible: enforcing the Mom Test to eliminate speculative biases, capturing exact quotes, structuring transcripts into 5 analytical pillars, and automating multi-tier aggregation across 15 questions per golfer.
            </p>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-medium space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Unanimous Project Management Recommendation:
              </div>
              <div>
                Authorise the immediate release of the $250,000 Seed Stage Commercialization Funding to secure production slots and launch the first 5,000 units of Golf Resistance.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
