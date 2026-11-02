import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import OrderStatusBadge from '../../components/farmer/OrderStatusBadge';
import ProductDetailModal from '../../components/farmer/ProductDetailModal';
import { useFarmerToast } from '../../components/farmer/FarmerDashboardLayout';
import productsApi from '../../api/products';

export default function FarmerProductsPage() {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') === 'expiring' ? 'Expiring Soon' : 'All';

  const { showToast } = useFarmerToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [sortBy, setSortBy] = useState('Newest');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Quick Stock Edit State
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState('');

  const loadFarmerProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await productsApi.getFarmerProducts({
        sort: sortBy
      });
      if (res?.data?.products) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching farmer products:', err);
      setError('Unable to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sortBy]);

  useEffect(() => {
    loadFarmerProducts();
  }, [loadFarmerProducts]);

  // Stock summary counts from real products
  const counts = useMemo(() => {
    return {
      all: products.length,
      active: products.filter((p) => p.stock > 0 && (p.status === 'Active' || p.status === 'ACTIVE')).length,
      outOfStock: products.filter((p) => p.stock === 0 || p.status === 'Out of Stock' || p.status === 'OUT_OF_STOCK').length,
      expiringSoon: products.filter((p) => p.isExpiringSoon).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock < (p.lowStockThreshold || 15)).length
    };
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.ingredients && p.ingredients.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        if (activeFilter === 'Active') {
          return p.stock > 0 && (p.status === 'Active' || p.status === 'ACTIVE');
        }
        if (activeFilter === 'Out of Stock') {
          return p.stock === 0 || p.status === 'Out of Stock' || p.status === 'OUT_OF_STOCK';
        }
        if (activeFilter === 'Expiring Soon') {
          return p.isExpiringSoon;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Price') return b.price - a.price;
        if (sortBy === 'Stock') return b.stock - a.stock;
        if (sortBy === 'Freshness') return (a.expiryDays || 99) - (b.expiryDays || 99);
        return 0; // default order
      });
  }, [products, searchQuery, activeFilter, sortBy]);

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to remove "${productName}" from your active listings?`)) {
      try {
        await productsApi.deleteProduct(productId);
        showToast({
          type: 'info',
          title: 'Listing Removed',
          message: `"${productName}" has been removed from your active store.`
        });
        loadFarmerProducts();
      } catch (err) {
        showToast({
          type: 'error',
          title: 'Action Failed',
          message: err.message || 'Unable to remove product.'
        });
      }
    }
  };

  const handleOpenDetail = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleStartStockEdit = (product) => {
    setEditingStockId(product.id);
    setTempStockValue(String(product.stock));
  };

  const handleSaveStockEdit = async (productId) => {
    const newStock = parseInt(tempStockValue, 10);
    if (isNaN(newStock) || newStock < 0) {
      alert('Stock cannot be negative.');
      return;
    }

    try {
      await productsApi.updateProduct(productId, {
        availableQuantity: newStock,
        status: newStock === 0 ? 'OUT_OF_STOCK' : 'ACTIVE'
      });
      setEditingStockId(null);
      showToast({
        type: 'success',
        title: 'Stock Updated',
        message: `Inventory stock updated to ${newStock}.`
      });
      loadFarmerProducts();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Unable to update stock.'
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 9. Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Products
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your farm products and keep your listings up to date.
          </p>
        </div>

        <Link
          to="/farmer/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-bold shadow-soft transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </Link>
      </div>

      {/* 16. Stock Metrics Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Products
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {counts.all}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
            Active in Store
          </span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">
            {counts.active}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">
            Low Stock
          </span>
          <span className="text-2xl font-black text-amber-800 mt-1 block">
            {counts.lowStock}
          </span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-soft">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block">
            Out of Stock
          </span>
          <span className="text-2xl font-black text-rose-800 mt-1 block">
            {counts.outOfStock}
          </span>
        </div>
      </div>

      {/* Filters, Search & Sorting Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-4 flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search your products by name, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {['All', 'Active', 'Out of Stock', 'Expiring Soon'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === f
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <span className="text-xs text-slate-500 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
          >
            <option value="Newest">Newest</option>
            <option value="Price">Highest Price</option>
            <option value="Stock">Available Stock</option>
            <option value="Freshness">Freshness / Expiry</option>
          </select>
        </div>
      </div>

      {/* Product Management Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-forest-700 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Loading your farm catalog from database...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-3 shadow-soft">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">{error}</h3>
          <button
            type="button"
            onClick={loadFarmerProducts}
            className="px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Harvest Date</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500">
                      No products found matching your current filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isLow = p.stock > 0 && p.stock < (p.lowStockThreshold || 15);
                    const isOut = p.stock === 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Product Column with Image */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image || p.imageUrl}
                              alt={p.name}
                              className="w-11 h-11 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">
                                {p.name}
                              </span>
                              <span className="text-[11px] text-slate-500 capitalize">
                                {p.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                          ₹{p.price} <span className="text-xs text-slate-500 font-normal">/ {p.unit}</span>
                        </td>

                        {/* Stock with Section 16 warning and inline update */}
                        <td className="py-3.5 px-4">
                          {editingStockId === p.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={tempStockValue}
                                onChange={(e) => setTempStockValue(e.target.value)}
                                className="w-16 px-2 py-1 border rounded text-xs"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveStockEdit(p.id)}
                                className="px-2 py-1 bg-forest-900 text-white rounded text-[11px] font-bold"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingStockId(null)}
                                className="text-slate-400 text-xs px-1"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${isOut ? 'text-rose-600' : isLow ? 'text-amber-700' : 'text-slate-800'}`}>
                                  {p.stock} {p.unit}s
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStartStockEdit(p)}
                                  className="text-[10px] text-forest-700 hover:underline font-semibold"
                                >
                                  Update
                                </button>
                              </div>
                              {isLow && (
                                <div className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Low stock</span>
                                </div>
                              )}
                              {isOut && (
                                <span className="block text-[10px] text-rose-600 font-bold">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Harvest Date */}
                        <td className="py-3.5 px-4 text-slate-600">
                          {p.harvestDate || 'N/A'}
                        </td>

                        {/* Expiry Date */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className={`font-semibold ${p.isExpiringSoon ? 'text-amber-800' : 'text-slate-700'}`}>
                              {p.expiryDate || 'N/A'}
                            </span>
                            {p.isExpiringSoon && (
                              <span className="block text-[10px] text-amber-700 font-bold">
                                ⚠ Expires soon
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <OrderStatusBadge
                            status={isOut ? 'Out of Stock' : isLow ? 'Low Stock' : p.status}
                          />
                        </td>

                        {/* Actions: View, Edit, Delete */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDetail(p)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                              title="View Product Insights"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <Link
                              to={`/farmer/products/${p.id}/edit`}
                              className="p-1.5 text-slate-600 hover:text-emerald-800 rounded-lg hover:bg-emerald-50 transition-colors"
                              title="Edit Listing"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Product Cards View */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filteredProducts.map((p) => {
              const isLow = p.stock > 0 && p.stock < (p.lowStockThreshold || 15);
              const isOut = p.stock === 0;

              return (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={p.image || p.imageUrl}
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {p.name}
                        </h4>
                        <OrderStatusBadge
                          status={isOut ? 'Out of Stock' : isLow ? 'Low Stock' : p.status}
                        />
                      </div>

                      <p className="text-xs text-slate-500 capitalize mt-0.5">
                        {p.category}
                      </p>

                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          ₹{p.price}
                        </span>
                        <span className="text-[11px] text-slate-500">/ {p.unit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stock info */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Stock</span>
                      <span className={`font-bold ${isOut ? 'text-rose-600' : isLow ? 'text-amber-700' : 'text-slate-800'}`}>
                        {p.stock} {p.unit}s
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Expiry</span>
                      <span className="font-semibold text-slate-700">
                        {p.expiryDate || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(p)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold bg-white"
                    >
                      View
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/farmer/products/${p.id}/edit`}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id, p.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Farmer Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
