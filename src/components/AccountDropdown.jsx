import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  Heart,
  LogOut,
  LayoutDashboard,
  Sprout,
  ShieldCheck,
  ChevronDown,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function AccountDropdown({ isMobile = false, onCloseMobileMenu }) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const isFarmer = user.role === 'farmer';

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setIsOpen(false);
    onCloseMobileMenu?.();
    navigate('/');
  };

  // Avatar initials or first letter
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'FD';

  // Mobile layout version
  if (isMobile) {
    return (
      <div className="pt-2 border-t border-cream-200">
        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-cream-200 shadow-xs mb-3">
          <div className="w-10 h-10 rounded-full bg-forest-900 text-cream-100 flex items-center justify-center font-extrabold text-sm shadow-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm text-charcoal-900 truncate">{user.name}</p>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isFarmer
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-fresh-100 text-forest-900'
                }`}
              >
                {isFarmer ? 'Farmer' : 'Consumer'}
              </span>
            </div>
            <p className="text-xs text-charcoal-500 truncate">
              {isFarmer ? user.farmName || user.email : user.email}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          {isFarmer ? (
            <>
              <Link
                to="/farmer/dashboard"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-charcoal-800 rounded-xl hover:bg-cream-100"
              >
                <LayoutDashboard className="w-4 h-4 text-forest-700" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/farmer/products"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-charcoal-800 rounded-xl hover:bg-cream-100"
              >
                <ShoppingBag className="w-4 h-4 text-forest-700" />
                <span>My Products</span>
              </Link>
              <Link
                to="/farmer/orders"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-charcoal-800 rounded-xl hover:bg-cream-100"
              >
                <Package className="w-4 h-4 text-forest-700" />
                <span>Orders</span>
              </Link>
              <Link
                to="/farmer/profile"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-charcoal-800 rounded-xl hover:bg-cream-100"
              >
                <User className="w-4 h-4 text-forest-700" />
                <span>Profile</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-charcoal-800 rounded-xl hover:bg-cream-100"
              >
                <User className="w-4 h-4 text-forest-700" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/orders"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-charcoal-800 rounded-xl hover:bg-cream-100"
              >
                <Package className="w-4 h-4 text-forest-700" />
                <span>My Orders</span>
              </Link>
              <Link
                to="/favorites"
                onClick={onCloseMobileMenu}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-charcoal-800 rounded-xl hover:bg-cream-100"
              >
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Favorites</span>
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-cream-200 animate-scale-in">
              <div className="flex items-center gap-3 text-rose-600 mb-3">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-extrabold text-charcoal-900 text-base">Confirm Logout</h3>
              </div>
              <p className="text-xs text-charcoal-600 mb-5">
                Are you sure you want to log out of your FarmDirect account?
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-700 hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-cream-100/90 border border-transparent hover:border-cream-300 transition-all focus:outline-none"
        aria-label="User account menu"
      >
        <div className="w-8 h-8 rounded-full bg-forest-900 text-cream-100 flex items-center justify-center font-extrabold text-xs shadow-xs">
          {initials}
        </div>
        <div className="hidden xl:flex flex-col text-left">
          <span className="text-xs font-bold text-charcoal-900 max-w-[120px] truncate leading-tight">
            {user.name}
          </span>
          <span className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">
            {isFarmer ? 'Farmer' : 'Consumer'}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-charcoal-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-cream-200 py-2 z-50 animate-fade-in divide-y divide-cream-100">
          {/* User Info Header */}
          <div className="px-4 py-3 bg-cream-50/60">
            <div className="flex items-center gap-1.5">
              <p className="font-extrabold text-sm text-charcoal-900 truncate">{user.name}</p>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                  isFarmer
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-fresh-100 text-forest-900'
                }`}
              >
                {isFarmer ? 'Farmer' : 'Consumer'}
              </span>
            </div>
            {isFarmer && user.farmName && (
              <p className="text-xs font-semibold text-forest-700 truncate mt-0.5">
                🌾 {user.farmName}
              </p>
            )}
            <p className="text-[11px] text-charcoal-500 truncate mt-0.5">{user.email}</p>
          </div>

          {/* Links Section */}
          <div className="py-1.5">
            {isFarmer ? (
              <>
                <Link
                  to="/farmer/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-charcoal-700 hover:text-forest-950 hover:bg-cream-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-forest-700" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/farmer/products"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-charcoal-700 hover:text-forest-950 hover:bg-cream-50 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-forest-700" />
                  <span>My Products</span>
                </Link>
                <Link
                  to="/farmer/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-charcoal-700 hover:text-forest-950 hover:bg-cream-50 transition-colors"
                >
                  <Package className="w-4 h-4 text-forest-700" />
                  <span>Orders</span>
                </Link>
                <Link
                  to="/farmer/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-charcoal-700 hover:text-forest-950 hover:bg-cream-50 transition-colors"
                >
                  <User className="w-4 h-4 text-forest-700" />
                  <span>Profile</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-charcoal-700 hover:text-forest-950 hover:bg-cream-50 transition-colors"
                >
                  <User className="w-4 h-4 text-forest-700" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-charcoal-700 hover:text-forest-950 hover:bg-cream-50 transition-colors"
                >
                  <Package className="w-4 h-4 text-forest-700" />
                  <span>My Orders</span>
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-charcoal-700 hover:text-forest-950 hover:bg-cream-50 transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Favorites</span>
                </Link>
              </>
            )}
          </div>

          {/* Logout Option */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                setShowLogoutConfirm(true);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-cream-200 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-extrabold text-charcoal-900 text-lg">Confirm Logout</h3>
            </div>
            <p className="text-xs text-charcoal-600 mb-6 leading-relaxed">
              Are you sure you want to log out of your FarmDirect account?
            </p>
            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-700 hover:bg-cream-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-soft transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
