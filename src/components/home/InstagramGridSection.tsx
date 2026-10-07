import React from 'react';
import Image from 'next/image';
import { Instagram } from 'lucide-react';
import styles from './InstagramGridSection.module.css';

export const InstagramGridSection: React.FC = () => {
  const posts = [
    {
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=600&auto=format&fit=crop',
      alt: 'Aveez Fashion Editorial Campaign Look 01',
    },
    {
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
      alt: 'Aveez Fashion Editorial Campaign Look 02',
    },
    {
      image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop',
      alt: 'Aveez Fashion Editorial Campaign Look 03',
    },
    {
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop',
      alt: 'Aveez Fashion Editorial Campaign Look 04',
    },
  ];

  return (
    <section className={`container ${styles.section}`} aria-label="Community & Social Showcase">
      <div className={styles.header}>
        <span className={styles.sectionSubtitle}>COMMUNITY & EDITORIAL</span>
        <h2 className={styles.sectionTitle}>AS SEEN ON THE STREET</h2>
        <a
          href="https://instagram.com/aveezfashion"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.handleLink}
        >
          <Instagram size={18} />
          <span>FOLLOW @AVEEZFASHION</span>
        </a>
      </div>

      <div className={styles.grid}>
        {posts.map((post, idx) => (
          <a
            key={idx}
            href="https://instagram.com/aveezfashion"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.postCard}
          >
            <Image
              src={post.image}
              alt={post.alt}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className={styles.image}
            />
            <div className={styles.overlay}>
              <Instagram size={28} color="var(--color-white-pure)" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
