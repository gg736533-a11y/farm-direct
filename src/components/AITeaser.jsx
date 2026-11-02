import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Bot, ArrowRight, Search } from 'lucide-react';

export default function AITeaser() {
  const [prompt, setPrompt] = useState('Fresh vegetables under ₹300');
  const navigate = useNavigate();

  const handleTry = (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate(`/smart-shopping?q=${encodeURIComponent(prompt.trim())}`);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-slate-950 p-6 sm:p-8 text-cream-50 shadow-elevated border border-forest-800/60">
      {/* Background ambient glow */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-fresh-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-forest-400/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-fresh-500/20 text-fresh-300 border border-fresh-400/30">
              <Sparkles className="w-3 h-3" />
              <span>AI ASSISTANT</span>
            </span>
            <span className="text-xs text-fresh-200/70 font-semibold">
              Need Help Finding Something?
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            FarmDirect Smart Shopping
          </h3>

          <p className="text-xs sm:text-sm text-cream-200/80 leading-relaxed">
            Tell us what you're looking for and our natural language agent will help you discover matching verified local harvests.
          </p>
        </div>

        {/* Interactive search prompt */}
        <form onSubmit={handleTry} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 w-full lg:max-w-md space-y-3">
          <div className="flex items-center gap-2 text-xs text-fresh-200">
            <Bot className="w-4 h-4 text-fresh-400" />
            <span className="font-semibold">Try sample natural language prompt:</span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Fresh vegetables under ₹300"
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/90 text-charcoal-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-fresh-400"
            />
            <Search className="w-4 h-4 text-charcoal-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-fresh-600 hover:bg-fresh-500 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <span>Try Smart Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
