import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Globe,
  ChevronDown,
  Leaf,
  ShieldCheck,
  Sprout,
  Search,
  Heart,
  ShoppingBag,
  User,
  Package,
  LayoutDashboard,
  Bell,
  Sparkles
} from 'lucide-react';
import Button from './Button';
import AccountDropdown from './AccountDropdown';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('EN');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const location = useLocation();
  const { cartCount, favorites } = useShop();
  const { user, isAuthenticated } = useAuth();

  const isConsumer = isAuthenticated && user?.role === 'consumer';
  const isFarmer = isAuthenticated && user?.role === 'farmer';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Smart Shopping', path: '/smart-shopping', isAi: true },
    { name: 'Farm Tools', path: '/farm-tools' },
    { name: 'Agri Advisor', path: '/agriculture-advisor', isAi: true },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Traceability', path: '/how-it-works#traceability' },
  ];

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'TA', name: 'தமிழ் (Tamil)' },
    { code: 'HI', name: 'हिन्दी (Hindi)' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-cream-200/80 transition-all print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-forest-900 flex items-center justify-center text-cream-50 shadow-sm group-hover:bg-forest-800 transition-colors">
              <svg className="w-6 h-6 text-fresh-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                <path d="m14 13 4 4" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-forest-950 flex items-center">
                Farm<span className="text-fresh-600">Direct</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-forest-700/80 -mt-1 hidden sm:block">
                Farmer to Consumer
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                    isActive
                      ? 'text-forest-950 bg-forest-100/60 font-bold'
                      : 'text-charcoal-700 hover:text-forest-900 hover:bg-cream-100/80'
                  }`}
                >
                  {link.isAi && <Sparkles className="w-3.5 h-3.5 text-fresh-600" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Controls */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            {/* Search Shortcut - Always available */}
            <Link
              to="/marketplace"
              className="p-2 rounded-xl text-charcoal-700 hover:text-forest-900 hover:bg-cream-100 transition-colors"
              title="Search marketplace"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* CASE 1: CONSUMER LOGGED IN */}
            {isConsumer && (
              <>
                {/* Favorites Link */}
                <Link
                  to="/favorites"
                  className="relative p-2 rounded-xl text-charcoal-700 hover:text-rose-600 hover:bg-rose-50/60 transition-colors"
                  title="View Favorites"
                  aria-label="Favorites"
                >
                  <Heart className="w-4 h-4" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-[#FAF8F5]">
                      {favorites.length}
                    </span>
                  )}
                </Link>

                {/* Cart Button */}
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-forest-950 bg-white hover:bg-cream-100 border border-cream-300 shadow-soft transition-all"
                  title="Shopping Cart"
                >
                  <ShoppingBag className="w-4 h-4 text-forest-700" />
                  <span>Cart</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-fresh-600 text-white text-[11px] font-extrabold">
                    {cartCount}
                  </span>
                </Link>

                {/* Consumer Account Dropdown */}
                <AccountDropdown />
              </>
            )}

            {/* CASE 2: FARMER LOGGED IN */}
            {isFarmer && (
              <>
                <Link
                  to="/farmer/dashboard"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-forest-950 bg-fresh-100 hover:bg-fresh-200/90 border border-fresh-300/80 transition-colors shadow-xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-forest-700" />
                  <span>Dashboard</span>
                </Link>

                {/* Farmer Account Dropdown */}
                <AccountDropdown />
              </>
            )}

            {/* CASE 3: LOGGED OUT */}
            {!isAuthenticated && (
              <>
                {/* Sell on FarmDirect */}
                <Link
                  to="/register?role=farmer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-forest-950 bg-cream-100 hover:bg-cream-200/80 border border-cream-300 transition-colors shadow-xs"
                >
                  <Sprout className="w-3.5 h-3.5 text-forest-700" />
                  <span className="hidden xl:inline">Sell on FarmDirect</span>
                  <span className="xl:hidden">Sell</span>
                </Link>

                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-charcoal-700 hover:text-forest-950 hover:bg-cream-100 transition-colors"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-cream-50 bg-forest-900 hover:bg-forest-800 active:bg-forest-950 transition-colors shadow-soft"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Language Selector */}
            <div className="relative ml-1">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-charcoal-700 hover:bg-cream-100 border border-cream-300/80 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-forest-700" />
                <span>{language}</span>
                <ChevronDown className="w-3 h-3 text-charcoal-500" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-cream-200 py-1.5 z-50 animate-fade-in">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-cream-100 flex items-center justify-between ${
                        language === lang.code ? 'text-forest-900 font-bold bg-forest-50' : 'text-charcoal-700'
                      }`}
                    >
                      <span>{lang.name}</span>
                      {language === lang.code && <span className="text-fresh-600 text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Controls: Search, Cart icon (if consumer or logged out), Hamburger */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <Link
              to="/marketplace"
              className="p-2 rounded-xl text-charcoal-700 hover:bg-cream-200/60"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Show cart badge for consumers and guests */}
            {!isFarmer && (
              <Link
                to="/cart"
                className="relative p-2 rounded-xl text-charcoal-700 hover:bg-cream-200/60"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-fresh-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-charcoal-800 hover:bg-cream-200/60 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-cream-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-fade-in">
          {/* If Logged In: Render Account Dropdown Mobile block */}
          {isAuthenticated ? (
            <AccountDropdown isMobile={true} onCloseMobileMenu={() => setMobileMenuOpen(false)} />
          ) : (
            <div className="p-3 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-charcoal-900">Welcome to FarmDirect</p>
                <p className="text-xs text-charcoal-500">Sign in to order fresh harvests</p>
              </div>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-forest-900 text-cream-50 text-xs font-bold shadow-xs"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'bg-forest-50 text-forest-950 font-bold'
                      : 'text-charcoal-800 hover:bg-cream-100'
                  }`}
                >
                  {link.isAi && <Sparkles className="w-4 h-4 text-fresh-600" />}
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {isConsumer && (
              <>
                <Link
                  to="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-charcoal-800 hover:bg-cream-100"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <span>My Favorites</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cream-200 text-xs font-bold">
                    {favorites.length}
                  </span>
                </Link>

                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-charcoal-800 hover:bg-cream-100"
                >
                  <Package className="w-4 h-4 text-forest-700" />
                  <span>My Orders</span>
                </Link>
              </>
            )}

            {isFarmer && (
              <Link
                to="/farmer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-charcoal-800 hover:bg-cream-100"
              >
                <LayoutDashboard className="w-4 h-4 text-forest-700" />
                <span>Farmer Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Mobile Footer CTAs */}
          {!isAuthenticated && (
            <div className="pt-3 border-t border-cream-200 flex flex-col gap-2">
              <Link
                to="/register?role=farmer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-forest-950 bg-fresh-100 border border-fresh-300"
              >
                <Sprout className="w-4 h-4 text-forest-700" />
                <span>Sell on FarmDirect</span>
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-center border border-cream-300 bg-white hover:bg-cream-50 text-charcoal-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-forest-900 hover:bg-forest-800 text-cream-50"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
