import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import styles from './BrandStorySection.module.css';

interface BrandStoryProps {
  title?: string;
  paragraphs?: string[];
  ctaText?: string;
  ctaLink?: string;
}

export const BrandStorySection: React.FC<BrandStoryProps> = ({
  title = 'INDIVIDUALITY BY DESIGN.',
  paragraphs = [
    'Aveez Fashion was conceived around a clear philosophy: everyday clothing should feel intentional, substantial, and effortlessly unique.',
    'Rather than following rapid disposable trends, our focus remains on thoughtful garment construction. We curate luxury heavyweight fabrics, engineer boxy drop-shoulder proportions, and obsess over fabric textures that wear better over time.',
    'Built for those who appreciate confident minimalism and personal style.',
  ],
  ctaText = 'OUR STORY',
  ctaLink = '/about',
}) => {
  return (
    <section className={`container ${styles.section}`} aria-label="Brand Philosophy">
      <div className={styles.wrapper}>
        <div className={styles.monogram}>
          <Logo variant="monogram" height={48} />
        </div>

        <span className={styles.sectionSubtitle}>PHILOSOPHY & PURPOSE</span>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.textBlock}>
          {paragraphs.map((p, idx) => (
            <p key={idx} className={styles.paragraph}>
              {p}
            </p>
          ))}
        </div>

        <div className={styles.ctaWrapper}>
          <Link href={ctaLink}>
            <Button variant="outline" size="md">
              {ctaText}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
