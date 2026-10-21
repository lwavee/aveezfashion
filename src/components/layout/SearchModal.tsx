'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, TrendingUp, Sparkles, Loader2, ArrowUpRight } from 'lucide-react';
import { Product } from '@/types';
import styles from './SearchModal.module.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING_SEARCHES = [
  'Heavyweight Hoodies',
  'Oversized Tees',
  'Pleated Trousers',
  'Resort Shirts',
  'Handmade Hairbands',
  'Onyx Black',
];

const CURATED_CATEGORIES = [
  {
    title: 'New Arrivals',
    subtitle: 'Fresh drops & seasonal silhouettes',
    href: '/shop?filter=new',
  },
  {
    title: 'Luxury Hoodies',
    subtitle: '450 GSM structured French Terry',
    href: '/shop?category=hoodies',
  },
  {
    title: 'Tailored Bottoms',
    subtitle: 'Wide-leg relaxed & pleated cuts',
    href: '/shop?category=bottoms',
  },
  {
    title: 'Artisan Accessories',
    subtitle: 'Handmade hairbands & claw clips',
    href: '/accessories',
  },
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Focus input and lock body scroll on open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);

      return () => {
        document.body.style.overflow = prevOverflow;
        clearTimeout(timer);
      };
    } else {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setTotalCount(0);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(trimmed)}&limit=4`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setResults(json.data.products || []);
            setTotalCount(json.data.total || 0);
          } else {
            setResults([]);
            setTotalCount(0);
          }
        }
      } catch {
        setResults([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onClose();
      router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleQuickSearch = (term: string) => {
    onClose();
    router.push(`/shop?search=${encodeURIComponent(term)}`);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Product Search Modal"
    >
      <div
        className={styles.modalDrawer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.innerContainer}>
          {/* Header Bar: Search Capsule & Close Action */}
          <div className={styles.headerRow}>
            <form onSubmit={handleSubmit} className={styles.searchCapsule}>
              <Search size={20} strokeWidth={1.5} className={styles.searchIcon} />
              
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search hoodies, oversized tees, linen shirts, trousers..."
                className={styles.searchInput}
                aria-label="Search store catalog"
              />

              <div className={styles.inputActions}>
                {isLoading && (
                  <Loader2 size={18} className={styles.spinner} aria-label="Loading results" />
                )}

                {query && !isLoading && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className={styles.clearBtn}
                    aria-label="Clear query"
                  >
                    <X size={16} />
                  </button>
                )}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  aria-label="Search catalog"
                  title="Search"
                >
                  <ArrowRight size={18} strokeWidth={2} />
                </button>
              </div>
            </form>

            <div className={styles.dismissGroup}>
              <span className={styles.escBadge}>ESC</span>
              <button
                type="button"
                onClick={onClose}
                className={styles.closeBtn}
                aria-label="Close search"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Modal Body: Either Live Results or Discovery State */}
          <div className={styles.bodyContent}>
            {/* STATE 1: Live Results while typing */}
            {query.trim().length >= 2 ? (
              <div className={styles.resultsSection}>
                {isLoading ? (
                  <div className={styles.shimmerGrid}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={styles.shimmerCard}>
                        <div className={styles.shimmerImage} />
                        <div className={styles.shimmerLineShort} />
                        <div className={styles.shimmerLineLong} />
                      </div>
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <>
                    <div className={styles.resultsHeader}>
                      <span className={styles.resultsTitle}>
                        PRODUCTS MATCHING <span className={styles.queryHighlight}>&ldquo;{query}&rdquo;</span>
                        <span className={styles.resultCountBadge}>({totalCount || results.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className={styles.viewAllTextBtn}
                      >
                        View all in shop <ArrowUpRight size={14} />
                      </button>
                    </div>

                    <div className={styles.productGrid}>
                      {results.map((product) => {
                        const image = product.images?.[0]?.url || '/brand/clothing-label-mark.svg';
                        const hasSale = product.salePrice && product.salePrice < product.basePrice;

                        return (
                          <Link
                            key={product._id}
                            href={`/product/${product.slug}`}
                            onClick={onClose}
                            className={styles.productCard}
                          >
                            <div className={styles.imageWrap}>
                              <Image
                                src={image}
                                alt={product.title}
                                fill
                                sizes="(max-width: 640px) 100px, 220px"
                                className={styles.productImage}
                              />
                            </div>
                            <div className={styles.productInfo}>
                              <span className={styles.productDept}>
                                {product.gender || 'UNISEX'}
                              </span>
                              <h4 className={styles.productTitle}>{product.title}</h4>
                              <div className={styles.productPrice}>
                                {hasSale ? (
                                  <>
                                    <span className={styles.salePrice}>
                                      ₹{product.salePrice?.toLocaleString('en-IN')}
                                    </span>
                                    <span className={styles.originalPrice}>
                                      ₹{product.basePrice.toLocaleString('en-IN')}
                                    </span>
                                  </>
                                ) : (
                                  <span>₹{product.basePrice.toLocaleString('en-IN')}</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>

                    <div className={styles.viewAllCtaWrap}>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className={styles.viewAllCtaBtn}
                      >
                        VIEW ALL {totalCount > results.length ? `${totalCount} ` : ''}RESULTS FOR &ldquo;{query.toUpperCase()}&rdquo; →
                      </button>
                    </div>
                  </>
                ) : hasSearched ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIconCircle}>
                      <Search size={28} strokeWidth={1.2} />
                    </div>
                    <h3 className={styles.emptyTitle}>
                      No styles found for &ldquo;{query}&rdquo;
                    </h3>
                    <p className={styles.emptySubtitle}>
                      Check your spelling or explore these trending styles:
                    </p>
                    <div className={styles.emptyTagsWrap}>
                      {TRENDING_SEARCHES.slice(0, 4).map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleQuickSearch(tag)}
                          className={styles.pillTag}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              /* STATE 2: Discovery State (empty query) */
              <div className={styles.discoverySection}>
                {/* Trending Search Pills */}
                <div className={styles.trendingBlock}>
                  <div className={styles.sectionHeader}>
                    <TrendingUp size={15} className={styles.sectionHeaderIcon} />
                    <span className={styles.sectionTitle}>TRENDING RIGHT NOW</span>
                  </div>
                  <div className={styles.pillList}>
                    {TRENDING_SEARCHES.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => handleQuickSearch(term)}
                        className={styles.pillTag}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Curated Categories */}
                <div className={styles.categoriesBlock}>
                  <div className={styles.sectionHeader}>
                    <Sparkles size={15} className={styles.sectionHeaderIcon} />
                    <span className={styles.sectionTitle}>CURATED CATEGORIES</span>
                  </div>
                  <div className={styles.categoriesGrid}>
                    {CURATED_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.title}
                        href={cat.href}
                        onClick={onClose}
                        className={styles.categoryCard}
                      >
                        <div className={styles.categoryCardText}>
                          <span className={styles.categoryCardTitle}>{cat.title}</span>
                          <span className={styles.categoryCardSubtitle}>{cat.subtitle}</span>
                        </div>
                        <ArrowUpRight size={18} className={styles.categoryCardArrow} />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
