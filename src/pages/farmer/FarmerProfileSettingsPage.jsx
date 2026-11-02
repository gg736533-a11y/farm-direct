import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Edit3,
  CheckCircle2,
  ExternalLink,
  Camera,
  Globe,
  Award,
  Sprout
} from 'lucide-react';
import { FARMER_PROFILE } from '../../data/farmerData';
import { useFarmerToast } from '../../components/farmer/FarmerDashboardLayout';
import { useAuth } from '../../auth/AuthContext';
import farmersApi from '../../api/farmers';
import usersApi from '../../api/users';

export default function FarmerProfileSettingsPage() {
  const { showToast } = useFarmerToast();
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    farmName: user?.farmName || user?.farmerProfile?.farmName || '',
    ownerName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    location: user?.location || user?.farmerProfile?.location || '',
    about: user?.description || user?.farmerProfile?.description || '',
    farmAcreage: user?.farmAcreage ?? user?.farmerProfile?.farmAcreage ?? '',
    established: '2024'
  });

  const [verificationStatus, setVerificationStatus] = useState(
    user?.verificationStatus || user?.farmerProfile?.verificationStatus || 'PENDING'
  );
  const [verified, setVerified] = useState(
    user?.verified === true && user?.verificationStatus === 'VERIFIED'
  );
  const [farmerId, setFarmerId] = useState(
    user?.farmerProfile?.id || (user?.email === 'ravi@farmdirect.example' ? 'ravi-farms' : user?.id || '')
  );

  // Sync state from authenticated user context
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        farmName: user.farmName || user.farmerProfile?.farmName || prev.farmName,
        ownerName: user.name || prev.ownerName,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        location: user.location || user.farmerProfile?.location || prev.location,
        about: user.description || user.farmerProfile?.description || prev.about,
        farmAcreage: user.farmAcreage !== null && user.farmAcreage !== undefined
          ? user.farmAcreage
          : (user.farmerProfile?.farmAcreage !== null && user.farmerProfile?.farmAcreage !== undefined
            ? user.farmerProfile.farmAcreage
            : prev.farmAcreage)
      }));
      setVerificationStatus(user.verificationStatus || user.farmerProfile?.verificationStatus || 'PENDING');
      setVerified(user.verified === true && user.verificationStatus === 'VERIFIED');
      if (user.farmerProfile?.id) {
        setFarmerId(user.farmerProfile.id);
      }
    }
  }, [user]);

  // Load fresh farmer profile from GET /api/farmers/me on mount
  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const res = await farmersApi.getMyFarmerProfile();
        if (res?.data?.farmer && isMounted) {
          const f = res.data.farmer;
          setFormData((prev) => ({
            ...prev,
            farmName: f.farmName || prev.farmName,
            ownerName: f.ownerName || f.user?.name || prev.ownerName,
            phone: f.phone || f.user?.phone || prev.phone,
            email: f.email || f.user?.email || prev.email,
            location: f.location || prev.location,
            about: f.description || prev.about,
            farmAcreage: f.farmAcreage !== null && f.farmAcreage !== undefined ? f.farmAcreage : prev.farmAcreage
          }));
          setVerificationStatus(f.verificationStatus || 'PENDING');
          setVerified(f.verified === true && f.verificationStatus === 'VERIFIED');
          if (f.id) setFarmerId(f.id);
        }
      } catch (err) {
        console.warn('Could not fetch /api/farmers/me:', err);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (formData.farmAcreage !== '' && formData.farmAcreage !== null && formData.farmAcreage !== undefined) {
        const num = Number(formData.farmAcreage);
        if (isNaN(num) || num < 0) {
          throw new Error('Total Farm Acreage must be a non-negative number.');
        }
      }
      await usersApi.updateProfile({
        name: formData.ownerName,
        phone: formData.phone,
        location: formData.location,
        farmName: formData.farmName,
        description: formData.about,
        farmAcreage: formData.farmAcreage !== '' && formData.farmAcreage !== null && formData.farmAcreage !== undefined
          ? Number(formData.farmAcreage)
          : null
      });
      await refreshUser?.();
      setIsEditing(false);
      showToast({
        type: 'success',
        title: 'Profile Saved',
        message: 'Farm profile details updated successfully.'
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Unable to update farm profile.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* 19. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Farm Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your public farm identity and transparent credentials.
          </p>
        </div>

        <Link
          to={farmerId ? `/farmer/${farmerId}` : `/farmer/${FARMER_PROFILE.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
        >
          <span>View Public Profile</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Hero Farm Banner & Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        {/* Cover Photo */}
        <div className="relative h-44 sm:h-56 bg-forest-950 overflow-hidden">
          <img
            src={FARMER_PROFILE.coverImage}
            alt={formData.farmName}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        </div>

        {/* Profile Details Header */}
        <div className="px-6 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-4">
            <div className="relative inline-block">
              <img
                src={FARMER_PROFILE.avatar}
                alt={formData.ownerName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-elevated bg-white"
              />
              <button
                type="button"
                onClick={() => showToast({ type: 'info', title: 'Avatar', message: 'Photo upload UI prototype.' })}
                className="absolute bottom-1 right-1 p-2 rounded-xl bg-forest-900 text-white hover:bg-forest-800 shadow-md transition-colors"
                aria-label="Update avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                {formData.farmName || 'My Farm'}
              </h2>
              {verified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>✓ Verified Farmer</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Verification Pending</span>
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{formData.location}</span>
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Sprout className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {formData.farmAcreage !== '' && formData.farmAcreage !== null && formData.farmAcreage !== undefined
                    ? `${formData.farmAcreage} Acres`
                    : 'Not provided'}
                </span>
              </span>
              <span>•</span>
              <span className="font-medium">
                Est. {formData.established}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-3 max-w-2xl leading-relaxed italic">
              "{formData.about}"
            </p>
          </div>
        </div>
      </div>

      {/* Editable Information Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-soft space-y-6">
        <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Farm Details & Contact Information
          </h3>
          <span className="text-xs text-slate-400">
            {isEditing ? 'Editing Mode' : 'Read Only (Click Edit above)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Farm Name
            </label>
            <input
              type="text"
              name="farmName"
              disabled={!isEditing}
              value={formData.farmName}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                isEditing
                  ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30'
                  : 'bg-slate-100/70 border-slate-200 text-slate-600 cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Owner Name
            </label>
            <input
              type="text"
              name="ownerName"
              disabled={!isEditing}
              value={formData.ownerName}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                isEditing
                  ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30'
                  : 'bg-slate-100/70 border-slate-200 text-slate-600 cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              disabled={!isEditing}
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                isEditing
                  ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30'
                  : 'bg-slate-100/70 border-slate-200 text-slate-600 cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              disabled={!isEditing}
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                isEditing
                  ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30'
                  : 'bg-slate-100/70 border-slate-200 text-slate-600 cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Farm Location (District, State)
            </label>
            <input
              type="text"
              name="location"
              disabled={!isEditing}
              value={formData.location}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                isEditing
                  ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30'
                  : 'bg-slate-100/70 border-slate-200 text-slate-600 cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Total Farm Acreage (Acres)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              name="farmAcreage"
              disabled={!isEditing}
              value={formData.farmAcreage ?? ''}
              onChange={handleChange}
              placeholder="e.g. 2, 5, 7.5 or 10.25"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all ${
                isEditing
                  ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30'
                  : 'bg-slate-100/70 border-slate-200 text-slate-600 cursor-not-allowed'
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Farm Description & Practices
          </label>
          <textarea
            rows={4}
            name="about"
            disabled={!isEditing}
            value={formData.about}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all resize-none ${
              isEditing
                ? 'bg-slate-50 border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30'
                : 'bg-slate-100/70 border-slate-200 text-slate-600 cursor-not-allowed'
            }`}
          />
        </div>

        {/* Farming Practices Badges */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Verified Practices & Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {FARMER_PROFILE.farmingPractices.map((practice) => (
              <span
                key={practice}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{practice}</span>
              </span>
            ))}
          </div>
        </div>

        {isEditing && (
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold shadow-xs"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
