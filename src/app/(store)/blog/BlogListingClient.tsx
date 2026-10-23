'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, Calendar, Sparkles } from 'lucide-react';
import { BlogPost } from '@/data/blogs';
import styles from './blog.module.css';

interface BlogListingClientProps {
  posts: BlogPost[];
  categories: string[];
}

export function BlogListingClient({ posts, categories }: BlogListingClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredPosts =
    activeCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const featuredPost = posts.find((p) => p.featured) || posts[0];
  const regularPosts = filteredPosts.filter((p) =>
    activeCategory === 'All' ? p.slug !== featuredPost?.slug : true
  );

  return (
    <>
      {/* Category Filter Pills */}
      <div className={styles.categoryBar}>
        <div className={styles.categoryPills} role="tablist" aria-label="Filter articles by category">
          <button
            role="tab"
            aria-selected={activeCategory === 'All'}
            onClick={() => setActiveCategory('All')}
            className={`${styles.categoryPill} ${activeCategory === 'All' ? styles.categoryPillActive : ''}`}
          >
            All Perspectives ({posts.length})
          </button>
          {categories.map((cat) => {
            const count = posts.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`${styles.categoryPill} ${activeCategory === cat ? styles.categoryPillActive : ''}`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
        <span className={styles.articlesCount}>
          Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'Article' : 'Articles'}
        </span>
      </div>

      {/* Featured Spotlight (Only visible when viewing All or the Featured category) */}
      {featuredPost && (activeCategory === 'All' || featuredPost.category === activeCategory) && (
        <section className={styles.featuredSection} aria-label="Featured Story">
          <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredCard}>
            <div className={styles.featuredImageWrapper}>
              <Image
                src={featuredPost.coverImage}
                alt={featuredPost.coverAlt}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 55vw"
                className={styles.featuredImage}
              />
              <span className={styles.featuredBadge}>
                <Sparkles size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                Curated Manifesto
              </span>
            </div>

            <div className={styles.featuredBody}>
              <div className={styles.metaRow}>
                <span className={styles.categoryTag}>{featuredPost.category}</span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} />
                  {featuredPost.readingTime}
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />
                  {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h2 className={styles.featuredTitle}>{featuredPost.title}</h2>
              <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>

              <div className={styles.featuredFooter}>
                <div className={styles.authorMeta}>
                  <div className={styles.authorAvatar} />
                  <span className={styles.authorName}>{featuredPost.author.name}</span>
                </div>

                <span className={styles.readMoreBtn}>
                  Read Manifesto <ArrowRight size={15} />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Regular Articles Grid */}
      <section className={styles.gridSection} aria-label="Recent Articles">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {activeCategory === 'All' ? 'Recent Perspectives & Guides' : `${activeCategory} Articles`}
          </h2>
        </div>

        {regularPosts.length === 0 ? (
          <p style={{ color: 'var(--color-neutral-400)', padding: '2rem 0' }}>
            No articles found in this category.
          </p>
        ) : (
          <div className={styles.articlesGrid}>
            {regularPosts.map((post) => (
              <article key={post.slug} className={styles.articleCard}>
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className={styles.cardImageWrapper}>
                    <Image
                      src={post.coverImage}
                      alt={post.coverAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={styles.cardImage}
                    />
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.cardMeta}>
                      <span className={styles.categoryTag}>{post.category}</span>
                      <span>•</span>
                      <span>{post.readingTime}</span>
                    </div>

                    <h3 className={styles.cardTitle}>{post.title}</h3>
                    <p className={styles.cardExcerpt}>{post.excerpt}</p>

                    <div className={styles.cardFooter}>
                      <span className={styles.cardAuthor}>{post.author.name}</span>
                      <span className={styles.cardCta}>
                        Read Entry <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
