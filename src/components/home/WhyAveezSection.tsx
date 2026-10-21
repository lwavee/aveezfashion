'use client';

import React from 'react';
import Image from 'next/image';
import styles from './WhyAveezSection.module.css';

interface Pillar {
  number: string;
  verticalLabel: string;
  image: string;
  alt: string;
  title: string;
  description: string;
}

export const WhyAveezSection: React.FC = () => {
  const pillars: Pillar[] = [
    {
      number: '01',
      verticalLabel: 'STYLE —',
      image: '/images/why-aveez/arch-style.jpg',
      alt: 'Aveez curated heavyweight hoodies and sweatshirts on atelier rack',
      title: 'CURATED STYLE',
      description:
        'Every silhouette is carefully chosen with intentional cuts, avoiding disposable mass-market trends.',
    },
    {
      number: '02',
      verticalLabel: 'QUALITY —',
      image: '/images/why-aveez/arch-quality.jpg',
      alt: 'Aveez Fashion woven label on substantial luxury cotton knit fabric',
      title: 'QUALITY FOCUS',
      description:
        'Substantial 280–450 GSM combed cottons and premium blends selected for durability, drape, and comfort.',
    },
    {
      number: '03',
      verticalLabel: 'INDIVIDUALITY —',
      image: '/images/why-aveez/arch-individuality.jpg',
      alt: 'Atelier moodboard with Aveez A More You hardbound volumes and florals',
      title: 'INDIVIDUALITY',
      description:
        'Understated, logo-minimal designs created for people who define their own aesthetic identity.',
    },
    {
      number: '04',
      verticalLabel: 'CUSTOMER —',
      image: '/images/why-aveez/arch-customer.jpg',
      alt: 'Unboxing experience featuring Aveez monogram card and handwritten note',
      title: 'CUSTOMER FIRST',
      description:
        'Transparent sizing guides, safe UPI & card payments, and dedicated customer support across India.',
    },
  ];

  return (
    <section className={styles.section} aria-label="Why Choose Aveez Fashion — The Aveez Standard">
      {/* Decorative Side Textures from Mockup */}
      <div className={styles.leftTexture} aria-hidden="true" />
      <div className={styles.rightTexture} aria-hidden="true" />

      <div className={`container ${styles.container}`}>
        {/* Section Header with Refined Luxury Editorial Typography */}
        <div className={styles.header}>
          <span className={styles.kicker}>THE AVEEZ STANDARD</span>
          <div className={styles.kickerLine} aria-hidden="true" />
          
          <h2 className={styles.title}>
            <span className={styles.titleWhy}>WHY</span>{' '}
            <span className={styles.titleAveez}>AVEEZ</span>
          </h2>
          
          <p className={styles.subtitle}>
            Thoughtful designs, better materials and a more meaningful shopping experience —
            because style should feel good, in every way.
          </p>
        </div>

        {/* Connecting Artistic Spline with Sparkles and Nodes */}
        <div className={styles.waveWrapper} aria-hidden="true">
          <svg
            className={styles.waveSvg}
            viewBox="0 0 1000 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M 10 25 Q 140 10, 240 32 T 490 22 T 740 34 T 990 20"
              stroke="#D4C9BD"
              strokeWidth="1.2"
              strokeDasharray="2.5 3.5"
              opacity="0.8"
            />
            {/* Delicate Connecting Nodes */}
            <circle cx="120" cy="18" r="2.5" fill="#B5997A" />
            <circle cx="370" cy="28" r="2.5" fill="#B5997A" />
            <circle cx="620" cy="27" r="2.5" fill="#B5997A" />
            <circle cx="870" cy="27" r="2.5" fill="#B5997A" />

            {/* Sparkle Stars (✦) */}
            <path
              d="M 230 14 Q 230 18, 226 18 Q 230 18, 230 22 Q 230 18, 234 18 Q 230 18, 230 14 Z"
              fill="#B5997A"
              opacity="0.85"
            />
            <path
              d="M 710 14 Q 710 18, 706 18 Q 710 18, 710 22 Q 710 18, 714 18 Q 710 18, 710 14 Z"
              fill="#B5997A"
              opacity="0.85"
            />
          </svg>
        </div>

        {/* 4 Architectural Arched Pillars */}
        <div className={styles.pillarsGrid}>
          {pillars.map((pillar) => (
            <article key={pillar.number} className={styles.pillarCard}>
              {/* Outer arch column with vertical category label on the left */}
              <div className={styles.archRow}>
                <span className={styles.verticalLabel} aria-hidden="true">
                  {pillar.verticalLabel}
                </span>

                <div className={styles.archFrame}>
                  <div className={styles.imageContainer}>
                    <Image
                      src={pillar.image}
                      alt={pillar.alt}
                      fill
                      sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 22vw"
                      className={styles.archImage}
                      priority={true}
                    />
                    <div className={styles.bottomFadeOverlay} aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Typography block: Large Serif Italic Number, Title, Description */}
              <div className={styles.contentBlock}>
                <span className={styles.number}>{pillar.number}</span>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarDesc}>{pillar.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
