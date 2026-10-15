import React from 'react';
import { CatalogService } from '@/server/services/catalogService';
import { FolderTree, Tag, CheckCircle2 } from 'lucide-react';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await CatalogService.getCategories();

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.titleStack}>
          <h1 className={styles.pageTitle}>Categories</h1>
          <p className={styles.pageSubtitle}>
            Manage storefront taxonomy, department categories, and accessories navigation.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <FolderTree size={16} className={styles.sectionHeaderIcon} />
            <h2 className={styles.cardTitle}>Storefront Categories</h2>
            <span className={styles.cardBadge}>{categories.length} active categories</span>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Category Name</th>
                  <th scope="col">Slug Identifier</th>
                  <th scope="col">Description</th>
                  <th scope="col">Display Order</th>
                  <th scope="col" className={styles.alignRight}>Status</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => (
                  <tr key={cat._id || cat.slug}>
                    <td>
                      <div className={styles.inventoryItemCell}>
                        <span className={styles.inventoryTitle}>{cat.name}</span>
                        {cat.slug === 'accessories' && (
                          <span className={styles.inventoryMeta}>The Finishing Touch</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.75rem', background: '#F4F4F5', padding: '2px 6px', borderRadius: '4px' }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td className={styles.itemsSummaryCell}>
                      {cat.description || 'No description provided.'}
                    </td>
                    <td style={{ fontWeight: 600, color: '#52525B' }}>
                      #{cat.displayOrder || idx + 1}
                    </td>
                    <td className={styles.alignRight}>
                      <span className={`${styles.statusBadge} ${styles.statusPaid}`}>
                        <CheckCircle2 size={11} style={{ marginRight: '4px' }} />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
