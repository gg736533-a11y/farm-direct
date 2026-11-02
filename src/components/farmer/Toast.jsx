import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-fresh-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
  };

  const bgStyles = {
    success: 'bg-white border-fresh-200 text-charcoal-900',
    error: 'bg-white border-rose-200 text-charcoal-900',
    info: 'bg-white border-blue-200 text-charcoal-900'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-short">
      <div className={`p-4 rounded-2xl shadow-elevated border flex items-start gap-3 ${bgStyles[toast.type || 'info']}`}>
        {icons[toast.type || 'info']}
        <div className="flex-1 text-xs">
          <p className="font-bold text-sm text-charcoal-900">{toast.title || 'Notification'}</p>
          <p className="text-charcoal-600 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-charcoal-400 hover:text-charcoal-700 p-1 rounded-lg hover:bg-cream-100 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
