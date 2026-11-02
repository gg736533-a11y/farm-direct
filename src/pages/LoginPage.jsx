import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sprout,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Leaf
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import Button from '../components/Button';

export default function LoginPage() {
  const { login, loginAsDemo, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect immediately
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const destination = location.state?.from?.pathname || (user.role === 'farmer' ? '/farmer/dashboard' : '/marketplace');
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirection destination after login
  const returnTo = location.state?.from?.pathname;

  const handleRedirect = (loggedInUser) => {
    if (returnTo) {
      navigate(returnTo, { replace: true });
    } else if (loggedInUser.role === 'farmer') {
      navigate('/farmer/dashboard', { replace: true });
    } else {
      navigate('/marketplace', { replace: true });
    }
  };

  const handleDemoLogin = async (role) => {
    setIsLoading(true);
    setFormError('');
    try {
      const result = await loginAsDemo(role);
      if (result.success) {
        handleRedirect(result.user);
      } else {
        setFormError(result.error || 'Demo login failed.');
      }
    } catch {
      setFormError('Demo login could not connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      if (result.success) {
        handleRedirect(result.user);
      } else {
        setFormError(result.error || 'Invalid email or password.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex bg-[#FAF8F5]">
      {/* Desktop Left: Agricultural & FarmDirect Branding (Split Screen) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-forest-950 text-white flex-col justify-between p-12 overflow-hidden">
        {/* Background ambient lighting and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900 via-forest-950 to-charcoal-950 opacity-95" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-fresh-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Top Logo and Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-fresh-600 flex items-center justify-center text-white shadow-soft">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-white flex items-center">
                Farm<span className="text-fresh-400">Direct</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 block -mt-1">
                Direct Farm-to-Fork Transparency
              </span>
            </div>
          </Link>
        </div>

        {/* Hero Narrative & Agricultural Imagery Card */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-emerald-200 text-xs font-bold">
            <Leaf className="w-4 h-4 text-fresh-400" />
            <span>Fair Prices • 100% Traceable Harvest</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white font-serif">
            Connecting Conscious Consumers with Passionate Local Farmers.
          </h2>

          <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
            Experience food transparency with verified harvests, direct farm-to-table delivery, and guaranteed fair remuneration for local growers.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-black text-fresh-400">100%</p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Direct farm traceability</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-black text-fresh-400">0%</p>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Middleman margin</p>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400 border-t border-white/10 pt-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Session 4 Mock Authentication System • Safe Development Environment</span>
        </div>
      </div>

      {/* Right: Login Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          {/* Header */}
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-charcoal-600 mt-2">
              Sign in to continue to FarmDirect.
            </p>
          </div>

          {/* Form Error Banner */}
          {formError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Login Failed: </span>
                {formError}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="email-input"
                className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="e.g. arun@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-white border text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-cream-300 focus:border-forest-700 focus:ring-forest-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password-input"
                  className="block text-xs font-bold uppercase tracking-wider text-charcoal-700"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset is simulated for the prototype. Please use demo access or create a new account.')}
                  className="text-xs font-semibold text-forest-700 hover:text-forest-900 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 rounded-2xl bg-white border text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-cream-300 focus:border-forest-700 focus:ring-forest-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-charcoal-400 hover:text-charcoal-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-cream-300 text-forest-900 focus:ring-forest-600"
                />
                <span className="text-xs font-semibold text-charcoal-700">Remember me</span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-2xl bg-forest-900 hover:bg-forest-800 active:bg-forest-950 text-cream-50 font-bold text-sm shadow-soft hover:shadow-hover transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Create Account Link */}
          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-charcoal-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-forest-800 hover:text-forest-950 underline underline-offset-4 decoration-fresh-500"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Demo Access Quick Login (Section 6) */}
          <div className="pt-6 border-t border-cream-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-charcoal-500 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-forest-700" />
                <span>Demo Access</span>
              </span>
              <span className="text-[10px] text-charcoal-500 bg-cream-200/60 px-2 py-0.5 rounded-full font-semibold">
                One-Click Local Mock
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Consumer Demo Button */}
              <button
                type="button"
                onClick={() => handleDemoLogin('consumer')}
                className="p-3 rounded-2xl border border-cream-300 bg-white hover:bg-cream-50/80 hover:border-fresh-400 text-left transition-all shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-900 group-hover:text-forest-900">
                    Continue as Consumer
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-fresh-100 text-forest-900">
                    Buyer
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-500 mt-1">Arun Kumar</p>
                <p className="text-[10px] text-charcoal-400">arun@example.com</p>
              </button>

              {/* Farmer Demo Button */}
              <button
                type="button"
                onClick={() => handleDemoLogin('farmer')}
                className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 hover:border-emerald-400 text-left transition-all shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-charcoal-900 group-hover:text-emerald-900">
                    Continue as Farmer
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                    Seller
                  </span>
                </div>
                <p className="text-[11px] text-charcoal-700 font-medium mt-1">Ravi (Ravi Farms)</p>
                <p className="text-[10px] text-charcoal-500">ravi@farmdirect.example</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
