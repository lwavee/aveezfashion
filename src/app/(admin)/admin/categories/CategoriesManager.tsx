'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Power,
  X,
  AlertCircle,
  RefreshCw,
  Layers,
} from 'lucide-react';
import styles from '../admin.module.css';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  group: string;
  departments: ('MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES')[];
  description?: string;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
}

const ALL_DEPARTMENTS: ('MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES')[] = [
  'MEN',
  'WOMEN',
  'UNISEX',
  'ACCESSORIES',
];

const PRESET_GROUPS = [
  'Tops',
  'Bottoms',
  'Outfits and Ethnic Wear',
  'Ethnic and Festive Wear',
  'Dresses and One-Piece Outfits',
  'Innerwear and Nightwear',
  'Co-ords, Nightwear and Innerwear',
  'Hair Accessories',
  'Charms and Small Accessories',
  'Fashion Essentials',
  'Sets and Gifts',
  'General',
];

export function CategoriesManager() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<'ALL' | 'MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES'>('ALL');

  // Add Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addSlug, setAddSlug] = useState('');
  const [addGroup, setAddGroup] = useState('Tops');
  const [addDepts, setAddDepts] = useState<('MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES')[]>(['MEN']);
  const [addDesc, setAddDesc] = useState('');
  const [addActive, setAddActive] = useState(true);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Edit Modal State
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editGroup, setEditGroup] = useState('');
  const [editDepts, setEditDepts] = useState<('MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES')[]>([]);
  const [editDesc, setEditDesc] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch categories.');
      }
      setCategories(data.data.categories || []);
    } catch (err: any) {
      setError(err.message || 'Error loading categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      alert('Category Name is required.');
      return;
    }
    if (addDepts.length === 0) {
      alert('Please select at least one Department for this category.');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName.trim(),
          slug: addSlug.trim() || undefined,
          group: addGroup.trim() || 'General',
          departments: addDepts,
          description: addDesc.trim(),
          isActive: addActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create category.');
      }

      setIsAddOpen(false);
      setAddName('');
      setAddSlug('');
      setAddDesc('');
      setSuccessMsg(`Category "${data.data.name}" created successfully.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Error creating category.');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCat(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditGroup(cat.group);
    setEditDepts(cat.departments || ['UNISEX']);
    setEditDesc(cat.description || '');
    setEditActive(cat.isActive);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat) return;

    if (!editName.trim()) {
      alert('Category Name is required.');
      return;
    }
    if (editDepts.length === 0) {
      alert('Please select at least one Department.');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const res = await fetch(`/api/admin/categories/${editingCat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          slug: editSlug.trim(),
          group: editGroup.trim() || 'General',
          departments: editDepts,
          description: editDesc.trim(),
          isActive: editActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update category.');
      }

      setEditingCat(null);
      setSuccessMsg(`Category "${editName}" updated successfully.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Error updating category.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleToggleActive = async (cat: CategoryItem) => {
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle status.');
      }
      setSuccessMsg(`Category "${cat.name}" is now ${!cat.isActive ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Error toggling category status.');
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (cat.productCount > 0) {
      alert(
        `Cannot delete "${cat.name}" because ${cat.productCount} product(s) currently depend on it.\n\nTo preserve historical sales and order history, please reassign products or deactivate the category instead.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete category "${cat.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete category.');
      }
      setSuccessMsg(`Category "${cat.name}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Error deleting category.');
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()) ||
        c.group.toLowerCase().includes(search.toLowerCase());

      const matchesDept =
        deptFilter === 'ALL' || (c.departments && c.departments.includes(deptFilter));

      return matchesSearch && matchesDept;
    });
  }, [categories, search, deptFilter]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleStack}>
          <h1 className={styles.pageTitle}>Category Catalog</h1>
          <p className={styles.pageSubtitle}>
            Manage multi-department categorization, group hierarchies, and active storefront taxonomy.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.syncBtn}
            onClick={fetchCategories}
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
            <span>ADD CATEGORY</span>
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

      {/* Filter & Search Bar */}
      <div className={styles.card} style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          {/* Department Filter Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: '#F4F4F5', padding: '3px', borderRadius: '6px' }}>
            {(['ALL', 'MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setDeptFilter(tab)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: deptFilter === tab ? '#0A0A0A' : 'transparent',
                  color: deptFilter === tab ? '#FFFFFF' : '#52525B',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab === 'ALL' ? 'All Departments' : tab === 'MEN' ? 'Men' : tab === 'WOMEN' ? 'Women' : tab === 'UNISEX' ? 'Unisex' : 'Accessories'}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#71717A' }} />
            <input
              type="text"
              placeholder="Search category, slug, or group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                fontSize: '0.8125rem',
                border: '1px solid #E4E4E7',
                borderRadius: '6px',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <FolderTree size={16} className={styles.sectionHeaderIcon} />
            <h2 className={styles.cardTitle}>Taxonomy Hierarchy</h2>
            <span className={styles.cardBadge}>
              {filteredCategories.length} of {categories.length} categories
            </span>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Category & Group</th>
                  <th scope="col">Slug</th>
                  <th scope="col">Departments</th>
                  <th scope="col">Products</th>
                  <th scope="col">Status</th>
                  <th scope="col" className={styles.alignRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#71717A' }}>
                      {loading ? 'Loading catalog categories...' : 'No categories match your filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id || cat.slug}>
                      <td>
                        <div className={styles.inventoryItemCell}>
                          <span className={styles.inventoryTitle}>{cat.name}</span>
                          <span className={styles.inventoryMeta}>{cat.group || 'General'}</span>
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: '0.75rem', background: '#F4F4F5', padding: '2px 6px', borderRadius: '4px' }}>
                          {cat.slug}
                        </code>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {(cat.departments || []).map((dept) => (
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
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: cat.productCount > 0 ? '#0A0A0A' : '#71717A' }}>
                          {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td>
                        {cat.isActive ? (
                          <span className={`${styles.statusBadge} ${styles.statusPaid}`}>
                            <CheckCircle2 size={11} style={{ marginRight: '4px' }} />
                            Active
                          </span>
                        ) : (
                          <span className={`${styles.statusBadge} ${styles.statusRefunded}`}>
                            <XCircle size={11} style={{ marginRight: '4px' }} />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className={styles.alignRight}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            title="Edit Category"
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
                            onClick={() => handleToggleActive(cat)}
                            title={cat.isActive ? 'Deactivate' : 'Activate'}
                            style={{
                              padding: '5px 8px',
                              background: cat.isActive ? '#FEF2F2' : '#F0FDF4',
                              border: `1px solid ${cat.isActive ? '#FCA5A5' : '#86EFAC'}`,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              color: cat.isActive ? '#DC2626' : '#16A34A',
                            }}
                          >
                            <Power size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            title="Delete Category"
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
      {/* ADD CATEGORY MODAL */}
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
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FolderTree size={18} color="#0A0A0A" />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Add New Category</h2>
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
                  CATEGORY NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Linen Shirts"
                  value={addName}
                  onChange={(e) => {
                    setAddName(e.target.value);
                    if (!addSlug || addSlug === addName.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
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
                    placeholder="linen-shirts"
                    value={addSlug}
                    onChange={(e) => setAddSlug(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    CATEGORY GROUP
                  </label>
                  <input
                    type="text"
                    list="add-preset-groups"
                    placeholder="e.g. Tops, Bottoms"
                    value={addGroup}
                    onChange={(e) => setAddGroup(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                  />
                  <datalist id="add-preset-groups">
                    {PRESET_GROUPS.map((g) => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Department Checkboxes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                  ASSOCIATED DEPARTMENTS (Select at least 1) *
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
                  DESCRIPTION (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Editorial description for lookbook and category landing..."
                  value={addDesc}
                  onChange={(e) => setAddDesc(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="add-active"
                  checked={addActive}
                  onChange={(e) => setAddActive(e.target.checked)}
                />
                <label htmlFor="add-active" style={{ fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                  Active (Immediately available in product forms)
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
                  {isSubmittingAdd ? 'CREATING...' : 'SAVE CATEGORY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EDIT CATEGORY MODAL */}
      {/* ========================================================= */}
      {editingCat && (
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
              maxWidth: '520px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Edit Category</h2>
                <span style={{ fontSize: '0.75rem', color: '#71717A' }}>
                  Slug: {editingCat.slug} • {editingCat.productCount} products assigned
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditingCat(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#71717A' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  CATEGORY NAME *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
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
                    CATEGORY GROUP
                  </label>
                  <input
                    type="text"
                    list="edit-preset-groups"
                    value={editGroup}
                    onChange={(e) => setEditGroup(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', fontSize: '0.8125rem', border: '1px solid #D4D4D8', borderRadius: '4px' }}
                  />
                  <datalist id="edit-preset-groups">
                    {PRESET_GROUPS.map((g) => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Department Checkboxes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
                  ASSOCIATED DEPARTMENTS (Multi-Department Support) *
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                />
                <label htmlFor="edit-active" style={{ fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                  Category Active
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
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
                  {isSubmittingEdit ? 'SAVING...' : 'UPDATE CATEGORY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
