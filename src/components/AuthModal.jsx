import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, CheckCircle2, ArrowRight, UserCheck, Sprout } from 'lucide-react';
import Button from './Button';

export default function AuthModal({ isOpen, onClose, mode = 'login', initialTab = 'consumer' }) {
  const [role, setRole] = useState(initialTab);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isLogin = mode === 'login';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-elevated border border-cream-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-charcoal-600 hover:text-charcoal-900 rounded-full hover:bg-cream-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto bg-fresh-100 text-fresh-700 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-forest-950">
              {role === 'farmer'
                ? 'Welcome Farmer Ravi! (Ravi Farms)'
                : isLogin
                ? 'Welcome Back!'
                : 'Registration Requested!'}
            </h3>
            <p className="text-sm text-charcoal-700 mt-2 max-w-xs mx-auto">
              {role === 'farmer'
                ? 'You are signed in as Ravi Farms, Salem. Ready to manage listings, orders, and freshness?'
                : 'This is a static UI prototype. Real authentication will connect in upcoming sessions.'}
            </p>

            <div className="mt-6 space-y-2">
              {role === 'farmer' && (
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                    navigate('/farmer/dashboard');
                  }}
                >
                  <Sprout className="w-4 h-4 mr-1.5" />
                  <span>Open Farmer Dashboard</span>
                </Button>
              )}

              <Button
                variant={role === 'farmer' ? 'outline' : 'primary'}
                className="w-full justify-center"
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
              >
                Continue Exploring
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-forest-50 text-forest-800 border border-forest-100 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-fresh-600" />
                <span>Prototype Mode</span>
              </div>
              <h3 className="text-2xl font-bold text-charcoal-900 tracking-tight">
                {isLogin ? 'Sign in to FarmDirect' : 'Create your Account'}
              </h3>
              <p className="text-xs text-charcoal-700 mt-1">
                Direct access to authentic farm harvests and transparent provenance.
              </p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 p-1 bg-cream-100 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => setRole('consumer')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  role === 'consumer'
                    ? 'bg-white text-forest-950 shadow-sm'
                    : 'text-charcoal-700 hover:text-charcoal-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>I am a Consumer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  role === 'farmer'
                    ? 'bg-white text-forest-950 shadow-sm'
                    : 'text-charcoal-700 hover:text-charcoal-900'
                }`}
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>I am a Farmer</span>
              </button>
            </div>

            {/* Mock Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4"
            >
              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder={role === 'farmer' ? 'e.g. Ravi Kumar' : 'e.g. Ananya Sundaram'}
                    className="w-full px-3.5 py-2.5 bg-cream-50 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">Mobile Number (India)</label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 rounded-xl bg-cream-100 border border-cream-300 text-xs font-bold text-charcoal-700">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="98765 43210"
                    pattern="[0-9]{10}"
                    className="flex-1 px-3.5 py-2.5 bg-cream-50 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600"
                  />
                </div>
              </div>

              {role === 'farmer' && !isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">Farm Location (District)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salem, Tamil Nadu"
                    className="w-full px-3.5 py-2.5 bg-cream-50 rounded-xl border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600/30 focus:border-forest-600"
                  />
                </div>
              )}

              <Button variant="primary" size="md" className="w-full mt-2 font-semibold" type="submit">
                <span>{isLogin ? 'Sign In with OTP' : 'Submit & Verify Farm'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <p className="text-[11px] text-center text-charcoal-600 mt-4">
              By proceeding, you agree to FarmDirect’s Transparent Sourcing Protocol and Terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
