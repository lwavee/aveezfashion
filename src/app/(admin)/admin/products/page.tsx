'use client';

import React, { useEffect, useState } from 'react';
import {
  Shirt,
  RefreshCw,
  AlertCircle,
  Layers,
  Plus,
  Search,
  Filter,
  Edit2,
  X,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import styles from '../admin.module.css';

interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  stock: number;
}

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  sku: string;
  price: string;
  rawPrice: number;
  variantsCount: number;
  variants: ProductVariant[];
  totalStock: number;
  isActive: boolean;
  status: string;
  imagesCount: number;
  heroImage: string;
}

const CATEGORY_OPTIONS = [
  { slug: 'men', label: 'Men' },
  { slug: 'women', label: 'Women' },
  { slug: 'accessories', label: 'Accessories' },
  { slug: 't-shirts', label: 'T-Shirts' },
  { slug: 'hoodies-sweatshirts', label: 'Hoodies & Sweatshirts' },
  { slug: 'shirts', label: 'Shirts' },
  { slug: 'pants-trousers', label: 'Pants & Trousers' },
  { slug: 'hairbands', label: 'Hairbands' },
  { slug: 'hair-clips', label: 'Hair Clips' },
  { slug: 'claw-clips', label: 'Claw Clips' },
  { slug: 'keychains-charms', label: 'Keychains & Charms' },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addForm, setAddForm] = useState({
    title: '',
    category: 'accessories',
    gender: 'UNISEX',
    basePrice: '',
    salePrice: '',
    description: '',
    imageUrl: '',
    sizes: 'ONESIZE',
    initialStock: '20',
    status: 'PUBLISHED',
  });

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    basePrice: '',
    salePrice: '',
    description: '',
    status: 'PUBLISHED',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load catalog.');
      setProducts(Array.isArray(data.data?.products) ? data.data.products : []);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve catalog products.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setAddForm({
      title: '',
      category: 'accessories',
      gender: 'UNISEX',
      basePrice: '',
      salePrice: '',
      description: '',
      imageUrl: '',
      sizes: 'ONESIZE',
      initialStock: '20',
      status: 'PUBLISHED',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.title.trim() || !addForm.basePrice || !addForm.description.trim()) {
      alert('Please fill in required fields: Title, Base Price, and Description.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse sizes
      const sizeList = addForm.sizes
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      const stockPerSize = Math.max(0, parseInt(addForm.initialStock, 10) || 10);

      const variants = sizeList.map((size) => ({
        sku: `AVZ-${addForm.title.substring(0, 3).toUpperCase()}-${size}-${Date.now().toString(36).substring(4)}`,
        size,
        color: 'Default',
        colorHex: '#0A0A0A',
        stock: stockPerSize,
      }));

      const payload = {
        title: addForm.title.trim(),
        category: addForm.category,
        gender: addForm.gender,
        basePrice: parseFloat(addForm.basePrice),
        salePrice: addForm.salePrice ? parseFloat(addForm.salePrice) : undefined,
        description: addForm.description.trim(),
        images: addForm.imageUrl.trim() ? [addForm.imageUrl.trim()] : ['/images/placeholder.jpg'],
        variants,
        status: addForm.status,
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create product.');
      }

      setIsAddModalOpen(false);
      setActionSuccess(`Product "${addForm.title}" created successfully!`);
      setTimeout(() => setActionSuccess(null), 3500);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Error creating product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (prod: ProductItem) => {
    setEditingProduct(prod);
    setEditForm({
      title: prod.title,
      basePrice: String(prod.rawPrice || ''),
      salePrice: '',
      description: '',
      status: prod.status || 'PUBLISHED',
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsSavingEdit(true);
    try {
      const payload: any = {
        title: editForm.title.trim(),
        status: editForm.status,
      };
      if (editForm.basePrice) payload.basePrice = parseFloat(editForm.basePrice);
      if (editForm.salePrice) payload.salePrice = parseFloat(editForm.salePrice);
      if (editForm.description.trim()) payload.description = editForm.description.trim();

      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update product.');
      }

      setEditingProduct(null);
      setActionSuccess(`Updated "${editForm.title}" successfully.`);
      setTimeout(() => setActionSuccess(null), 3500);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Error updating product.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PUBLISHED' && p.isActive) ||
      (statusFilter === 'DRAFT' && !p.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>CATALOG & PRODUCT VARIANTS</h1>
          <p className={styles.pageSubtitle}>
            Live platform catalog, variant SKU matrix, sizing, and inventory levels.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={fetchProducts}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: 'var(--color-white-pure)',
              border: '1px solid var(--color-gray-300)',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--font-size-caption)',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              color: 'var(--color-black-rich)',
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>SYNC</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: 'var(--color-black-rich)',
              border: 'none',
              borderRadius: 'var(--radius-xs)',
              fontSize: 'var(--font-size-caption)',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            <Plus size={14} />
            <span>NEW PRODUCT</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #6EE7B7',
            borderRadius: 'var(--radius-xs)',
            color: '#065F46',
            fontSize: 'var(--font-size-caption)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className={styles.errorState}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchProducts} className={styles.retryBtn}>
            RETRY
          </button>
        </div>
      )}

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader} style={{ flexWrap: 'wrap', gap: '12px' }}>
          <h2 className={styles.sectionTitle}>
            ACTIVE MASTER PRODUCTS ({filteredProducts.length} OF {products.length})
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-gray-400)' }} />
              <input
                type="text"
                placeholder="Search title, SKU, slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '7px 12px 7px 32px',
                  fontSize: '12px',
                  border: '1px solid var(--color-gray-300)',
                  borderRadius: '3px',
                  width: '100%',
                }}
              />
            </div>

            <div style={{ display: 'inline-flex', border: '1px solid var(--color-gray-300)', borderRadius: '3px', overflow: 'hidden' }}>
              {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setStatusFilter(mode)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: statusFilter === mode ? 'var(--color-black-rich)' : '#fff',
                    color: statusFilter === mode ? '#fff' : 'var(--color-gray-600)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingCard}>Loading live catalog records...</div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles.emptyState}>
            <Layers size={42} color="var(--color-gray-400)" />
            <span className={styles.emptyStateTitle}>NO PRODUCTS FOUND</span>
            <p className={styles.emptyStateText}>
              {searchQuery || statusFilter !== 'ALL'
                ? 'No catalog items match your search or filter.'
                : 'No product records found in the database.'}
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>MASTER PRODUCT</th>
                  <th>PRIMARY SKU</th>
                  <th>PRICE</th>
                  <th>VARIANTS</th>
                  <th>TOTAL STOCK</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <strong>{p.title}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>/{p.slug}</span>
                          <a
                            href={`/products/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on Storefront"
                            style={{ color: 'var(--color-gray-400)', display: 'inline-flex' }}
                          >
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code>{p.sku}</code>
                    </td>
                    <td>
                      <strong>{p.price}</strong>
                    </td>
                    <td>
                      <span>{p.variantsCount} Sizes/Colors</span>
                      <div style={{ fontSize: '10px', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                        {p.variants.map((v) => `${v.size}: ${v.stock}`).join(' | ')}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: p.totalStock <= 20 ? '#B45309' : '#047857' }}>
                        {p.totalStock} units
                      </strong>
                    </td>
                    <td>
                      <Badge variant={p.isActive ? 'default' : 'sale'}>
                        {p.isActive ? 'LIVE IN STORE' : 'DRAFT'}
                      </Badge>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: '#F3F4F6',
                          border: '1px solid #D1D5DB',
                          borderRadius: '2px',
                          cursor: 'pointer',
                        }}
                      >
                        <Edit2 size={11} />
                        <span>EDIT</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '4px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.04em' }}>ADD NEW CATALOG PRODUCT</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-500)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                  PRODUCT TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sculpted Brass Hair Pin"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                    CATEGORY *
                  </label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px', background: '#fff' }}
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                    GENDER
                  </label>
                  <select
                    value={addForm.gender}
                    onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px', background: '#fff' }}
                  >
                    <option value="UNISEX">Unisex</option>
                    <option value="WOMEN">Women</option>
                    <option value="MEN">Men</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                    BASE PRICE (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1499"
                    value={addForm.basePrice}
                    onChange={(e) => setAddForm({ ...addForm, basePrice: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                    SALE PRICE (₹, OPTIONAL)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1199"
                    value={addForm.salePrice}
                    onChange={(e) => setAddForm({ ...addForm, salePrice: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                  DESCRIPTION *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Artisanal fashion piece designed with architectural clarity..."
                  value={addForm.description}
                  onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                  PRIMARY IMAGE URL
                </label>
                <input
                  type="text"
                  placeholder="https://... or /images/..."
                  value={addForm.imageUrl}
                  onChange={(e) => setAddForm({ ...addForm, imageUrl: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                    SIZES (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    placeholder="ONESIZE or S, M, L, XL"
                    value={addForm.sizes}
                    onChange={(e) => setAddForm({ ...addForm, sizes: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                    STOCK / SIZE
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="15"
                    value={addForm.initialStock}
                    onChange={(e) => setAddForm({ ...addForm, initialStock: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                  PUBLISH STATUS
                </label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px', background: '#fff' }}
                >
                  <option value="PUBLISHED">Published (Live in Store)</option>
                  <option value="DRAFT">Draft (Hidden)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '8px 16px', fontSize: '12px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '3px', cursor: 'pointer' }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-black-rich)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'CREATING...' : 'CREATE PRODUCT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '4px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800 }}>EDIT PRODUCT</h2>
                <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>SKU: {editingProduct.sku}</div>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-500)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                  PRODUCT TITLE
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                    BASE PRICE (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.basePrice}
                    onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                    SALE PRICE (₹, OPTIONAL)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="None"
                    value={editForm.salePrice}
                    onChange={(e) => setEditForm({ ...editForm, salePrice: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px' }}>
                  CATALOG STATUS
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '3px', background: '#fff' }}
                >
                  <option value="PUBLISHED">Published (Live in Store)</option>
                  <option value="DRAFT">Draft (Hidden)</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={{ padding: '8px 16px', fontSize: '12px', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '3px', cursor: 'pointer' }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  style={{
                    padding: '8px 20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-black-rich)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: isSavingEdit ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSavingEdit ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
