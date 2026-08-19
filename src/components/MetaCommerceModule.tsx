import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  RefreshCw,
  Share2,
  CheckCircle2,
  Tag,
  DollarSign,
  Package,
  SlidersHorizontal,
  ExternalLink,
  Edit3,
  Trash2,
  Store,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Product } from '../types';

interface MetaCommerceModuleProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const MetaCommerceModule: React.FC<MetaCommerceModuleProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  // Share Catalog Modal
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const categories = ['All', 'Electronics', 'Audio', 'Office & Lifestyle', 'Furniture'];

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSyncMeta = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const fullProd: Product = {
      id: editingProduct.id || `prod_${Date.now()}`,
      name: editingProduct.name || 'New Meta Product',
      price: Number(editingProduct.price) || 0,
      currency: editingProduct.currency || 'USD',
      description: editingProduct.description || '',
      imageUrl:
        editingProduct.imageUrl ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      category: editingProduct.category || 'General',
      sku: editingProduct.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
      stockQuantity: Number(editingProduct.stockQuantity) || 10,
      metaCatalogId: editingProduct.metaCatalogId || 'META_CATALOG_88401',
      inStock: (editingProduct.stockQuantity ?? 10) > 0,
    };

    if (editingProduct.id) {
      onUpdateProduct(fullProd);
    } else {
      onAddProduct(fullProd);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-6 overflow-y-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Meta Commerce Manager
            </span>
            <span className="text-xs text-slate-400">Shopify & Meta Catalog Dual Sync</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Product Catalog & Chat Storefront
          </h1>
          <p className="text-sm text-slate-400">
            Showcase products in WhatsApp & LiveChat threads. Allow customers to browse, add to cart, and checkout seamlessly inside messages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShareModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4 text-teal-400" />
            Share Catalog (1 Tap)
          </button>
          <button
            onClick={handleSyncMeta}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing Catalog...' : 'Sync Inventory'}
          </button>
          <button
            onClick={() => {
              setEditingProduct({
                name: '',
                price: 99,
                currency: 'USD',
                category: 'Electronics',
                description: '',
                imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
                sku: 'PROD-NEW-01',
                stockQuantity: 25,
                metaCatalogId: 'META_CATALOG_88401',
              });
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Meta Commerce Status Alert Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Meta Commerce Catalog Active</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-xs text-slate-400">
              WABA ID: <span className="font-mono text-slate-200">WABA_982301492041920</span> • Catalog ID: <span className="font-mono text-emerald-300">META_CATALOG_88401</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-300 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">Total Inventory</span>
            <span className="font-bold text-white text-sm">{products.length} SKUs Listed</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-semibold">In-Chat Orders</span>
            <span className="font-bold text-emerald-400 text-sm">$14,280 revenue</span>
          </div>
        </div>
      </div>

      {syncSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs mb-6 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          Catalog inventory successfully synced with Meta Commerce Manager & Shopify Storefront!
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((prod) => (
          <div
            key={prod.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all group flex flex-col justify-between shadow-lg"
          >
            <div>
              {/* Product Image */}
              <div className="relative h-48 bg-slate-950 overflow-hidden">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                  {prod.category}
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/80 backdrop-blur-md text-slate-300 border border-slate-800">
                  {prod.sku}
                </span>
              </div>

              {/* Details */}
              <div className="p-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-emerald-300 transition-colors">
                    {prod.name}
                  </h3>
                  <span className="text-base font-extrabold text-emerald-400 ml-2 font-mono">
                    ${prod.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
                  {prod.description}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
                  <span className="flex items-center gap-1 font-mono">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    Stock: {prod.stockQuantity} units
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Meta Synced
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 pt-0 flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingProduct({ ...prod });
                  setIsModalOpen(true);
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-700/50"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                Edit Item
              </button>
              <button
                onClick={() => onDeleteProduct(prod.id)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-all border border-slate-700/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT / CREATE PRODUCT MODAL */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveForm}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4"
          >
            <h2 className="font-bold text-lg text-white">
              {editingProduct.id ? 'Edit Product Item' : 'Add New Meta Catalog Product'}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Product Title</label>
              <input
                type="text"
                value={editingProduct.name || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.price ?? ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={editingProduct.category || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Number</label>
                <input
                  type="text"
                  value={editingProduct.sku || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={editingProduct.stockQuantity ?? 10}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL</label>
              <input
                type="text"
                value={editingProduct.imageUrl || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SHARE CATALOG MODAL */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-emerald-400" />
              Share Meta Product Catalog
            </h2>
            <p className="text-xs text-slate-400">
              Share your interactive WhatsApp storefront link with customers or send directly into active chat threads.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-300 truncate">
                https://wa.me/c/15553892041?catalog_id=META_CATALOG_88401
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('https://wa.me/c/15553892041?catalog_id=META_CATALOG_88401');
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shrink-0 ml-2"
              >
                {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
