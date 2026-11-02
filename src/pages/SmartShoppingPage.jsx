import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Tag,
  MapPin,
  X,
  Bot,
  Calculator,
  ShoppingCart,
  Calendar
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import agentApi from '../api/agent';
import aiApi from '../api/ai';
import { useShop } from '../context/ShopContext';

const SUGGESTIONS = [
  '₹500 kulla fresh vegetables venum',
  'Fresh vegetables under ₹300',
  'Fruits from verified farmers',
  'Eggs under ₹100',
  'Products near Salem'
];

export default function SmartShoppingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const { addToCart } = useShop();

  const [query, setQuery] = useState(initialQuery);
  const [lastExecutedQuery, setLastExecutedQuery] = useState('');
  const [agentSummary, setAgentSummary] = useState('');
  const [agentActivity, setAgentActivity] = useState([]);
  const [agentPlan, setAgentPlan] = useState(null);
  const [agentCalculation, setAgentCalculation] = useState(null);
  const [interpretedFilters, setInterpretedFilters] = useState(null);
  const [products, setProducts] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comboAdded, setComboAdded] = useState(false);

  const executeSearch = async (searchQuery) => {
    const q = searchQuery.trim();
    if (!q) return;

    setLoading(true);
    setError('');
    setComboAdded(false);
    setLastExecutedQuery(q);

    // Update URL query parameter
    setSearchParams({ q });

    try {
      // 1. Invoke Session 9 Agentic AI endpoint
      const res = await agentApi.smartShopping({ message: q });

      if (res?.success) {
        setAgentSummary(res.summary || '');
        setAgentActivity(res.activity || []);
        setAgentPlan(res.plan || null);
        setAgentCalculation(res.calculation || null);

        // Normalize returned products for ProductCard component
        const rawProducts = res.results || [];
        const normalized = rawProducts.map((p) => ({
          ...p,
          id: p.productId || p.id,
          image: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
          imageUrl: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
          farmerName: p.farmerName || p.farmer?.farmName || 'Verified Farm',
          harvestFreshness: p.harvestDate && p.harvestDate !== 'Not provided' ? `Harvested ${p.harvestDate}` : 'Standard Batch'
        }));

        setProducts(normalized);
        setHasSearched(true);
      } else {
        // Fallback to Session 8 endpoint if agent service had temporary interruption
        try {
          const fallbackRes = await aiApi.smartShopping(q);
          if (fallbackRes?.success) {
            setInterpretedFilters(fallbackRes.interpretedFilters || null);
            const normalized = (fallbackRes.products || []).map((p) => ({
              ...p,
              image: p.image || p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
              harvestFreshness: p.harvestDate ? 'Fresh Batch' : 'Standard'
            }));
            setProducts(normalized);
            setHasSearched(true);
          } else {
            setError(res?.message || 'AI Agent service is temporarily unavailable.');
          }
        } catch {
          setError(res?.message || 'AI Agent service is temporarily unavailable.');
        }
      }
    } catch (err) {
      console.error('Smart Shopping search failed:', err);
      setError('AI Agent service is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  // Run automatically if ?q= was in URL on load
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      executeSearch(initialQuery);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    executeSearch(suggestion);
  };

  const handleClear = () => {
    setQuery('');
  };

  const handleAddComboToCart = () => {
    if (!agentCalculation?.itemTotals || !products) return;

    for (const item of agentCalculation.itemTotals) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        addToCart(prod, item.quantity);
      }
    }
    setComboAdded(true);
    setTimeout(() => setComboAdded(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-fresh-100 text-forest-900 border border-fresh-200 shadow-2xs">
          <Bot className="w-3.5 h-3.5 text-fresh-700" />
          <span>FarmDirect AI Agent</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-forest-950 tracking-tight">
          Smart Shopping Assistant
        </h1>

        <p className="text-sm sm:text-base text-charcoal-600 font-medium">
          State your shopping goal in natural language. Our autonomous agent plans, verifies stock, checks harvest transparency, and calculates affordable combinations.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center shadow-soft rounded-2xl bg-white border-2 border-forest-900/20 focus-within:border-forest-800 transition-all p-1.5 sm:p-2"
        >
          <Search className="w-5 h-5 text-forest-700 ml-3 shrink-0" />
          <input
            type="text"
            id="smart-shopping-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tell the agent what you need (e.g. ₹500 kulla fresh vegetables venum)..."
            className="w-full px-3 py-2 text-sm sm:text-base text-charcoal-900 bg-transparent focus:outline-none placeholder:text-charcoal-400"
            disabled={loading}
          />

          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-charcoal-400 hover:text-charcoal-600 rounded-lg transition-colors mr-1"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            id="smart-shopping-submit-btn"
            disabled={loading || !query.trim()}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs sm:text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-fresh-400" />
                <span>Agent Working...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-fresh-400" />
                <span>Ask Agent</span>
              </>
            )}
          </button>
        </form>

        {/* Suggestion Chips */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold text-charcoal-500 mr-1">Suggestions:</span>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-fresh-50 text-forest-900 border border-cream-200 hover:border-fresh-400 transition-all shadow-2xs hover:shadow-xs active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner with Retry */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-3 text-sm text-rose-800 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => executeSearch(query)}
            className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-800 rounded-xl border border-rose-300 text-xs font-bold transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="py-16 text-center space-y-4 max-w-md mx-auto p-6 rounded-3xl bg-white border border-cream-200 shadow-soft">
          <div className="relative w-12 h-12 mx-auto">
            <RefreshCw className="w-12 h-12 text-forest-700 animate-spin" />
            <Bot className="w-6 h-6 text-fresh-600 absolute inset-0 m-auto" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-extrabold text-forest-950">
              Agent is executing plan...
            </p>
            <p className="text-xs text-charcoal-500 font-medium">
              Formulating steps → executing approved read-only tools → querying PostgreSQL database
            </p>
          </div>
        </div>
      )}

      {/* Agent Activity & Explanation Section */}
      {!loading && hasSearched && (
        <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
          {/* Agent Activity Card */}
          {agentActivity.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-soft">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-cream-100">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-700" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-forest-950">
                    Agent Execution Activity
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  5 Steps Max • Read-Only
                </span>
              </div>

              <div className="pt-3 space-y-2">
                {agentActivity.map((act, index) => (
                  <div key={index} className="flex items-start gap-2.5 text-xs text-charcoal-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{act.replace(/^✓\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Summary & Finding Box */}
          {agentSummary && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-950">
                  Agent Recommendation & Findings
                </h4>
              </div>
              <p className="text-sm text-emerald-950 leading-relaxed font-medium">
                {agentSummary}
              </p>
            </div>
          )}

          {/* Recommended Cart Combination Card */}
          {agentCalculation && agentCalculation.itemTotals && agentCalculation.itemTotals.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border-2 border-fresh-300 shadow-soft space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-cream-100">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-fresh-700" />
                  <h3 className="text-sm font-extrabold text-forest-950">
                    Recommended Basket Combination
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Calculated from Live DB
                </span>
              </div>

              <div className="divide-y divide-cream-100 text-xs">
                {agentCalculation.itemTotals.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-forest-950 text-sm">{item.name}</span>
                      <span className="text-charcoal-500 ml-2">
                        {item.quantity} {item.unit} @ ₹{item.unitPrice}/{item.unit}
                      </span>
                    </div>
                    <span className="font-black text-forest-900 text-sm">₹{item.itemTotal}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-cream-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-charcoal-600 font-medium">
                  <span>Subtotal</span>
                  <span>₹{agentCalculation.subtotal}</span>
                </div>
                <div className="flex justify-between text-charcoal-600 font-medium">
                  <span>Standard Delivery</span>
                  <span>₹{agentCalculation.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-forest-950 pt-1 border-t border-cream-100">
                  <span>Grand Total</span>
                  <span className="text-base text-emerald-700">₹{agentCalculation.grandTotal}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleAddComboToCart}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold transition-all shadow-xs"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-fresh-400" />
                  <span>{comboAdded ? 'Added to Cart!' : 'Add Recommended Combination to Cart'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {!loading && hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 tracking-tight">
              Matching Products ({products.length})
            </h2>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-1 text-xs font-bold text-forest-800 hover:text-fresh-600 transition-colors"
            >
              <span>Explore Full Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center max-w-md mx-auto p-8 rounded-3xl bg-white border border-cream-200 shadow-soft space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cream-100 text-charcoal-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-charcoal-900">
                No matching products found.
              </h3>
              <p className="text-xs text-charcoal-600">
                Try searching for a different category or adjusting your price limit.
              </p>
              <div className="pt-2">
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold transition-colors"
                >
                  <span>Browse All Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
