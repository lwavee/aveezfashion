import React from 'react';
import { CatalogService } from '@/server/services/catalogService';
import { Layers, CheckCircle2 } from 'lucide-react';
import styles from '../admin.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminCollectionsPage() {
  const collections = await CatalogService.getCollections();

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.titleStack}>
          <h1 className={styles.pageTitle}>Collections</h1>
          <p className={styles.pageSubtitle}>
            Curated seasonal drops, editorial capsule collections, and signature edits.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <Layers size={16} className={styles.sectionHeaderIcon} />
            <h2 className={styles.cardTitle}>Curated Collections</h2>
            <span className={styles.cardBadge}>{collections.length} editorial collections</span>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Collection Title</th>
                  <th scope="col">Slug</th>
                  <th scope="col">Editorial Description</th>
                  <th scope="col" className={styles.alignRight}>Status</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((col) => (
                  <tr key={col._id || col.slug}>
                    <td>
                      <span className={styles.inventoryTitle}>{col.title}</span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.75rem', background: '#F4F4F5', padding: '2px 6px', borderRadius: '4px' }}>
                        {col.slug}
                      </code>
                    </td>
                    <td className={styles.itemsSummaryCell}>
                      {col.description || 'Editorial drop.'}
                    </td>
                    <td className={styles.alignRight}>
                      <span className={`${styles.statusBadge} ${styles.statusPaid}`}>
                        <CheckCircle2 size={11} style={{ marginRight: '4px' }} />
                        Published
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
