import React, { useState } from 'react';
import { AIQualitativeAnalysis, SavedSession } from '../types';
import {
  Sparkles,
  FileText,
  Quote,
  AlertTriangle,
  Wrench,
  Smile,
  Frown,
  Meh,
  Cpu,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';

interface AIQualitativePanelProps {
  analysis?: AIQualitativeAnalysis;
  onRunAnalysis: () => Promise<void> | void;
  isLoading: boolean;
  participantName?: string;
  hasMediaRecording?: boolean;
}

export const AIQualitativePanel: React.FC<AIQualitativePanelProps> = ({
  analysis,
  onRunAnalysis,
  isLoading,
  participantName,
  hasMediaRecording,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'transcript' | 'quotes' | 'barriers' | 'tools' | 'sentiment'>('all');
  const [copied, setCopied] = useState(false);

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'Enthusiastic':
        return <Smile className="w-4 h-4 text-emerald-600" />;
      case 'Frustrated':
        return <Frown className="w-4 h-4 text-rose-600" />;
      case 'Hesitant':
        return <Meh className="w-4 h-4 text-amber-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-600" />;
    }
  };

  const copyAnalysis = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-indigo-200 bg-linear-to-b from-indigo-50/50 to-white rounded-2xl p-4 shadow-xs space-y-3.5">
      {/* Header & Computer Scientist Architecture Banner */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                Computer Scientist Pipeline
              </span>
              <span className="text-[10px] font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                gemini-3.8-flash
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight mt-0.5">
              AI Qualitative Extraction & Transcription
            </h3>
            <p className="text-[10px] text-slate-500">
              Converts recorded audio/video into structured transcripts, quotes, barriers, and sentiment
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRunAnalysis}
          disabled={isLoading}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            isLoading
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Processing Pipeline...' : analysis ? 'Re-Run Analysis' : 'Run AI Extraction'}</span>
        </button>
      </div>

      {/* Pipeline Status Flow Box */}
      {!analysis && !isLoading && (
        <div className="p-3 bg-white border border-indigo-100 rounded-xl text-xs text-slate-600 space-y-2">
          <div className="text-[11px] font-bold text-indigo-950 uppercase tracking-wide">
            Automated 5-Step Extraction Flow:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 text-[10px] text-center">
            <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 font-semibold text-indigo-900">
              1. Verbatim Transcript
            </div>
            <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 font-semibold text-indigo-900">
              2. Quotable Soundbites
            </div>
            <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 font-semibold text-indigo-900">
              3. Friction Barriers
            </div>
            <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 font-semibold text-indigo-900">
              4. Tools & DIY Drills
            </div>
            <div className="p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 font-semibold text-indigo-900">
              5. Sentiment Gauge
            </div>
          </div>
          <p className="text-[11px] text-slate-500 italic text-center pt-1">
            Tap "Run AI Extraction" to parse recorded media or session responses into verified customer discovery intelligence.
          </p>
        </div>
      )}

      {/* Loading Animation */}
      {isLoading && (
        <div className="p-6 bg-white border border-indigo-200 rounded-xl text-center space-y-2.5 animate-fadeIn">
          <div className="inline-block p-3 rounded-full bg-indigo-50 text-indigo-600 animate-pulse">
            <Cpu className="w-6 h-6 animate-spin" />
          </div>
          <div className="text-xs font-bold text-slate-900">
            Executing Cloud AI Pipeline for {participantName || 'Session'}...
          </div>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Extracting audio stream → Querying Gemini model → Anchoring questions and sentiment scores
          </p>
        </div>
      )}

      {/* Extracted Structured Intelligence Cards */}
      {analysis && !isLoading && (
        <div className="space-y-3 animate-fadeIn">
          {/* Quick Filter Navigation */}
          <div className="flex gap-1 overflow-x-auto py-0.5 no-scrollbar text-[11px] font-semibold border-b border-indigo-100 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'all' ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Sections
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('transcript')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'transcript' ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              1. Transcript ({analysis.verbatimTranscript.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('quotes')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'quotes' ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              2. Soundbites ({analysis.quotableSoundbites.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('barriers')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'barriers' ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              3. Barriers ({analysis.identifiedBarriers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tools')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'tools' ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              4. Tools & DIY ({analysis.currentToolsAndDrills.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sentiment')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'sentiment' ? 'bg-indigo-600 text-white font-bold' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              5. Sentiment ({analysis.sentimentAnalysis?.overall})
            </button>
          </div>

          {/* 1. Verbatim Transcript */}
          {(activeTab === 'all' || activeTab === 'transcript') && (
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Verbatim Transcript (Question Anchored)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {analysis.verbatimTranscript.length} Spoken Turns
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {analysis.verbatimTranscript.map((turn, i) => (
                  <div key={i} className="pt-2 first:pt-0 text-[11px]">
                    <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 mb-0.5">
                      <span className="font-semibold text-slate-700">{turn.speaker}</span>
                      <span className="font-mono bg-slate-100 px-1 rounded">{turn.timestamp}</span>
                    </div>
                    {turn.questionAnchor && (
                      <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 rounded inline-block mb-0.5">
                        {turn.questionAnchor}
                      </span>
                    )}
                    <p className="text-slate-800 leading-snug">{turn.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Direct Quotable Soundbites */}
          {(activeTab === 'all' || activeTab === 'quotes') && (
            <div className="p-3 bg-white border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-amber-700" />
                  <span>2. Direct Quotable Soundbites</span>
                </span>
                <span className="text-[10px] text-amber-800 font-semibold">High Impact</span>
              </div>

              <div className="space-y-2">
                {analysis.quotableSoundbites.map((sb, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs">
                    <p className="italic font-bold text-slate-900">"{sb.quote}"</p>
                    <div className="text-[10px] text-slate-500 mt-1">
                      <span className="font-semibold text-slate-700">Context:</span> {sb.context}
                    </div>
                    <div className="text-[10px] text-indigo-900 mt-0.5 bg-white p-1 rounded border border-indigo-100">
                      <span className="font-semibold">Significance:</span> {sb.significance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Identified Barriers & Friction Points */}
          {(activeTab === 'all' || activeTab === 'barriers') && (
            <div className="p-3 bg-white border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-rose-950">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>3. Identified Barriers & Friction Points</span>
                </span>
                <span className="text-[10px] text-rose-700">Root Causes</span>
              </div>

              <div className="space-y-1.5">
                {analysis.identifiedBarriers.map((b, i) => (
                  <div key={i} className="p-2 rounded-lg bg-rose-50/40 border border-rose-100 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <strong className="text-slate-900 font-bold">{b.barrier}</strong>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-bold uppercase bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                          {b.category}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            b.severity === 'high'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.severity}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 italic">"{b.participantVerbatim}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Current Tools & Improvised Drills */}
          {(activeTab === 'all' || activeTab === 'tools') && (
            <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-700" />
                  <span>4. Current Tools & Improvised Drills Graveyard</span>
                </span>
                <span className="text-[10px] text-slate-400">Workarounds</span>
              </div>

              <div className="space-y-1.5">
                {analysis.currentToolsAndDrills.map((t, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-slate-900">{t.toolOrDrill}</span>
                      <span className="text-[9px] font-semibold bg-emerald-100 text-emerald-900 px-1.5 rounded">
                        {t.source.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <span className="font-medium text-slate-700">Outcome:</span> {t.outcome}
                    </div>
                    {t.abandonedReason && (
                      <div className="text-[10px] text-rose-800 bg-rose-50 p-1 rounded mt-0.5">
                        <span className="font-bold">Why Abandoned:</span> {t.abandonedReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Sentiment Analysis */}
          {(activeTab === 'all' || activeTab === 'sentiment') && (
            <div className="p-3 bg-white border border-indigo-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                <span className="flex items-center gap-1.5">
                  {getSentimentIcon(analysis.sentimentAnalysis?.overall)}
                  <span>5. Sentiment Analysis: {analysis.sentimentAnalysis?.overall}</span>
                </span>
                <span className="text-[10px] text-indigo-800 font-mono">
                  {analysis.modelUsed}
                </span>
              </div>

              {/* Progress Bars */}
              {analysis.sentimentAnalysis?.breakdown && (
                <div className="space-y-1.5 text-[10px] pt-1">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-600 mb-0.5">
                      <span>Frustrated</span>
                      <span>{analysis.sentimentAnalysis.breakdown.frustratedScore}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${analysis.sentimentAnalysis.breakdown.frustratedScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-600 mb-0.5">
                      <span>Hesitant</span>
                      <span>{analysis.sentimentAnalysis.breakdown.hesitantScore}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${analysis.sentimentAnalysis.breakdown.hesitantScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-600 mb-0.5">
                      <span>Enthusiastic</span>
                      <span>{analysis.sentimentAnalysis.breakdown.enthusiasticScore}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${analysis.sentimentAnalysis.breakdown.enthusiasticScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Emotional Moments */}
              {analysis.sentimentAnalysis?.keyEmotionalMoments && (
                <div className="pt-1.5 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                    Key Emotional Inflection Moments:
                  </div>
                  <ul className="list-disc pl-4 text-[11px] text-slate-700 space-y-0.5">
                    {analysis.sentimentAnalysis.keyEmotionalMoments.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Copy / Export Button */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={copyAnalysis}
              className="text-[10px] font-bold text-indigo-700 hover:text-indigo-950 flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied JSON to Clipboard!' : 'Copy Structured JSON Output'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
