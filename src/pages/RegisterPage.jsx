import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Sprout,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function RegisterPage() {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // If already logged in, redirect to appropriate home
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'farmer') {
        navigate('/farmer/dashboard', { replace: true });
      } else {
        navigate('/marketplace', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Support pre-selection via URL query (?role=farmer or ?role=consumer)
  const roleParam = searchParams.get('role');
  const initialRole = roleParam === 'farmer' || roleParam === 'consumer' ? roleParam : '';

  const [selectedRole, setSelectedRole] = useState(initialRole);

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    farmName: '',
    farmLocation: '',
    farmDescription: '',
    farmAcreage: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Synchronize when query param changes
  useEffect(() => {
    if (roleParam === 'farmer' || roleParam === 'consumer') {
      setSelectedRole(roleParam);
    }
  }, [roleParam]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setSearchParams({ role });
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedRole) {
      newErrors.role = 'Please choose how you will use FarmDirect.';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    }

    // Password validation (min 8 chars, match)
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must contain at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // Farmer specific validations
    if (selectedRole === 'farmer') {
      if (!formData.farmName.trim()) {
        newErrors.farmName = 'Farm Name is required.';
      }
      if (!formData.farmLocation.trim()) {
        newErrors.farmLocation = 'Farm Location is required.';
      }
      if (!formData.farmDescription.trim()) {
        newErrors.farmDescription = 'Please enter a brief farm description.';
      }
      if (formData.farmAcreage !== undefined && formData.farmAcreage !== null && formData.farmAcreage !== '') {
        const parsedAcreage = Number(formData.farmAcreage);
        if (isNaN(parsedAcreage)) {
          newErrors.farmAcreage = 'Total Farm Acreage must be a valid number.';
        } else if (parsedAcreage < 0) {
          newErrors.farmAcreage = 'Total Farm Acreage cannot be negative.';
        }
      }
    }

    // Terms agreement validation
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Please agree to the Terms and Privacy Policy.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const result = await register({
        role: selectedRole,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        location: formData.location,
        farmName: formData.farmName,
        farmLocation: formData.farmLocation,
        farmDescription: formData.farmDescription,
        farmAcreage: formData.farmAcreage
      });

      if (result.success) {
        if (selectedRole === 'farmer') {
          navigate('/farmer/dashboard', { replace: true });
        } else {
          navigate('/marketplace', { replace: true });
        }
      } else {
        setFormError(result.error || 'Failed to create account. Please try again.');
      }
    } catch (err) {
      setFormError('An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5] flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fresh-100 text-forest-900 text-xs font-bold mb-1">
            <Sprout className="w-3.5 h-3.5 text-fresh-600" />
            <span>Join the Transparent Food Revolution</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            Create your FarmDirect account
          </h1>
          <p className="text-sm text-charcoal-600 max-w-md mx-auto">
            Join a transparent farm-to-consumer marketplace.
          </p>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">Registration Error: </span>
              {formError}
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-7" noValidate>
            {/* 9. Role Selection: "How will you use FarmDirect?" */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-charcoal-700 mb-3">
                How will you use FarmDirect? <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Consumer Role Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('consumer')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                    selectedRole === 'consumer'
                      ? 'border-forest-800 bg-forest-50/40 shadow-soft'
                      : 'border-cream-200 bg-white hover:border-cream-300 hover:bg-cream-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      selectedRole === 'consumer' ? 'bg-forest-900 text-cream-50' : 'bg-cream-100 text-forest-800'
                    }`}>
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === 'consumer' ? 'border-forest-800 bg-forest-800' : 'border-cream-300'
                    }`}>
                      {selectedRole === 'consumer' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-charcoal-900">CONSUMER</h3>
                    <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                      Discover and buy fresh products directly from farmers.
                    </p>
                  </div>
                </button>

                {/* Farmer Role Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('farmer')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                    selectedRole === 'farmer'
                      ? 'border-emerald-700 bg-emerald-50/40 shadow-soft'
                      : 'border-cream-200 bg-white hover:border-cream-300 hover:bg-cream-50/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      selectedRole === 'farmer' ? 'bg-emerald-800 text-cream-50' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      <Sprout className="w-5 h-5" />
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedRole === 'farmer' ? 'border-emerald-700 bg-emerald-700' : 'border-cream-300'
                    }`}>
                      {selectedRole === 'farmer' && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-charcoal-900">FARMER</h3>
                    <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                      List your products and sell directly to consumers.
                    </p>
                  </div>
                </button>
              </div>

              {errors.role && (
                <p className="mt-2 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.role}</span>
                </p>
              )}
            </div>

            {/* Common Fields */}
            <div className="space-y-4 pt-2 border-t border-cream-200">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-500">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Arun Kumar"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border text-sm text-charcoal-900 focus:outline-none focus:ring-2 transition-all ${
                        errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-cream-300 focus:ring-forest-100'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. arun@example.com"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border text-sm text-charcoal-900 focus:outline-none focus:ring-2 transition-all ${
                        errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-cream-300 focus:ring-forest-100'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Phone & Optional Location (for consumer) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98402 12345"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border text-sm text-charcoal-900 focus:outline-none focus:ring-2 transition-all ${
                        errors.phone ? 'border-rose-400 focus:ring-rose-200' : 'border-cream-300 focus:ring-forest-100'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.phone}</p>
                  )}
                </div>

                {selectedRole !== 'farmer' && (
                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 mb-1">
                      Delivery Location <span className="text-charcoal-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Fairlands, Salem"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-cream-300 text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-100 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 8 characters"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border text-sm text-charcoal-900 focus:outline-none focus:ring-2 transition-all ${
                        errors.password ? 'border-rose-400 focus:ring-rose-200' : 'border-cream-300 focus:ring-forest-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-400 hover:text-charcoal-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border text-sm text-charcoal-900 focus:outline-none focus:ring-2 transition-all ${
                        errors.confirmPassword ? 'border-rose-400 focus:ring-rose-200' : 'border-cream-300 focus:ring-forest-100'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-charcoal-400 hover:text-charcoal-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 11. Farmer Specific Fields (Dynamic Form) */}
            {selectedRole === 'farmer' && (
              <div className="space-y-4 pt-4 border-t border-emerald-100 bg-emerald-50/30 -mx-6 sm:-mx-10 px-6 sm:px-10 py-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Farm Profile Details</span>
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Verification Required After Sign Up
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 mb-1">
                      Farm Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="farmName"
                      value={formData.farmName}
                      onChange={handleChange}
                      placeholder="e.g. Greenfield Organic Orchard"
                      className={`w-full px-3 py-2.5 rounded-xl bg-white border text-sm text-charcoal-900 focus:outline-none focus:ring-2 transition-all ${
                        errors.farmName ? 'border-rose-400 focus:ring-rose-200' : 'border-emerald-200 focus:ring-emerald-100'
                      }`}
                    />
                    {errors.farmName && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.farmName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal-700 mb-1">
                      Farm Location / Village <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="farmLocation"
                      value={formData.farmLocation}
                      onChange={handleChange}
                      placeholder="e.g. Salem, Tamil Nadu"
                      className={`w-full px-3 py-2.5 rounded-xl bg-white border text-sm text-charcoal-900 focus:outline-none focus:ring-2 transition-all ${
                        errors.farmLocation ? 'border-rose-400 focus:ring-rose-200' : 'border-emerald-200 focus:ring-emerald-100'
                      }`}
                    />
                    {errors.farmLocation && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{errors.farmLocation}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Total Farm Acreage <span className="text-charcoal-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    name="farmAcreage"
                    value={formData.farmAcreage}
                    onChange={handleChange}
                    placeholder="e.g. 2, 5, 7.5 or 10.25"
                    className={`w-full px-3 py-2.5 rounded-xl bg-white border text-sm text-charcoal-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.farmAcreage ? 'border-rose-400 focus:ring-rose-200' : 'border-emerald-200 focus:ring-emerald-100'
                    }`}
                  />
                  {errors.farmAcreage && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.farmAcreage}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 mb-1">
                    Farm Description & Primary Crops <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="farmDescription"
                    rows="3"
                    value={formData.farmDescription}
                    onChange={handleChange}
                    placeholder="Describe your farming methods (organic, natural, traditional) and main harvests..."
                    className={`w-full px-3 py-2.5 rounded-xl bg-white border text-sm text-charcoal-900 focus:outline-none focus:ring-2 transition-all ${
                      errors.farmDescription ? 'border-rose-400 focus:ring-rose-200' : 'border-emerald-200 focus:ring-emerald-100'
                    }`}
                  />
                  {errors.farmDescription && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.farmDescription}</p>
                  )}
                </div>
              </div>
            )}

            {/* 13. Terms & Conditions Checkbox */}
            <div className="pt-2 border-t border-cream-200">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-cream-300 text-forest-900 focus:ring-forest-600"
                />
                <span className="text-xs text-charcoal-700 leading-relaxed">
                  I agree to the{' '}
                  <span className="font-bold underline text-forest-800 hover:text-forest-950">
                    Terms and Privacy Policy
                  </span>
                  .
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.agreeTerms}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-6 rounded-2xl text-cream-50 font-bold text-sm shadow-soft hover:shadow-hover transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${
                selectedRole === 'farmer'
                  ? 'bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900'
                  : 'bg-forest-900 hover:bg-forest-800 active:bg-forest-950'
              }`}
            >
              <span>
                {isLoading
                  ? 'Creating Account...'
                  : selectedRole === 'farmer'
                  ? 'Create Farmer Account'
                  : 'Create Consumer Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Already have an account link */}
          <div className="text-center pt-6 border-t border-cream-200 mt-6">
            <p className="text-xs sm:text-sm text-charcoal-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-forest-800 hover:text-forest-950 underline underline-offset-4 decoration-fresh-500"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
