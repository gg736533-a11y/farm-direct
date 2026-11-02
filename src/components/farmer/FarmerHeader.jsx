import React from 'react';
import { Menu, Store, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationDropdown from './NotificationDropdown';
import { FARMER_PROFILE } from '../../data/farmerData';
import { useAuth } from '../../auth/AuthContext';

export default function FarmerHeader({ onMobileMenuToggle, onShowToast }) {
  const { user } = useAuth();

  const ownerName = user?.name || FARMER_PROFILE.ownerName;
  const farmName = user?.farmName || FARMER_PROFILE.farmName;
  const location = user?.location || FARMER_PROFILE.location;
  const isVerified = user
    ? user.verified === true && user.verificationStatus === 'VERIFIED'
    : FARMER_PROFILE.verified;

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Left side: Mobile Hamburger + Breadcrumb/Status */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/70">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Store Online</span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">•</span>
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            {farmName} ({location})
          </span>
        </div>
      </div>

      {/* Right side: Actions, Notifications, View Store, Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* "View Store" Button */}
        <Link
          to={user?.farmerProfile?.id ? `/farmer/${user.farmerProfile.id}` : `/farmer/${FARMER_PROFILE.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-colors"
        >
          <Store className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden xs:inline">View Store</span>
          <ExternalLink className="w-3 h-3 text-emerald-600 opacity-70" />
        </Link>

        {/* Notifications Bell with Dropdown */}
        <NotificationDropdown onSelectToast={onShowToast} />

        {/* Farmer Profile Avatar */}
        <Link
          to="/farmer/profile"
          className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <img
            src={FARMER_PROFILE.avatar}
            alt={ownerName}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-slate-200"
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 leading-tight">
              {ownerName}
            </span>
            <span className={`text-[10px] font-bold ${isVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
              {isVerified ? '✓ Verified Farmer' : 'Verification Pending'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
