import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogs, getAllBlogCategories } from '@/data/blogs';
import { BlogListingClient } from './BlogListingClient';
import styles from './blog.module.css';

export const metadata: Metadata = {
  title: 'Fashion Journal & Editorial — Luxury Streetwear',
  description:
    'Explore the Aveez Fashion Journal: insights on luxury Indian streetwear, 280+ GSM heavyweight natural textiles, architectural silhouettes, and contemporary styling guides.',
  keywords: [
    'aveez fashion blog',
    'luxury streetwear india',
    'heavyweight t-shirt guide',
    'indian streetwear brands',
    'oversized t shirts styling',
    'contemporary clothing brand india',
    '280 gsm cotton',
    '450 gsm hoodie',
  ],
  alternates: {
    canonical: 'https://aveezfashion.com/blog',
  },
  openGraph: {
    title: 'Fashion Journal & Editorial | Aveez Fashion — Luxury Streetwear',
    description:
      'Explore the Aveez Fashion Journal: insights on luxury Indian streetwear, 280+ GSM heavyweight natural textiles, architectural silhouettes, and contemporary styling guides.',
    url: 'https://aveezfashion.com/blog',
    siteName: 'AVEEZ FASHION',
    type: 'website',
    images: [
      {
        url: '/api/media/campaigns/signature.webp',
        width: 1200,
        height: 630,
        alt: 'Aveez Fashion Journal & Editorial Atelier',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fashion Journal & Editorial | Aveez Fashion',
    description:
      'Explore the Aveez Fashion Journal: insights on luxury Indian streetwear, 280+ GSM heavyweight textiles, and architectural silhouettes.',
    images: ['/api/media/campaigns/signature.webp'],
  },
};

export default function BlogIndexPage() {
  const posts = getAllBlogs();
  const categories = getAllBlogCategories();

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Aveez Fashion Journal & Editorial',
    description:
      'Perspectives on luxury streetwear, architectural silhouettes, heavyweight natural textiles, and contemporary Indian fashion culture.',
    url: 'https://aveezfashion.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'AVEEZ FASHION',
      url: 'https://aveezfashion.com',
      logo: 'https://aveezfashion.com/brand/av-monogram.svg',
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      url: `https://aveezfashion.com/blog/${post.slug}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      image: `https://aveezfashion.com${post.coverImage}`,
      author: {
        '@type': 'Person',
        name: post.author.name,
      },
    })),
  };

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://aveezfashion.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Editorial Journal',
        item: 'https://aveezfashion.com/blog',
      },
    ],
  };

  return (
    <div className={styles.blogPage}>
      {/* Structured JSON-LD Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />

      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
          <ol className={styles.breadcrumbList}>
            <li>
              <Link href="/" className={styles.breadcrumbLink}>
                Home
              </Link>
            </li>
            <li className={styles.breadcrumbSeparator} aria-hidden="true">
              /
            </li>
            <li className={styles.breadcrumbCurrent} aria-current="page">
              Journal & Editorial
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <header className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.editorialKicker}>
              <span className={styles.kickerDot} />
              <span>THE AVEEZ JOURNAL</span>
            </div>
            <h1 className={styles.heroTitle}>Perspectives, Craft & Silhouettes</h1>
            <p className={styles.heroDescription}>
              Exploring the convergence of heavyweight natural textiles, architectural cuts, and
              the burgeoning luxury streetwear culture in India. Designed for the discerning aesthetic citizen.
            </p>
          </div>
        </header>

        {/* Interactive Listing Client */}
        <BlogListingClient posts={posts} categories={categories} />

        {/* Brand Value Pillars Strip for E-E-A-T and SEO */}
        <section className={styles.valueStrip} aria-label="Aveez Standards">
          <div className={styles.valueGrid}>
            <div className={styles.valueItem}>
              <span className={styles.valueKicker}>TEXTILE SPECIFICATION</span>
              <h3 className={styles.valueTitle}>280–450 GSM Heavyweight</h3>
              <p className={styles.valueDesc}>
                100% compact combed ringspun cotton engineered for sculptural, zero-translucency drape.
              </p>
            </div>

            <div className={styles.valueItem}>
              <span className={styles.valueKicker}>SILHOUETTE MASTERY</span>
              <h3 className={styles.valueTitle}>Architectural Boxy Cuts</h3>
              <p className={styles.valueDesc}>
                Calculated drop shoulders and high-recovery ribbed necklines crafted to hold form over years.
              </p>
            </div>

            <div className={styles.valueItem}>
              <span className={styles.valueKicker}>PROVENANCE</span>
              <h3 className={styles.valueTitle}>Handcrafted in India</h3>
              <p className={styles.valueDesc}>
                Celebrating India’s rich textile heritage through modern, small-batch luxury tailoring.
              </p>
            </div>

            <div className={styles.valueItem}>
              <span className={styles.valueKicker}>CURATION</span>
              <h3 className={styles.valueTitle}>Limited Capsule Drops</h3>
              <p className={styles.valueDesc}>
                Slow-fashion releases designed to eliminate landfill waste and preserve exclusivity.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
