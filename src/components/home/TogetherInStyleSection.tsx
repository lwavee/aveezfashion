import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './TogetherInStyleSection.module.css';

interface StyleCard {
  id: string;
  title: string;
  category: string;
  image: string;
  link: string;
  objectPosition?: string;
}

const TOGETHER_STYLES: StyleCard[] = [
  {
    id: 'royal-pair',
    title: 'ROYAL PAIR',
    category: 'Poshak & Kurta Pajama',
    image: '/images/TOGETHER/royalpair.png',
    link: '/shop?search=royal',
    objectPosition: 'center 15%',
  },
  {
    id: 'sport-together',
    title: 'SPORT TOGETHER',
    category: 'Matching Sportswear',
    image: '/images/TOGETHER/sport.png',
    link: '/shop?search=sport',
    objectPosition: 'center 15%',
  },
  {
    id: 'night-in',
    title: 'NIGHT IN',
    category: 'Matching Nightwear',
    image: '/images/TOGETHER/nightin.png',
    link: '/shop?search=nightwear',
    objectPosition: 'center 15%',
  },
  {
    id: 'made-for-two',
    title: 'MADE FOR TWO',
    category: 'Couple T-Shirts',
    image: '/images/TOGETHER/madefor2.png',
    link: '/shop?search=couple',
    objectPosition: 'center 15%',
  },
];

export const TogetherInStyleSection: React.FC = () => {
  return (
    <section className={`container ${styles.section}`} aria-label="Together In Style — Men × Women Matching Styles">
      <div className={styles.header}>
        <div className={styles.eyebrowRow}>
          <span className={styles.eyebrowLine} aria-hidden="true" />
          <span className={styles.eyebrow}>THE AVEEZ COLLECTION</span>
          <span className={styles.eyebrowLine} aria-hidden="true" />
        </div>
        <h2 className={styles.title}>TOGETHER IN STYLE</h2>
        <p className={styles.subtitle}>Two styles. One connection.</p>
      </div>

      <div className={styles.grid}>
        {TOGETHER_STYLES.map((item, idx) => (
          <Link
            key={item.id}
            href={item.link}
            className={styles.card}
            aria-label={`${item.title} — ${item.category}`}
          >
            <div className={styles.imageWrapper}>
              <Image
                src={item.image}
                alt={`${item.title} — ${item.category}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                priority={idx < 2}
                style={{ objectPosition: item.objectPosition || 'center center' }}
                className={styles.image}
              />
              <div className={styles.overlay} />
            </div>

            <div className={styles.content}>
              <span className={styles.categoryLabel}>{item.category}</span>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <span className={styles.exploreLink}>
                EXPLORE COLLECTION <span className={styles.arrow} aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
