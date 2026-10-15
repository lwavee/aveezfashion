'use client';

import React, { useEffect, useState } from 'react';
import { Boxes, RefreshCw, AlertCircle, AlertTriangle, Plus, Minus, Search, Check, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import styles from '../admin.module.css';

interface InventoryRow {
  productId: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [updatingSku, setUpdatingSku] = useState<string | null>(null);
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/inventory');
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load inventory.');

      setItems(Array.isArray(data.data?.variants) ? data.data.variants : []);
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

  const handleAdjustStock = async (sku: string, adjustment: number) => {
    setUpdatingSku(sku);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, adjustment }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to adjust stock.');
      }

      setItems((prev) =>
        prev.map((item) =>
          item.sku === sku
            ? {
                ...item,
                stock: data.data.newStock,
                isLowStock: data.data.newStock <= 5,
              }
            : item
        )
      );
      setActionSuccess(`Adjusted ${sku}: now ${data.data.newStock} units`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating stock');
    } finally {
      setUpdatingSku(null);
    }
  };

  const handleSetStock = async (sku: string) => {
    const rawVal = customInputs[sku];
    if (rawVal === undefined || rawVal === '') return;
    const stockNum = parseInt(rawVal, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      alert('Please enter a valid non-negative integer for stock count.');
      return;
    }

    setUpdatingSku(sku);
    setActionSuccess(null);
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, setStock: stockNum }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to set stock.');
      }

      setItems((prev) =>
        prev.map((item) =>
          item.sku === sku
            ? {
                ...item,
                stock: data.data.newStock,
                isLowStock: data.data.newStock <= 5,
              }
            : item
        )
      );
      setCustomInputs((prev) => ({ ...prev, [sku]: '' }));
      setActionSuccess(`Set ${sku}: ${data.data.newStock} units`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error updating stock');
    } finally {
      setUpdatingSku(null);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLowStock = !filterLowStockOnly || item.isLowStock;
    return matchesSearch && matchesLowStock;
  });

  const lowStockCount = items.filter((i) => i.isLowStock).length;
  const totalUnits = items.reduce((sum, i) => sum + i.stock, 0);

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>INVENTORY TELEMETRY & REPLENISHMENT</h1>
          <p className={styles.pageSubtitle}>
            Live SKU variant stock counts, quick replenishment controls, and warehouse safety margins.
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
          <button onClick={fetchInventory} className={styles.retryBtn}>
            RETRY
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '16px 20px', background: '#fff', border: '1px solid var(--color-gray-200)', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', letterSpacing: '0.08em' }}>TOTAL ON-HAND UNITS</div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: 'var(--color-black-rich)' }}>
            {isLoading ? '...' : totalUnits.toLocaleString('en-IN')}
          </div>
        </div>
        <div style={{ padding: '16px 20px', background: '#fff', border: '1px solid var(--color-gray-200)', borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', letterSpacing: '0.08em' }}>ACTIVE VARIANT SKUS</div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: 'var(--color-black-rich)' }}>
            {isLoading ? '...' : items.length}
          </div>
        </div>
        <div style={{ padding: '16px 20px', background: lowStockCount > 0 ? '#FFFBEB' : '#fff', border: `1px solid ${lowStockCount > 0 ? '#FCD34D' : 'var(--color-gray-200)'}`, borderRadius: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: lowStockCount > 0 ? '#B45309' : 'var(--color-gray-500)', letterSpacing: '0.08em' }}>LOW STOCK ALERTS (≤ 5)</div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '4px', color: lowStockCount > 0 ? '#DC2626' : 'var(--color-black-rich)' }}>
            {isLoading ? '...' : lowStockCount}
          </div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader} style={{ flexWrap: 'wrap', gap: '12px' }}>
          <h2 className={styles.sectionTitle}>
            VARIANT REPLENISHMENT MATRIX ({filteredItems.length} OF {items.length} SKUS)
          </h2>

          {/* Search and Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-gray-400)' }} />
              <input
                type="text"
                placeholder="Search SKU, product, size..."
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

            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: filterLowStockOnly ? '#FEF3C7' : '#fff',
                color: filterLowStockOnly ? '#B45309' : 'var(--color-black-rich)',
                border: `1px solid ${filterLowStockOnly ? '#FCD34D' : 'var(--color-gray-300)'}`,
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              <Filter size={13} />
              <span>{filterLowStockOnly ? 'SHOW ALL SKUS' : 'LOW STOCK ONLY'}</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loadingCard}>Calculating live variant inventory...</div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <Boxes size={42} color="var(--color-gray-400)" />
            <span className={styles.emptyStateTitle}>NO MATCHING SKUS</span>
            <p className={styles.emptyStateText}>
              {searchQuery || filterLowStockOnly
                ? 'No variant SKUs match your search or filter criteria.'
                : 'Variant inventory records will be displayed once products are published.'}
            </p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>MASTER PRODUCT</th>
                  <th>VARIANT SKU</th>
                  <th>SIZE / COLOR</th>
                  <th>CURRENT STOCK</th>
                  <th>STATUS</th>
                  <th>QUICK ADJUSTMENT</th>
                  <th>SET EXACT STOCK</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isUpdating = updatingSku === item.sku;
                  return (
                    <tr key={item.sku}>
                      <td>
                        <strong>{item.productTitle}</strong>
                      </td>
                      <td>
                        <code>{item.sku}</code>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{item.size}</span> &middot; <span style={{ color: 'var(--color-gray-600)' }}>{item.color}</span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '15px', color: item.isLowStock ? '#DC2626' : '#059669' }}>
                          {item.stock} units
                        </strong>
                      </td>
                      <td>
                        {item.stock === 0 ? (
                          <Badge variant="sale">OUT OF STOCK</Badge>
                        ) : item.isLowStock ? (
                          <Badge variant="sale">LOW STOCK</Badge>
                        ) : (
                          <Badge variant="default">HEALTHY</Badge>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            title="Decrement 1"
                            disabled={isUpdating || item.stock <= 0}
                            onClick={() => handleAdjustStock(item.sku, -1)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: '#F3F4F6',
                              border: '1px solid #D1D5DB',
                              borderRadius: '2px',
                              cursor: item.stock <= 0 || isUpdating ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <Minus size={11} />
                          </button>
                          <button
                            title="Add 5 units"
                            disabled={isUpdating}
                            onClick={() => handleAdjustStock(item.sku, 5)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: '#F3F4F6',
                              border: '1px solid #D1D5DB',
                              borderRadius: '2px',
                              cursor: isUpdating ? 'not-allowed' : 'pointer',
                            }}
                          >
                            +5
                          </button>
                          <button
                            title="Add 10 units"
                            disabled={isUpdating}
                            onClick={() => handleAdjustStock(item.sku, 10)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: '#F3F4F6',
                              border: '1px solid #D1D5DB',
                              borderRadius: '2px',
                              cursor: isUpdating ? 'not-allowed' : 'pointer',
                            }}
                          >
                            +10
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <input
                            type="number"
                            min="0"
                            placeholder="Qty"
                            value={customInputs[item.sku] ?? ''}
                            onChange={(e) =>
                              setCustomInputs((prev) => ({
                                ...prev,
                                [item.sku]: e.target.value,
                              }))
                            }
                            style={{
                              width: '65px',
                              padding: '4px 6px',
                              fontSize: '12px',
                              border: '1px solid var(--color-gray-300)',
                              borderRadius: '2px',
                            }}
                          />
                          <button
                            disabled={isUpdating || !customInputs[item.sku]}
                            onClick={() => handleSetStock(item.sku)}
                            style={{
                              padding: '5px 9px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: 'var(--color-black-rich)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '2px',
                              cursor: isUpdating || !customInputs[item.sku] ? 'not-allowed' : 'pointer',
                              opacity: isUpdating || !customInputs[item.sku] ? 0.5 : 1,
                            }}
                          >
                            {isUpdating ? 'SAVING...' : 'SAVE'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
