import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  AlertTriangle,
  Clock,
  Package,
  FileQuestion,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import agentApi from '../../api/agent';
import { useAuth } from '../../auth/AuthContext';

const QUICK_PROMPTS = [
  'Which of my products need attention?',
  'Audit low stock inventory',
  'Check expiry alerts',
  'Find products missing transparency data'
];

export default function FarmerAIAssistantPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState('Which of my products need attention?');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agentResponse, setAgentResponse] = useState(null);

  const runAgent = async (queryText) => {
    const q = (queryText !== undefined ? queryText : message).trim();
    setLoading(true);
    setError('');

    try {
      const res = await agentApi.farmerInsights({ message: q });
      if (res?.success) {
        setAgentResponse(res);
      } else {
        setError(res?.message || 'Farmer Agent service is temporarily unavailable.');
      }
    } catch (err) {
      console.error('Farmer Agent execution failed:', err);
      setError(
        err.response?.data?.message || 'Farmer Agent service is temporarily unavailable.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on initial load with the primary question
  useEffect(() => {
    runAgent('Which of my products need attention?');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    runAgent(message);
  };

  const handleQuickPrompt = (prompt) => {
    setMessage(prompt);
    runAgent(prompt);
  };

  const results = agentResponse?.results;
  const hasFindings =
    results &&
    (results.lowStock?.length > 0 ||
      results.outOfStock?.length > 0 ||
      results.expiryAlerts?.length > 0 ||
      results.missingTransparency?.length > 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-200">
            <Bot className="w-4 h-4 text-emerald-700" />
            <span>FarmDirect Farmer Assistant</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Read-Only Autonomous Audit • PostgreSQL Verified
          </span>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            AI Inventory & Quality Assistant
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Ask questions about your catalog. The agent retrieves your active database products, audits stock levels, inspects expiry dates, and checks transparency compliance.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="pt-2">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask the assistant (e.g. Which of my products need attention?)..."
                disabled={loading}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white text-sm font-bold transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Run Audit</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-1">
            <span className="text-xs font-semibold text-slate-400 mr-1">Quick Audits:</span>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleQuickPrompt(prompt)}
                disabled={loading}
                className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200/60 transition-all hover:scale-102 active:scale-98"
              >
                {prompt}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => runAgent(message)}
            className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-300 text-xs font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-16 text-center space-y-4 max-w-md mx-auto p-6 rounded-3xl bg-white border border-slate-200 shadow-soft">
          <div className="relative w-12 h-12 mx-auto">
            <RefreshCw className="w-12 h-12 text-forest-700 animate-spin" />
            <Bot className="w-6 h-6 text-emerald-600 absolute inset-0 m-auto" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-extrabold text-slate-900">
              Agent is analyzing your catalog...
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Checking stock thresholds (≤ 5 units), calculating days to expiry, and auditing transparency
            </p>
          </div>
        </div>
      )}

      {/* Agent Response Content */}
      {!loading && agentResponse && (
        <div className="space-y-6">
          {/* Agent Activity & Plan Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Stream */}
            <div className="lg:col-span-1 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Bot className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Agent Execution Log
                </h3>
              </div>
              <div className="space-y-2 pt-1">
                {(agentResponse.activity || []).map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{act.replace(/^✓\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Findings Overview Banner */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-emerald-50/80 border border-emerald-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-950">
                    Agent Findings Overview
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-emerald-950 leading-relaxed">
                  {agentResponse.summary}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-bold pt-2 border-t border-emerald-200/60">
                <span className="px-3 py-1 rounded-xl bg-white text-slate-800 border border-slate-200 shadow-2xs">
                  Total Catalog: {results?.totalProducts || 0}
                </span>
                <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs">
                  Low Stock: {results?.lowStock?.length || 0}
                </span>
                <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-900 border border-rose-200 shadow-2xs">
                  Out of Stock: {results?.outOfStock?.length || 0}
                </span>
                <span className="px-3 py-1 rounded-xl bg-orange-100 text-orange-900 border border-orange-200 shadow-2xs">
                  Expiry Alerts: {results?.expiryAlerts?.length || 0}
                </span>
                <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-900 border border-blue-200 shadow-2xs">
                  Missing Data: {results?.missingTransparency?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Categorized Findings */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Products Needing Attention
            </h2>

            {!hasFindings ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">Catalog in Excellent Health</h3>
                <p className="text-xs text-slate-500">
                  No stock shortages, impending expiries, or missing transparency records detected.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Low Stock Alerts */}
                {results?.lowStock?.map((item) => (
                  <div
                    key={`low-${item.productId}`}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-amber-200 shadow-xs hover:shadow-soft transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h4 className="text-sm font-extrabold text-slate-900">{item.name}</h4>
                      </div>
                      <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        Low Stock
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-800">Remaining Stock:</span> {item.availableQuantity}</p>
                      <p><span className="font-semibold text-slate-800">Observation:</span> {item.reason}</p>
                    </div>
                    <div className="pt-1 flex justify-end">
                      <Link
                        to={`/farmer/products/${item.productId}/edit`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-900"
                      >
                        <span>Update Stock</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}

                {/* 2. Out of Stock Alerts */}
                {results?.outOfStock?.map((item) => (
                  <div
                    key={`oos-${item.productId}`}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-200 shadow-xs hover:shadow-soft transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-rose-600" />
                        <h4 className="text-sm font-extrabold text-slate-900">{item.name}</h4>
                      </div>
                      <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                        Out of Stock
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-800">Remaining Stock:</span> 0 units</p>
                      <p><span className="font-semibold text-slate-800">Observation:</span> {item.reason}</p>
                    </div>
                    <div className="pt-1 flex justify-end">
                      <Link
                        to={`/farmer/products/${item.productId}/edit`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-800"
                      >
                        <span>Restock Product</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}

                {/* 3. Expiry Alerts */}
                {results?.expiryAlerts?.map((item) => (
                  <div
                    key={`exp-${item.productId}`}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-orange-200 shadow-xs hover:shadow-soft transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <h4 className="text-sm font-extrabold text-slate-900">{item.name}</h4>
                      </div>
                      <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        item.status === 'EXPIRED'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-orange-50 text-orange-800 border-orange-200'
                      }`}>
                        {item.status === 'EXPIRED' ? 'Expired' : 'Expiry Alert'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-800">Expiry Date:</span> {item.expiryDate}</p>
                      <p><span className="font-semibold text-slate-800">Observation:</span> {item.reason}</p>
                    </div>
                    <div className="pt-1 flex justify-end">
                      <Link
                        to={`/farmer/products/${item.productId}/edit`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-orange-800 hover:text-orange-900"
                      >
                        <span>Review Batch Date</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}

                {/* 4. Missing Transparency Alerts */}
                {results?.missingTransparency?.map((item) => (
                  <div
                    key={`trans-${item.productId}`}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-blue-200 shadow-xs hover:shadow-soft transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileQuestion className="w-4 h-4 text-blue-600" />
                        <h4 className="text-sm font-extrabold text-slate-900">{item.name}</h4>
                      </div>
                      <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        Transparency Audit
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p><span className="font-semibold text-slate-800">Missing Information:</span> {item.missingFields.join(', ')}</p>
                      <p><span className="font-semibold text-slate-800">Observation:</span> {item.reason}</p>
                    </div>
                    <div className="pt-1 flex justify-end">
                      <Link
                        to={`/farmer/products/${item.productId}/edit`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-800 hover:text-blue-900"
                      >
                        <span>Add Transparency Data</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safety Notice Card */}
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Safe Read-Only Agentic AI Controls</span>
            </div>
            <p>
              This agent inspects and audits real PostgreSQL product records. It does NOT automatically edit prices, decrease stock, delete products, or manipulate orders. All adjustments must be confirmed directly by you.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
