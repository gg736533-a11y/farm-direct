import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  UserCheck,
  ShieldCheck,
  HelpCircle,
  LogOut,
  X,
  Store,
  ExternalLink,
  Bot
} from 'lucide-react';
import { FARMER_PROFILE } from '../../data/farmerData';
import { useAuth } from '../../auth/AuthContext';

export default function FarmerSidebar({ isOpen, onClose, onLogoutClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const farmName = user?.farmName || FARMER_PROFILE.farmName;
  const locationText = user?.location || FARMER_PROFILE.location;
  const isVerified = user
    ? user.verified === true && user.verificationStatus === 'VERIFIED'
    : FARMER_PROFILE.verified;

  const mainLinks = [
    { name: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/farmer/products', icon: Package },
    { name: 'Orders', path: '/farmer/orders', icon: ShoppingCart },
    { name: 'AI Assistant', path: '/farmer/ai-assistant', icon: Bot }
  ];


  const accountLinks = [
    { name: 'Profile', path: '/farmer/profile', icon: UserCheck },
    { name: 'Verification', path: '/farmer/verification', icon: ShieldCheck }
  ];

  const isActive = (path) => {
    if (path === '/farmer/dashboard') {
      return location.pathname === '/farmer/dashboard' || location.pathname === '/farmer';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-elevated' : '-translate-x-full'
        }`}
      >
        {/* Top Logo */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
          <Link
            to="/farmer/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-cream-50 shadow-sm group-hover:bg-forest-800 transition-colors">
              <svg className="w-6 h-6 text-fresh-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                <path d="m14 13 4 4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-forest-950 flex items-center">
                Farm<span className="text-fresh-600">Direct</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60 w-fit">
                Farmer SaaS
              </span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          {/* Main */}
          <div>
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Main
            </span>
            <nav className="mt-2 space-y-1">
              {mainLinks.map((item) => {
                const active = isActive(item.path);
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${active ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Account */}
          <div>
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Account
            </span>
            <nav className="mt-2 space-y-1">
              {accountLinks.map((item) => {
                const active = isActive(item.path);
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${active ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Support */}
          <div>
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Support
            </span>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onLogoutClick?.({
                    type: 'info',
                    title: 'FarmDirect Farmer Helpdesk',
                    message: 'Reach our dedicated rural support team at support@farmdirect.in or call toll-free 1800-FARM-DIRECT.'
                  });
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Help & Support</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Farmer Mini-Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-soft">
            <div className="flex items-center gap-2.5">
              <img
                src={FARMER_PROFILE.avatar}
                alt={farmName}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {farmName}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {locationText}
                </p>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-0.5 ${
                  isVerified ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isVerified ? 'bg-emerald-600' : 'bg-amber-600'
                  }`} />
                  {isVerified ? '✓ Verified Farmer' : 'Verification Pending'}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => {
                onClose?.();
                logout();
                navigate('/');
              }}
              className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1.5 transition-colors border border-transparent hover:border-rose-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
