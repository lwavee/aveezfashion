'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Layers,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Power,
  X,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import styles from '../admin.module.css';

interface CollectionItem {
  id: string;
  title: string;
  slug: string;
  tagline?: string;
  description?: string;
  coverImage: string;
  featured: boolean;
  departments: ('MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES')[];
  categories: { id: string; name: string; slug: string }[];
  productCount: number;
  isActive: boolean;
}

const ALL_DEPARTMENTS: ('MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES')[] = [
  'MEN',
  'WOMEN',
  'UNISEX',
  'ACCESSORIES',
];

export function CollectionsManager() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Add Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addSlug, setAddSlug] = useState('');
  const [addTagline, setAddTagline] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addCover, setAddCover] = useState('/images/heroimage1.png');
  const [addDepts, setAddDepts] = useState<('MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES')[]>([
    'MEN',
    'WOMEN',
    'UNISEX',
  ]);
  const [addSelectedCats, setAddSelectedCats] = useState<string[]>([]);
  const [addFeatured, setAddFeatured] = useState(false);
  const [addActive, setAddActive] = useState(true);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Edit Modal State
  const [editingCol, setEditingCol] = useState<CollectionItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCover, setEditCover] = useState('');
  const [editDepts, setEditDepts] = useState<('MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES')[]>([]);
  const [editSelectedCats, setEditSelectedCats] = useState<string[]>([]);
  const [editFeatured, setEditFeatured] = useState(false);
  const [editActive, setEditActive] = useState(true);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [colRes, taxRes] = await Promise.all([
        fetch('/api/admin/collections'),
        fetch('/api/admin/taxonomy'),
      ]);

      const colData = await colRes.json();
      if (colRes.ok && colData.success) {
        setCollections(colData.data.collections || []);
      }

      const taxData = await taxRes.json();
      if (taxRes.ok && taxData.success) {
        setAllCategories(taxData.data.categories || []);
      }
    } catch (err) {
      console.warn('Error loading collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim()) {
      alert('Collection Title is required.');
      return;
    }
    if (addDepts.length === 0) {
      alert('Please select at least one Department.');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await fetch('/api/admin/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addTitle.trim(),
          slug: addSlug.trim() || undefined,
          tagline: addTagline.trim(),
          description: addDesc.trim(),
          coverImage: addCover.trim() || '/images/heroimage1.png',
          departments: addDepts,
          categories: addSelectedCats,
          featured: addFeatured,
          isActive: addActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create collection.');
      }

      setIsAddOpen(false);
      setAddTitle('');
      setAddSlug('');
      setAddTagline('');
      setAddDesc('');
      setAddSelectedCats([]);
      setSuccessMsg(`Collection "${data.data.title}" created successfully.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error creating collection.');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleOpenEdit = (col: CollectionItem) => {
    setEditingCol(col);
    setEditTitle(col.title);
    setEditSlug(col.slug);
    setEditTagline(col.tagline || '');
    setEditDesc(col.description || '');
    setEditCover(col.coverImage || '');
    setEditDepts(col.departments || ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES']);
    setEditSelectedCats((col.categories || []).map((c) => c.id));
    setEditFeatured(col.featured);
    setEditActive(col.isActive);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCol) return;

    if (!editTitle.trim()) {
      alert('Collection Title is required.');
      return;
    }
    if (editDepts.length === 0) {
      alert('Please select at least one Department.');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const res = await fetch(`/api/admin/collections/${editingCol.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          slug: editSlug.trim(),
          tagline: editTagline.trim(),
          description: editDesc.trim(),
          coverImage: editCover.trim(),
          departments: editDepts,
          categories: editSelectedCats,
          featured: editFeatured,
          isActive: editActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update collection.');
      }

      setEditingCol(null);
      setSuccessMsg(`Collection "${editTitle}" updated successfully.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error updating collection.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleToggleActive = async (col: CollectionItem) => {
    try {
      const res = await fetch(`/api/admin/collections/${col.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !col.isActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle status.');
      }
      setSuccessMsg(`Collection "${col.title}" is now ${!col.isActive ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error updating collection status.');
    }
  };

  const handleDelete = async (col: CollectionItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete collection "${col.title}"? Associated products will have their collection unassigned.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/collections/${col.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete collection.');
      }
      setSuccessMsg(`Collection "${col.title}" deleted.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error deleting collection.');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleStack}>
          <h1 className={styles.pageTitle}>Curated Collections</h1>
          <p className={styles.pageSubtitle}>
            Editorial drops, capsules, and department/category associations.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.syncBtn}
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw size={13} className={loading ? styles.spinning : ''} />
            <span>REFRESH</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            <span>ADD COLLECTION</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            border: '1px solid #10B981',
            color: '#065F46',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Collections Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <Layers size={16} className={styles.sectionHeaderIcon} />
            <h2 className={styles.cardTitle}>Storefront Collections</h2>
            <span className={styles.cardBadge}>{collections.length} editorial capsules</span>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Collection & Tagline</th>
                  <th scope="col">Slug</th>
                  <th scope="col">Valid Departments</th>
                  <th scope="col">Category Scope</th>
                  <th scope="col">Products</th>
                  <th scope="col">Status</th>
                  <th scope="col" className={styles.alignRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#71717A' }}>
                      {loading ? 'Loading collections...' : 'No collections configured.'}
                    </td>
                  </tr>
                ) : (
                  collections.map((col) => (
                    <tr key={col.id || col.slug}>
                      <td>
                        <div className={styles.inventoryItemCell}>
                          <span className={styles.inventoryTitle}>{col.title}</span>
                          <span className={styles.inventoryMeta}>{col.tagline || 'Editorial drop'}</span>
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.75rem', background: '#F4F4F5', padding: '2px 6px', borderRadius: '4px' }}>
                          {col.slug}
                        </code>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(col.departments || []).map((dept) => (
                            <span
                              key={dept}
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background:
                                  dept === 'ACCESSORIES'
                                    ? '#FEF3C7'
                                    : dept === 'MEN'
                                    ? '#E0E7FF'
                                    : dept === 'WOMEN'
                                    ? '#FCE7F3'
                                    : '#E5E7EB',
                                color:
                                  dept === 'ACCESSORIES'
                                    ? '#92400E'
                                    : dept === 'MEN'
                                    ? '#3730A3'
                                    : dept === 'WOMEN'
                                    ? '#9D174D'
                                    : '#1F2937',
                              }}
                            >
                              {dept}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#52525B' }}>
                          {col.categories && col.categories.length > 0
                            ? `${col.categories.length} specific categories`
                            : 'All categories in departments'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: col.productCount > 0 ? '#0A0A0A' : '#71717A' }}>
                          {col.productCount} {col.productCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td>
                        {col.isActive ? (
                          <span className={`${styles.statusBadge} ${styles.statusPaid}`}>
                            <CheckCircle2 size={11} style={{ marginRight: '4px' }} />
                            Published
                          </span>
                        ) : (
                          <span className={`${styles.statusBadge} ${styles.statusRefunded}`}>
                            <XCircle size={11} style={{ marginRight: '4px' }} />
                            Draft
                          </span>
                        )}
                      </td>
                      <td className={styles.alignRight}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(col)}
                            title="Edit Collection"
                            style={{
                              padding: '5px 8px',
                              background: '#F4F4F5',
                              border: '1px solid #E4E4E7',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.75rem',
                              color: '#18181B',
                            }}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(col)}
                            title={col.isActive ? 'Deactivate' : 'Publish'}
                            style={{
                              padding: '5px 8px',
                              background: col.isActive ? '#FEF2F2' : '#F0FDF4',
                              border: `1px solid ${col.isActive ? '#FCA5A5' : '#86EFAC'}`,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              color: col.isActive ? '#DC2626' : '#16A34A',
                            }}
                          >
                            <Power size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(col)}
                            title="Delete Collection"
                            style={{
                              padding: '5px 8px',
                              background: '#FFFFFF',
                              border: '1px solid #E4E4E7',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#71717A',
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD COLLECTION MODAL */}
      {/* ========================================================= */}
      {isAddOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#0A0A0A" />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Add New Collection</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  COLLECTION TITLE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Summer Capsule Drop"
                  value={addTitle}
                  onChange={(e) => {
                    setAddTitle(e.target.value);
                    if (!addSlug || addSlug === addTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
                      setAddSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                    }
                  }}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    SLUG IDENTIFIER *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="summer-capsule"
                    value={addSlug}
                    onChange={(e) => setAddSlug(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    TAGLINE
                  </label>
                  <input
                    type="text"
                    placeholder="CAPSULE 02 / LIMITED DROP"
                    value={addTagline}
                    onChange={(e) => setAddTagline(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  COVER IMAGE URL
                </label>
                <input
                  type="text"
                  value={addCover}
                  onChange={(e) => setAddCover(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                />
              </div>

              {/* Department Checkboxes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                  VALID DEPARTMENTS *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', background: '#F4F4F5', padding: '10px', borderRadius: '6px' }}>
                  {ALL_DEPARTMENTS.map((dept) => {
                    const isChecked = addDepts.includes(dept);
                    return (
                      <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAddDepts([...addDepts, dept]);
                            } else {
                              setAddDepts(addDepts.filter((d) => d !== dept));
                            }
                          }}
                        />
                        <span>{dept === 'MEN' ? 'Men' : dept === 'WOMEN' ? 'Women' : dept === 'UNISEX' ? 'Unisex' : 'Accessories'}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  placeholder="Editorial lookbook and capsule description..."
                  value={addDesc}
                  onChange={(e) => setAddDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={addActive}
                    onChange={(e) => setAddActive(e.target.checked)}
                  />
                  <span>Published & Active</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={addFeatured}
                    onChange={(e) => setAddFeatured(e.target.checked)}
                  />
                  <span>Featured on Homepage</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  style={{ padding: '8px 16px', fontSize: '0.75rem', background: '#F4F4F5', border: '1px solid #D4D4D8', borderRadius: '4px', cursor: 'pointer' }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#0A0A0A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSubmittingAdd ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmittingAdd ? 'CREATING...' : 'SAVE COLLECTION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT COLLECTION MODAL */}
      {/* ========================================================= */}
      {editingCol && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Edit Collection</h2>
                <span style={{ fontSize: '0.75rem', color: '#71717A' }}>
                  Slug: {editingCol.slug} • {editingCol.productCount} products in capsule
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingCol(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  COLLECTION TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    SLUG
                  </label>
                  <input
                    type="text"
                    required
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    TAGLINE
                  </label>
                  <input
                    type="text"
                    value={editTagline}
                    onChange={(e) => setEditTagline(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  COVER IMAGE URL
                </label>
                <input
                  type="text"
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                />
              </div>

              {/* Department Checkboxes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                  VALID DEPARTMENTS *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', background: '#F4F4F5', padding: '10px', borderRadius: '6px' }}>
                  {ALL_DEPARTMENTS.map((dept) => {
                    const isChecked = editDepts.includes(dept);
                    return (
                      <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditDepts([...editDepts, dept]);
                            } else {
                              setEditDepts(editDepts.filter((d) => d !== dept));
                            }
                          }}
                        />
                        <span>{dept === 'MEN' ? 'Men' : dept === 'WOMEN' ? 'Women' : dept === 'UNISEX' ? 'Unisex' : 'Accessories'}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  DESCRIPTION
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                  />
                  <span>Published & Active</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                  />
                  <span>Featured on Homepage</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCol(null)}
                  style={{ padding: '8px 16px', fontSize: '0.75rem', background: '#F4F4F5', border: '1px solid #D4D4D8', borderRadius: '4px', cursor: 'pointer' }}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#0A0A0A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isSubmittingEdit ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmittingEdit ? 'SAVING...' : 'UPDATE COLLECTION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
