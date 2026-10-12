'use client';

import React, { useEffect, useState } from 'react';
import { Boxes, RefreshCw, AlertCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import styles from '../admin.module.css';

interface InventoryRow {
  productTitle: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  isLowStock: boolean;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load inventory.');

      const products = Array.isArray(data.data?.products) ? data.data.products : [];
      const rows: InventoryRow[] = [];

      for (const p of products) {
        for (const v of p.variants || []) {
          rows.push({
            productTitle: p.title,
            sku: v.sku,
            size: v.size,
            color: v.color,
            stock: v.stock || 0,
            isLowStock: (v.stock || 0) <= 5,
          });
        }
      }

      setItems(rows);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve inventory.');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const lowStockCount = items.filter((i) => i.isLowStock).length;

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>INVENTORY TELEMETRY</h1>
          <p className={styles.pageSubtitle}>
            Live SKU variant stock counts, replenishment flags, and warehouse allocations.
          </p>
        </div>
        <button
          onClick={fetchInventory}
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
          <span>SYNC INVENTORY</span>
        </button>
      </div>

      {error && (
        <div className={styles.errorState}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchInventory} className={styles.retryBtn}>
            RETRY
          </button>
        </div>
      )}

      {lowStockCount > 0 && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FFFBEB',
            border: '1px solid #FCD34D',
            borderRadius: 'var(--radius-xs)',
            color: '#B45309',
            fontSize: 'var(--font-size-caption)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={18} />
          <span>
            <strong>Attention:</strong> {lowStockCount} variant SKU(s) are below safety stock threshold (≤ 5 units).
          </span>
        </div>
      )}

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            ACTIVE VARIANT MATRIX ({isLoading ? '...' : items.length} SKUs)
          </h2>
        </div>

        {isLoading ? (
          <div className={styles.loadingCard}>Calculating live variant inventory...</div>
        ) : items.length === 0 ? (
          <div className={styles.emptyState}>
            <Boxes size={42} color="var(--color-gray-400)" />
            <span className={styles.emptyStateTitle}>NO INVENTORY ITEMS</span>
            <p className={styles.emptyStateText}>
              Variant inventory records will be displayed once products are published.
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>MASTER PRODUCT</th>
                  <th>VARIANT SKU</th>
                  <th>SIZE</th>
                  <th>COLORWAY</th>
                  <th>ON-HAND STOCK</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.sku}>
                    <td>
                      <strong>{item.productTitle}</strong>
                    </td>
                    <td>
                      <code>{item.sku}</code>
                    </td>
                    <td>{item.size}</td>
                    <td>{item.color}</td>
                    <td>
                      <strong style={{ color: item.isLowStock ? '#DC2626' : '#059669' }}>
                        {item.stock} units
                      </strong>
                    </td>
                    <td>
                      {item.isLowStock ? (
                        <Badge variant="sale">LOW STOCK</Badge>
                      ) : (
                        <Badge variant="default">HEALTHY</Badge>
                      )}
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
