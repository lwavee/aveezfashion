'use client';

import React, { useEffect, useState } from 'react';
import { Shirt, RefreshCw, AlertCircle, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
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
  variantsCount: number;
  variants: ProductVariant[];
  totalStock: number;
  isActive: boolean;
  imagesCount: number;
  heroImage: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>CATALOG & PRODUCT VARIANTS</h1>
          <p className={styles.pageSubtitle}>
            Live platform catalog, variant SKU matrix, sizing, and inventory levels.
          </p>
        </div>
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
          <span>SYNC CATALOG</span>
        </button>
      </div>

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
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            ACTIVE MASTER PRODUCTS ({isLoading ? '...' : products.length})
          </h2>
        </div>

        {isLoading ? (
          <div className={styles.loadingCard}>Loading live catalog records...</div>
        ) : products.length === 0 ? (
          <div className={styles.emptyState}>
            <Layers size={42} color="var(--color-gray-400)" />
            <span className={styles.emptyStateTitle}>NO PRODUCTS IN CATALOG</span>
            <p className={styles.emptyStateText}>
              No product records found in the database.
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
                  <th>SKU BREAKDOWN</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <strong>{p.title}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>/{p.slug}</div>
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
                    <td style={{ fontSize: '11px', color: 'var(--color-gray-600)', maxWidth: '300px' }}>
                      {p.variants.map((v) => `${v.size}: ${v.stock}`).join(' | ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
