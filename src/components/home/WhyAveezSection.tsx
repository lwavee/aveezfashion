import React from 'react';
import { Layers, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';
import styles from './WhyAveezSection.module.css';

export const WhyAveezSection: React.FC = () => {
  const pillars = [
    {
      icon: <Layers size={28} strokeWidth={1.5} />,
      title: 'CURATED STYLE',
      description:
        'Every silhouette is carefully chosen with intentional cuts, avoiding disposable mass-market trends.',
    },
    {
      icon: <Sparkles size={28} strokeWidth={1.5} />,
      title: 'QUALITY FOCUS',
      description:
        'Substantial 280–450 GSM combed cottons and premium blends selected for durability, drape, and comfort.',
    },
    {
      icon: <UserCheck size={28} strokeWidth={1.5} />,
      title: 'INDIVIDUALITY',
      description:
        'Understated, logo-minimal designs created for people who define their own aesthetic identity.',
    },
    {
      icon: <ShieldCheck size={28} strokeWidth={1.5} />,
      title: 'CUSTOMER FIRST',
      description:
        'Transparent sizing guides, safe UPI & card payments, and dedicated customer support across India.',
    },
  ];

  return (
    <section className={styles.section} aria-label="Why Choose Aveez Fashion">
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <span className={styles.sectionSubtitle}>THE AVEEZ STANDARD</span>
          <h2 className={styles.sectionTitle}>WHY AVEEZ</h2>
        </div>

        <div className={styles.grid}>
          {pillars.map((pillar, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.iconWrapper}>{pillar.icon}</div>
              <h3 className={styles.cardTitle}>{pillar.title}</h3>
              <p className={styles.cardDesc}>{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
