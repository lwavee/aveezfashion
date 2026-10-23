import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Calendar, ArrowRight, List, ShoppingBag } from 'lucide-react';
import {
  getAllBlogs,
  getBlogBySlug,
  getRelatedBlogs,
  BLOG_POSTS,
} from '@/data/blogs';
import { BlogDetailClient } from './BlogDetailClient';
import styles from './blogDetail.module.css';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogBySlug(params.slug);

  if (!post) {
    return {
      title: 'Article Not Found | AVEEZ FASHION',
      description: 'The requested journal entry could not be found.',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aveezfashion.com';
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const imageUrl = post.coverImage.startsWith('http')
    ? post.coverImage
    : `${siteUrl}${post.coverImage}`;

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    keywords: post.keywords,
    alternates: {
      canonical: postUrl,
    },
    authors: [{ name: post.author.name }],
    openGraph: {
      type: 'article',
      locale: 'en_IN',
      url: postUrl,
      siteName: 'AVEEZ FASHION',
      title: post.metaTitle,
      description: post.metaDescription,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.coverAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: [imageUrl],
      creator: '@aveezfashion',
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogs(post.slug, 2);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aveezfashion.com';
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const imageUrl = post.coverImage.startsWith('http')
    ? post.coverImage
    : `${siteUrl}${post.coverImage}`;

  // Structured Data 1: BlogPosting
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    image: [imageUrl],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    author: {
      '@type': 'Organization',
      name: post.author.name,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'AVEEZ FASHION',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/brand/av-monogram.svg`,
      },
    },
    keywords: post.keywords.join(', '),
    articleSection: post.category,
  };

  // Structured Data 2: Breadcrumbs
  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Journal & Editorial',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  // Structured Data 3: FAQPage (for Google Rich Snippets)
  const faqSchema =
    post.faqs && post.faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: post.faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        }
      : null;

  return (
    <div className={styles.articlePage}>
      {/* Schema.org Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

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
            <li>
              <Link href="/blog" className={styles.breadcrumbLink}>
                Journal
              </Link>
            </li>
            <li className={styles.breadcrumbSeparator} aria-hidden="true">
              /
            </li>
            <li className={styles.breadcrumbCurrent} aria-current="page">
              {post.title}
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className={styles.articleHeader}>
          <div className={styles.headerMeta}>
            <span className={styles.categoryBadge}>{post.category}</span>
            <span>•</span>
            <span className={styles.metaItem}>
              <Clock size={13} />
              {post.readingTime}
            </span>
            <span>•</span>
            <span className={styles.metaItem}>
              <Calendar size={13} />
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            </span>
          </div>

          <h1 className={styles.articleTitle}>{post.title}</h1>
          <p className={styles.articleExcerpt}>{post.excerpt}</p>

          <div className={styles.authorShareBar}>
            <div className={styles.authorCard}>
              <div className={styles.authorAvatar} />
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{post.author.name}</span>
                <span className={styles.authorRole}>{post.author.role}</span>
              </div>
            </div>

            <BlogDetailClient slug={post.slug} title={post.title} />
          </div>
        </header>

        {/* Featured Cover Image */}
        <div className={styles.coverWrapper}>
          <figure className={styles.coverFigure}>
            <div className={styles.coverImageAspect}>
              <Image
                src={post.coverImage}
                alt={post.coverAlt}
                fill
                priority
                sizes="(max-width: 1100px) 100vw, 1080px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <figcaption className={styles.coverCaption}>
              {post.coverAlt} — Curated by Aveez Fashion Creative Direction.
            </figcaption>
          </figure>
        </div>

        {/* Article Content Layout: Sticky Table of Contents + Article Body */}
        <div className={styles.articleLayout}>
          {/* Table of Contents Sticky Column */}
          {post.toc && post.toc.length > 0 && (
            <aside className={styles.tocSidebar} aria-label="Table of contents">
              <div className={styles.tocHeader}>
                <List size={14} />
                <span>INDEX OF SECTIONS</span>
              </div>
              <ul className={styles.tocList}>
                {post.toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className={styles.tocLink}>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Article Main Body */}
          <article className={styles.articleBody} itemScope itemType="https://schema.org/BlogPosting">
            {/* Intro Lead Paragraphs */}
            <div className={styles.introSection}>
              {post.content.intro.map((p, idx) => (
                <p key={idx} className={styles.introParagraph}>
                  {p}
                </p>
              ))}
            </div>

            {/* In-depth Sections */}
            {post.content.sections.map((section) => (
              <section key={section.id} id={section.id} className={styles.contentSection}>
                <h2 className={styles.sectionHeading}>{section.heading}</h2>
                {section.subheading && (
                  <p className={styles.sectionSubheading}>{section.subheading}</p>
                )}

                {section.paragraphs.map((para, pIdx) => (
                  <p key={pIdx} className={styles.sectionParagraph}>
                    {para}
                  </p>
                ))}

                {/* Optional Pull Quote */}
                {section.quote && (
                  <blockquote className={styles.pullQuote}>
                    <p className={styles.quoteText}>&ldquo;{section.quote.text}&rdquo;</p>
                    <cite className={styles.quoteAuthor}>— {section.quote.author}</cite>
                  </blockquote>
                )}

                {/* Optional Specification Callout */}
                {section.callout && (
                  <div className={styles.calloutBox}>
                    <div className={styles.calloutTitle}>
                      <span style={{ color: 'var(--color-white-pure)' }}>◆</span>
                      <span>{section.callout.title}</span>
                    </div>
                    <ul className={styles.calloutList}>
                      {section.callout.items.map((item, iIdx) => (
                        <li key={iIdx} className={styles.calloutItem}>
                          <span className={styles.calloutBullet}>✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Optional Inline Figure */}
                {section.image && (
                  <div className={styles.inlineImageWrapper}>
                    <figure className={styles.inlineFigure}>
                      <Image
                        src={section.image.url}
                        alt={section.image.alt}
                        fill
                        sizes="(max-width: 900px) 100vw, 760px"
                        style={{ objectFit: 'cover' }}
                      />
                    </figure>
                    {section.image.caption && (
                      <figcaption className={styles.inlineCaption}>
                        {section.image.caption}
                      </figcaption>
                    )}
                  </div>
                )}
              </section>
            ))}

            {/* Conclusion Block */}
            <div className={styles.conclusionBox}>
              <h3 className={styles.conclusionHeading}>{post.content.conclusion.heading}</h3>
              {post.content.conclusion.paragraphs.map((p, cIdx) => (
                <p key={cIdx} className={styles.sectionParagraph}>
                  {p}
                </p>
              ))}
            </div>

            {/* Recommended Products: Shop The Look */}
            {post.content.recommendedProducts && (
              <section className={styles.recommendedSection} aria-label="Curated Pieces Mentioned">
                <div className={styles.recommendedTitle}>CURATED EDITORIAL PIECES</div>
                <div className={styles.productsGrid}>
                  {post.content.recommendedProducts.map((prod, prIdx) => (
                    <Link key={prIdx} href={prod.href} className={styles.productCard}>
                      <div>
                        <span className={styles.productBadge}>{prod.badge}</span>
                        <h4 className={styles.productTitle}>{prod.title}</h4>
                        <span className={styles.productCategory}>{prod.category}</span>
                      </div>
                      <span className={styles.productLinkText}>
                        <ShoppingBag size={13} />
                        Explore Piece
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Interactive FAQ Accordion */}
            {post.faqs && <BlogDetailClient slug={post.slug} title={post.title} faqs={post.faqs} />}

            {/* Tags Cloud */}
            <div className={styles.tagsRow} aria-label="Article Tags">
              {post.tags.map((tag, tIdx) => (
                <span key={tIdx} className={styles.tagPill}>
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author Bio Box */}
            <div className={styles.authorBioBox}>
              <div className={styles.bioAvatar} />
              <div className={styles.bioContent}>
                <div className={styles.bioKicker}>WRITTEN BY</div>
                <h4 className={styles.bioName}>{post.author.name}</h4>
                <p className={styles.bioText}>{post.author.bio}</p>
              </div>
            </div>
          </article>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className={styles.relatedSection} aria-label="Next In Journal">
            <h3 className={styles.relatedTitle}>Further Reading From The Atelier</h3>
            <div className={styles.relatedGrid}>
              {relatedPosts.map((rel) => (
                <article key={rel.slug} style={{ display: 'flex' }}>
                  <Link
                    href={`/blog/${rel.slug}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      background: 'var(--color-neutral-950)',
                      border: '1px solid var(--color-neutral-800)',
                      borderRadius: '4px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: 'var(--color-neutral-400)',
                          display: 'block',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {rel.category} • {rel.readingTime}
                      </span>
                      <h4
                        style={{
                          fontFamily: 'var(--font-family-display)',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          lineHeight: 1.35,
                          marginBottom: '0.75rem',
                          color: 'var(--color-white-pure)',
                        }}
                      >
                        {rel.title}
                      </h4>
                      <p
                        style={{
                          fontSize: '0.84rem',
                          color: 'var(--color-neutral-400)',
                          lineHeight: 1.55,
                        }}
                      >
                        {rel.excerpt}
                      </p>
                    </div>
                    <span
                      style={{
                        marginTop: '1.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--color-white-pure)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      Read Story <ArrowRight size={13} />
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Call to Action Banner */}
        <section className={styles.ctaBanner}>
          <div className={styles.ctaKicker}>THE AVEEZ EXPERIENCE</div>
          <h2 className={styles.ctaTitle}>Wear the Architectural Difference</h2>
          <p className={styles.ctaDesc}>
            Step into 280+ GSM heavyweight comfort, precision boxy silhouettes, and bespoke Indian craftsmanship.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/collections/aveez-originals" className={styles.primaryCta}>
              Explore Aveez Originals ↗
            </Link>
            <Link href="/shop" className={styles.secondaryCta}>
              View Complete Catalog
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
