import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Mail,
  Phone,
  Package,
  Heart,
  Edit3,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ShoppingBag
} from 'lucide-react';
import Button from '../components/Button';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../auth/AuthContext';

export default function ConsumerProfilePage() {
  const { profile, updateProfile, orders, favorites } = useShop();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [formData, setFormData] = useState({
    fullName: user?.name || profile.fullName || 'Arun Kumar',
    email: user?.email || profile.email || 'arun@example.com',
    phone: user?.phone || profile.phone || '+91 98402 12345',
    address: user?.location || profile.address || 'Flat 402, Green Meadows, Fairlands',
    city: profile.city || 'Salem',
    state: profile.state || 'Tamil Nadu',
    pincode: profile.pincode || '636016'
  });

  // Keep updated if user state loads or changes
  React.useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.location || prev.address
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
    setFeedback('Profile details saved successfully!');
    setTimeout(() => setFeedback(''), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* 29. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            Manage your personal details, delivery addresses, and farm harvest preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-cream-300 hover:bg-cream-100 text-charcoal-800 text-xs font-bold shadow-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-charcoal-600 hover:text-charcoal-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-forest-900 text-cream-50 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-fresh-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Profile Card Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={profile.avatar}
            alt={formData.fullName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-cream-200 shadow-md"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-black text-charcoal-900">
                {formData.fullName}
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-fresh-50 text-forest-900 border border-fresh-200 self-center sm:self-auto">
                ✓ Verified Consumer
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-charcoal-600 pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-forest-700" />
                <span>{formData.email}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-forest-700" />
                <span>{formData.phone}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-forest-700" />
                <span>{formData.city}, {formData.state}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Profile Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-cream-200 text-center text-xs">
          <Link to="/orders" className="p-3 bg-cream-50 rounded-2xl hover:bg-cream-100 transition-colors">
            <span className="text-xl font-black text-charcoal-900 block">{orders.length}</span>
            <span className="text-charcoal-500 font-medium">Orders Placed</span>
          </Link>

          <Link to="/favorites" className="p-3 bg-cream-50 rounded-2xl hover:bg-cream-100 transition-colors">
            <span className="text-xl font-black text-rose-600 block">{favorites.length}</span>
            <span className="text-charcoal-500 font-medium">Favorites</span>
          </Link>

          <div className="p-3 bg-cream-50 rounded-2xl">
            <span className="text-xl font-black text-forest-900 block">3</span>
            <span className="text-charcoal-500 font-medium">Farmers Supported</span>
          </div>

          <div className="p-3 bg-cream-50 rounded-2xl">
            <span className="text-xl font-black text-charcoal-900 block">100%</span>
            <span className="text-charcoal-500 font-medium">Traceable Produce</span>
          </div>
        </div>
      </div>

      {/* Personal Information & Saved Address Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-6">
        <h3 className="font-extrabold text-base text-charcoal-900 pb-3 border-b border-cream-200">
          Personal Details & Saved Address
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              disabled={!isEditing}
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                isEditing ? 'bg-cream-50 border-cream-300' : 'bg-slate-100/60 border-slate-200 text-charcoal-600 cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">Email</label>
            <input
              type="email"
              name="email"
              disabled={!isEditing}
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                isEditing ? 'bg-cream-50 border-cream-300' : 'bg-slate-100/60 border-slate-200 text-charcoal-600 cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              disabled={!isEditing}
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                isEditing ? 'bg-cream-50 border-cream-300' : 'bg-slate-100/60 border-slate-200 text-charcoal-600 cursor-not-allowed'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">City / District</label>
            <input
              type="text"
              name="city"
              disabled={!isEditing}
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                isEditing ? 'bg-cream-50 border-cream-300' : 'bg-slate-100/60 border-slate-200 text-charcoal-600 cursor-not-allowed'
              }`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-charcoal-800 mb-1">Delivery Address</label>
            <input
              type="text"
              name="address"
              disabled={!isEditing}
              value={formData.address}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm ${
                isEditing ? 'bg-cream-50 border-cream-300' : 'bg-slate-100/60 border-slate-200 text-charcoal-600 cursor-not-allowed'
              }`}
            />
          </div>
        </div>

        {isEditing && (
          <div className="pt-3 border-t border-cream-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-cream-50 text-xs font-bold"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>

      {/* Quick Order History Preview Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cream-200">
          <h3 className="font-extrabold text-base text-charcoal-900">
            Recent Farm Direct Orders
          </h3>
          <Link to="/orders" className="text-xs font-bold text-forest-800 hover:text-forest-950 underline">
            View All ({orders.length}) →
          </Link>
        </div>

        <div className="divide-y divide-cream-100 text-xs">
          {orders.slice(0, 2).map((order) => (
            <div key={order.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-mono font-bold text-charcoal-900">{order.id}</p>
                <p className="text-charcoal-500 text-[11px]">
                  {order.orderDate} • {order.farmerName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-forest-950">₹{order.total}</span>
                <Link
                  to={`/orders/${order.id.replace('#', '')}`}
                  className="px-3 py-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 text-charcoal-800 font-bold text-[11px]"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
