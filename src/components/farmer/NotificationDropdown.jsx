import React, { useState } from 'react';
import { Bell, Check, Clock, AlertTriangle, ShoppingCart, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NOTIFICATIONS } from '../../data/farmerData';

export default function NotificationDropdown({ onSelectToast }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState(NOTIFICATIONS);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setItems(items.map((n) => ({ ...n, read: true })));
    onSelectToast?.({
      type: 'info',
      title: 'Notifications',
      message: 'All notifications marked as read.'
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'expiry':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
      case 'stock':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-forest-700" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-elevated border border-slate-200 overflow-hidden z-50 animate-fade-in">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Notifications
                </h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {items.map((notif) => (
                <Link
                  key={notif.id}
                  to={notif.link || '/farmer/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors ${
                    !notif.read ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-slate-900">{notif.title}</p>
                    <p className="text-slate-600 mt-0.5 leading-normal">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {notif.time}
                    </span>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0 self-center" />
                  )}
                </Link>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2 bg-slate-50 text-center border-t border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium">
                Prototype Mock Notifications
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
