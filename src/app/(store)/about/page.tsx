import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About Aveez Fashion | Contemporary Clothing & Personal Style',
  description:
    'Discover Aveez Fashion, a contemporary clothing brand focused on individual style, modern essentials and coordinated looks for everyday expression.',
  alternates: {
    canonical: 'https://aveezfashion.com/about',
  },
  openGraph: {
    title: 'About Aveez Fashion | Contemporary Clothing & Personal Style',
    description:
      'Discover Aveez Fashion, a contemporary clothing brand focused on individual style, modern essentials and coordinated looks for everyday expression.',
    url: 'https://aveezfashion.com/about',
    siteName: 'AVEEZ FASHION',
    type: 'website',
    images: [
      {
        url: '/images/signature.png',
        width: 1536,
        height: 1024,
        alt: 'Aveez Fashion Brand Story & Editorial Manifesto',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Aveez Fashion | Contemporary Clothing & Personal Style',
    description:
      'Discover Aveez Fashion, a contemporary clothing brand focused on individual style, modern essentials and coordinated looks for everyday expression.',
    images: ['/images/signature.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Aveez Fashion',
  description:
    'Discover Aveez Fashion, a contemporary clothing brand focused on individual style, modern essentials and coordinated looks for everyday expression.',
  url: 'https://aveezfashion.com/about',
  mainEntity: {
    '@type': 'ClothingStore',
    name: 'AVEEZ FASHION',
    url: 'https://aveezfashion.com',
    logo: 'https://aveezfashion.com/brand/av-monogram.svg',
    sameAs: ['https://www.instagram.com/aveezfashion/'],
  },
};

export default function AboutPage() {
  const instagramReels = [
    {
      id: 'reel-1',
      image: '/images/reels/reel-1.jpg',
      alt: 'Aveez Fashion Couple Matching Look',
      label: 'REEL 01',
      url: 'https://www.instagram.com/reel/DQWqjskjfnQ/',
    },
    {
      id: 'reel-4',
      image: '/images/reels/reel-4.jpg',
      alt: 'Aveez Fashion Handcrafted Floral Suit',
      label: 'REEL 02',
      url: 'https://www.instagram.com/reel/DQMXQ4NCSLE/',
    },
    {
      id: 'reel-2',
      image: '/images/reels/reel-2.jpg',
      alt: 'Aveez Fashion Embroidered Anarkali Ensemble',
      label: 'REEL 03',
      url: 'https://www.instagram.com/reel/DQUDXawif0G/',
    },
    {
      id: 'reel-3',
      image: '/images/reels/reel-3.jpg',
      alt: 'Aveez Fashion Daylight Printed Casual Kurti',
      label: 'REEL 04',
      url: 'https://www.instagram.com/reel/DQO-GifiWQd/',
    },
  ];

  return (
    <article className={styles.pageWrapper}>
      {/* Structured Data for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ==================================================
          1. HERO — THE AVEEZ MANIFESTO
          ================================================== */}
      <section className={styles.heroSection} aria-label="The Aveez Manifesto">
        <div className="container">
          <header className={styles.heroHeader}>
            <span className={styles.eyebrow}>THE AVEEZ MANIFESTO</span>
            <h1 className={styles.heroTitle}>WEAR DIFFERENT.</h1>
            <p className={styles.heroSubtitle}>Style is personal. Make it yours.</p>
          </header>

          <div className={styles.heroImageContainer}>
            <Image
              src="/images/signature.png"
              alt="Aveez Fashion Brand Editorial Campaign featuring contemporary menswear styling in architectural light"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1400px) 90vw, 1360px"
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>

      {/* ==================================================
          2. BRAND STORY — MORE THAN WHAT YOU WEAR
          ================================================== */}
      <section className={styles.storySection} aria-label="Our Point of View">
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyContent}>
              <span className={styles.eyebrow}>OUR POINT OF VIEW</span>
              <h2 className={styles.sectionHeading}>MORE THAN WHAT YOU WEAR.</h2>

              <p className={styles.storyParagraph}>
                Aveez Fashion is built around the idea that personal style should feel
                like your own. We bring together contemporary silhouettes, thoughtful design
                and everyday versatility to help you express who you are — without needing
                to follow every trend.
              </p>

              <p className={styles.storyParagraph}>
                From everyday essentials to statement pieces and coordinated styles, our vision
                is to make getting dressed feel personal, confident and effortless.
              </p>
            </div>

            <div className={styles.storyImageCard}>
              <Image
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?q=85&w=1000&auto=format&fit=crop"
                alt="Contemporary fashion styling reflecting individual expression and considered design"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.storyImage}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. BRAND PHILOSOPHY — DESIGNED WITH INTENTION
          ================================================== */}
      <section
        className={styles.philosophySection}
        aria-label="Our Design Principles"
      >
        <div className="container">
          <div className={styles.philosophyHeader}>
            <span className={styles.eyebrow}>BRAND PHILOSOPHY</span>
            <h2 className={styles.sectionHeading}>DESIGNED WITH INTENTION.</h2>
          </div>

          <div className={styles.principlesGrid}>
            <div className={styles.principleColumn}>
              <span className={styles.principleNumber}>01</span>
              <h3 className={styles.principleTitle}>Individuality</h3>
              <p className={styles.principleDesc}>
                Your style should reflect you, not just the latest trend.
              </p>
            </div>

            <div className={styles.principleColumn}>
              <span className={styles.principleNumber}>02</span>
              <h3 className={styles.principleTitle}>Everyday Versatility</h3>
              <p className={styles.principleDesc}>
                Pieces designed to fit naturally into your everyday wardrobe.
              </p>
            </div>

            <div className={styles.principleColumn}>
              <span className={styles.principleNumber}>03</span>
              <h3 className={styles.principleTitle}>Modern Expression</h3>
              <p className={styles.principleDesc}>
                Contemporary silhouettes with room for your own interpretation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. THE AVEEZ STYLE EDIT — FASHION VISUALS
          ================================================== */}
      <section className={styles.styleEditSection} aria-label="Fashion Visuals">
        <div className="container">
          <div className={styles.styleEditHeader}>
            <div>
              <span className={styles.eyebrow}>THE AVEEZ STYLE EDIT</span>
              <h2 className={styles.sectionHeading}>A DIFFERENT POINT OF VIEW.</h2>
            </div>

            <Link href="/shop" className={styles.editorialLink}>
              <span>EXPLORE ALL PIECES</span>
              <span className={styles.linkArrow} aria-hidden="true">→</span>
            </Link>
          </div>

          <div className={styles.galleryCollage}>
            <div className={`${styles.collageCard} ${styles.collageDominant}`}>
              <Image
                src="/images/heroimage1.png"
                alt="Contemporary streetwear styling from the Aveez collection"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className={styles.collageImage}
                style={{ objectPosition: 'center 25%' }}
              />
              <span className={styles.collageCaption}>CONTEMPORARY STREETWEAR</span>
            </div>

            <div className={`${styles.collageCard} ${styles.collageItem2}`}>
              <Image
                src="/images/heroimage2.png"
                alt="Relaxed everyday essentials designed for personal expression"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className={styles.collageImage}
                style={{ objectPosition: 'center 30%' }}
              />
              <span className={styles.collageCaption}>EVERYDAY ESSENTIALS</span>
            </div>

            <div className={`${styles.collageCard} ${styles.collageItem3}`}>
              <Image
                src="/images/TOGETHER/royalpair.png"
                alt="Coordinated couple outfits celebrating mutual style"
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                className={styles.collageImage}
                style={{ objectPosition: 'center 15%' }}
              />
              <span className={styles.collageCaption}>COORDINATED LOOKS</span>
            </div>

            <div className={`${styles.collageCard} ${styles.collageItem4}`}>
              <Image
                src="/images/heroimage3.png"
                alt="Statement silhouette and tailored details"
                fill
                sizes="(max-width: 640px) 100vw, 25vw"
                className={styles.collageImage}
                style={{ objectPosition: 'center 25%' }}
              />
              <span className={styles.collageCaption}>STATEMENT SILHOUETTES</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. MEN × WOMEN MATCHING STYLES CONNECTION
          ================================================== */}
      <section
        className={styles.matchingSection}
        aria-label="Men and Women Matching Styles"
      >
        <div className="container">
          <div className={styles.matchingGrid}>
            <div className={styles.matchingImageCard}>
              <Image
                src="/images/TOGETHER/madefor2.png"
                alt="Men and Women Matching Styles by Aveez Fashion"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.matchingImage}
              />
            </div>

            <div className={styles.matchingContent}>
              <span className={styles.eyebrow}>COORDINATED CAPSULE</span>
              <h2 className={styles.sectionHeading}>BETTER TOGETHER. NEVER IDENTICAL.</h2>
              <p className={styles.matchingDesc}>
                Coordinated looks for two individual styles. Designed with balanced
                colorways and relaxed proportions that complement each other naturally
                without sacrificing your own point of view.
              </p>

              <div>
                <Link href="/shop?search=couple">
                  <Button variant="primary" size="md">
                    EXPLORE MATCHING STYLES
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. BRAND STATEMENT — FULL-WIDTH EDITORIAL MOMENT
          ================================================== */}
      <section
        className={styles.statementSection}
        aria-label="The Aveez Signature Statement"
      >
        <div className={styles.statementBg} aria-hidden="true">
          <Image
            src="/images/signature.png"
            alt=""
            fill
            sizes="100vw"
            className={styles.statementBgImage}
          />
          <div className={styles.statementOverlay} />
        </div>

        <div className={`container ${styles.statementContainer}`}>
          <div className={styles.statementBlock}>
            <span className={`${styles.eyebrow} ${styles.statementEyebrow}`}>
              THE AVEEZ SIGNATURE
            </span>
            <h2 className={styles.statementHeading}>NOT MADE TO BLEND IN.</h2>
            <div className={styles.statementDivider} aria-hidden="true" />
            <p className={styles.statementCopy}>
              Distinctive style. Individual expression. A different point of view.
            </p>

            <Link href="/collections/aveez-originals" className={styles.statementCta}>
              <span>EXPLORE THE COLLECTION</span>
              <span className={styles.statementArrow} aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================
          7. INSTAGRAM INTEGRATION — OFFICIAL BRAND PROFILE
          ================================================== */}
      <section
        className={styles.instagramSection}
        aria-label="Follow the Aveez Perspective"
      >
        <div className="container">
          <div className={styles.instagramHeader}>
            <div>
              <span className={styles.eyebrow}>FOLLOW THE AVEEZ PERSPECTIVE</span>
              <h2 className={styles.sectionHeading}>STYLE DOESN'T STOP HERE.</h2>
              <p className={styles.storyParagraph}>
                Discover new looks, styling inspiration and the world of Aveez Fashion.
              </p>
            </div>

            <a
              href="https://www.instagram.com/aveezfashion/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.editorialLink}
              aria-label="Follow @aveezfashion on Instagram (opens in a new tab)"
            >
              <Instagram size={15} strokeWidth={1.8} aria-hidden="true" />
              <span>FOLLOW US ON INSTAGRAM</span>
              <span className={styles.linkArrow} aria-hidden="true">↗</span>
            </a>
          </div>

          <div className={styles.instagramGrid}>
            {instagramReels.map((reel) => (
              <a
                key={reel.id}
                href={reel.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.instagramCard}
                aria-label={`Watch ${reel.label} on Instagram (opens in a new tab)`}
              >
                <Image
                  src={reel.image}
                  alt={reel.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 320px"
                  className={styles.instagramCardImage}
                />
                <span className={styles.instagramBadge}>{reel.label}</span>
                <span className={styles.instagramIcon} aria-hidden="true">
                  <Instagram size={14} strokeWidth={1.8} />
                </span>
                <div className={styles.instagramPrompt} aria-hidden="true">
                  <span>WATCH REEL ↗</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          8. FINAL CTA — FIND YOUR OWN POINT OF VIEW
          ================================================== */}
      <section className={styles.finalCtaSection} aria-label="Explore Aveez Fashion">
        <div className="container">
          <div className={styles.finalCtaContent}>
            <span className={styles.eyebrow}>THE COLLECTION</span>
            <h2 className={styles.finalHeading}>FIND YOUR OWN POINT OF VIEW.</h2>
            <p className={styles.finalSub}>Explore the pieces that fit your style.</p>

            <Link href="/shop">
              <Button variant="primary" size="lg">
                SHOP AVEEZ FASHION
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
