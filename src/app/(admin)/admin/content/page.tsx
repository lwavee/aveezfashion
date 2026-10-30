'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  Megaphone,
  Image as ImageIcon,
  BookOpen,
  Sparkles,
  Flame,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Layers,
  Eye,
  AlertCircle,
  Save,
} from 'lucide-react';
import styles from './contentManager.module.css';

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Announcement Bar State
  const [announcementMsg, setAnnouncementMsg] = useState('FREE SHIPPING ON ALL ORDERS ABOVE ₹1,999');
  const [announcementCtaText, setAnnouncementCtaText] = useState('SHOP NEW DROP');
  const [announcementCtaLink, setAnnouncementCtaLink] = useState('/shop');
  const [announcementActive, setAnnouncementActive] = useState(true);

  // Seasonal Theme State
  const [seasonalThemeEnabled, setSeasonalThemeEnabled] = useState(true);
  const [seasonalTheme, setSeasonalTheme] = useState('diwali');
  const [seasonalDesktopImg, setSeasonalDesktopImg] = useState('/api/media/campaigns/diwali/hero-desktop.webp');
  const [seasonalMobileImg, setSeasonalMobileImg] = useState('/api/media/campaigns/diwali/hero-mobile.webp');

  // Brand Story State
  const [brandStoryTitle, setBrandStoryTitle] = useState('INDIVIDUALITY BY DESIGN.');
  const [brandStoryPara1, setBrandStoryPara1] = useState(
    'Aveez Fashion was founded on a simple conviction: clothing should reflect confident self-expression, not mass conformity.'
  );
  const [brandStoryPara2, setBrandStoryPara2] = useState(
    'Every garment begins with deliberate textile engineering. We source heavyweight, combed natural fibers, test drape mechanics, and refine boxy proportions to create pieces that feel substantial the moment you put them on.'
  );

  // Aveez Originals Feature
  const [originalsHeadline, setOriginalsHeadline] = useState('THE ARCHITECTURAL SILHOUETTE');
  const [originalsTagline, setOriginalsTagline] = useState('CHAPTER 01 / SIGNATURE DROP');
  const [originalsDesc, setOriginalsDesc] = useState(
    'Crafted from custom 450 GSM luxury brushed French terry cotton with relaxed drop shoulders and structured drapes.'
  );
  const [originalsImg, setOriginalsImg] = useState('/api/media/campaigns/signature.webp');

  // Active Hero Campaigns from DB
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          const c = json.data.content || {};
          const s = json.data.settings || {};
          const camps = json.data.campaigns || [];

          if (c.announcementBar) {
            setAnnouncementMsg(c.announcementBar.message || '');
            setAnnouncementCtaText(c.announcementBar.ctaText || 'SHOP NEW DROP');
            setAnnouncementCtaLink(c.announcementBar.ctaLink || '/shop');
            setAnnouncementActive(Boolean(c.announcementBar.isActive));
          }

          if (s.seasonalTheme) {
            setSeasonalThemeEnabled(Boolean(s.seasonalTheme.enabled));
            setSeasonalTheme(s.seasonalTheme.theme || 'diwali');
            if (s.seasonalTheme.heroDesktopImage) setSeasonalDesktopImg(s.seasonalTheme.heroDesktopImage);
            if (s.seasonalTheme.heroMobileImage) setSeasonalMobileImg(s.seasonalTheme.heroMobileImage);
          }

          if (c.brandStory) {
            setBrandStoryTitle(c.brandStory.title || 'INDIVIDUALITY BY DESIGN.');
            if (Array.isArray(c.brandStory.paragraphs)) {
              if (c.brandStory.paragraphs[0]) setBrandStoryPara1(c.brandStory.paragraphs[0]);
              if (c.brandStory.paragraphs[1]) setBrandStoryPara2(c.brandStory.paragraphs[1]);
            }
          }

          if (c.aveezOriginals) {
            setOriginalsHeadline(c.aveezOriginals.headline || '');
            setOriginalsTagline(c.aveezOriginals.tagline || '');
            setOriginalsDesc(c.aveezOriginals.description || '');
            if (c.aveezOriginals.image) setOriginalsImg(c.aveezOriginals.image);
          }

          setCampaigns(camps);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load homepage content');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndRevalidate = async () => {
    setSaving(true);
    setNotice(null);
    setError(null);

    try {
      const payload = {
        announcementBar: {
          message: announcementMsg.trim(),
          ctaText: announcementCtaText.trim(),
          ctaLink: announcementCtaLink.trim(),
          isActive: announcementActive,
        },
        seasonalTheme: {
          enabled: seasonalThemeEnabled,
          theme: seasonalTheme,
          heroDesktopImage: seasonalDesktopImg,
          heroMobileImage: seasonalMobileImg,
        },
        brandStory: {
          title: brandStoryTitle.trim(),
          paragraphs: [brandStoryPara1.trim(), brandStoryPara2.trim()].filter(Boolean),
          ctaText: 'OUR STORY',
          ctaLink: '/about',
        },
        aveezOriginals: {
          tagline: originalsTagline.trim(),
          headline: originalsHeadline.trim(),
          description: originalsDesc.trim(),
          image: originalsImg,
          ctaText: 'EXPLORE AVEEZ ORIGINALS',
          ctaLink: '/collections/aveez-originals',
        },
      };

      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save content.');
      }

      setNotice('Homepage content saved and storefront cache revalidated instantly!');
    } catch (err: any) {
      setError(err.message || 'Error saving homepage content.');
    } finally {
      setSaving(false);
    }
  };

  const activeHeroCampaigns = campaigns.filter(
    (c) => (c.status === 'ACTIVE' || c.status === 'SCHEDULED') && c.purpose === 'hero_banner'
  );

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.titleStack}>
          <h1 className={styles.title}>Homepage Content Manager</h1>
          <p className={styles.subtitle}>
            Manage data-driven storefront sections, announcement broadcasts, seasonal festival themes, and AI hero campaign ordering.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={styles.revalidateBtn}
            onClick={handleSaveAndRevalidate}
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <RefreshCw size={14} className={styles.spin} />
                <span>SAVING & REVALIDATING...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>SAVE & REVALIDATE STOREFRONT</span>
              </>
            )}
          </button>
          <Link href="/" target="_blank" className={styles.revalidateBtn} style={{ backgroundColor: '#FFFFFF', color: '#0A0A0A' }}>
            <ExternalLink size={14} />
            <span>VIEW LIVE STORE</span>
          </Link>
        </div>
      </div>

      {notice && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #34D399',
            borderRadius: '6px',
            color: '#065F46',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #F87171',
            borderRadius: '6px',
            color: '#991B1B',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Homepage Content Cards */}
      <div className={styles.sectionGrid}>
        {/* 1. Announcement Bar */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <Megaphone size={16} />
              <h2 className={styles.cardTitle}>1. Top Announcement Bar</h2>
            </div>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={announcementActive}
                onChange={(e) => setAnnouncementActive(e.target.checked)}
                style={{ display: 'none' }}
              />
              <span className={`${styles.switch} ${announcementActive ? styles.switchActive : ''}`}>
                <span className={`${styles.switchKnob} ${announcementActive ? styles.switchKnobActive : ''}`} />
              </span>
              <span className={styles.switchLabel}>{announcementActive ? 'Visible' : 'Hidden'}</span>
            </label>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Broadcast Message</label>
              <input
                type="text"
                className={styles.input}
                value={announcementMsg}
                onChange={(e) => setAnnouncementMsg(e.target.value)}
              />
            </div>

            <div className={styles.rowGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>CTA Text</label>
                <input
                  type="text"
                  className={styles.input}
                  value={announcementCtaText}
                  onChange={(e) => setAnnouncementCtaText(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>CTA Link</label>
                <input
                  type="text"
                  className={styles.input}
                  value={announcementCtaLink}
                  onChange={(e) => setAnnouncementCtaLink(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Seasonal Theme Toggle (Diwali / Festive) */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <Flame size={16} color="#D97706" />
              <h2 className={styles.cardTitle}>2. Seasonal Campaign Theme</h2>
            </div>
            <label className={styles.toggleSwitch}>
              <input
                type="checkbox"
                checked={seasonalThemeEnabled}
                onChange={(e) => setSeasonalThemeEnabled(e.target.checked)}
                style={{ display: 'none' }}
              />
              <span className={`${styles.switch} ${seasonalThemeEnabled ? styles.switchActive : ''}`}>
                <span className={`${styles.switchKnob} ${seasonalThemeEnabled ? styles.switchKnobActive : ''}`} />
              </span>
              <span className={styles.switchLabel}>
                {seasonalThemeEnabled ? 'Theme Active' : 'Normal Storefront'}
              </span>
            </label>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.rowGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Active Theme</label>
                <select
                  className={styles.select}
                  value={seasonalTheme}
                  onChange={(e) => setSeasonalTheme(e.target.value)}
                >
                  <option value="diwali">Diwali Luxury Festive Edit</option>
                  <option value="winter">Winter Collection Edit</option>
                  <option value="wedding">Royal Wedding Atelier</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Manage Banners in AI Studio</label>
                <Link
                  href="/admin/ai-studio"
                  className={styles.revalidateBtn}
                  style={{
                    backgroundColor: '#FAF5FF',
                    color: '#6D28D9',
                    border: '1px solid #DDD6FE',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={14} />
                  <span>Open AI Studio</span>
                </Link>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Hero Desktop Banner Asset</label>
              <input
                type="text"
                className={styles.input}
                value={seasonalDesktopImg}
                onChange={(e) => setSeasonalDesktopImg(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 3. Hero Banners & Active AI Campaigns Carousel */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <Sparkles size={16} />
              <h2 className={styles.cardTitle}>3. Hero Carousel Campaigns ({activeHeroCampaigns.length})</h2>
            </div>
            <Link
              href="/admin/ai-studio"
              style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6D28D9', textDecoration: 'none' }}
            >
              + Create Campaign
            </Link>
          </div>

          <div className={styles.cardBody}>
            {activeHeroCampaigns.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: '#71717A', margin: 0 }}>
                No custom AI campaigns currently scheduled. The storefront is displaying the default core collection slides.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeHeroCampaigns.map((camp) => (
                  <div key={camp._id} className={styles.campaignItemRow}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={camp.desktopImage} alt={camp.name} className={styles.campaignThumb} />
                    <div className={styles.campaignInfo}>
                      <span className={styles.campaignTitle}>{camp.name}</span>
                      <span className={styles.campaignMeta}>
                        Priority: {camp.priority} | Headline: &quot;{camp.headline || 'None'}&quot;
                      </span>
                    </div>
                    <span className={camp.status === 'ACTIVE' ? styles.statusActive : styles.statusScheduled}>
                      {camp.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Brand Philosophy & Editorial Block */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleGroup}>
              <BookOpen size={16} />
              <h2 className={styles.cardTitle}>4. Brand Story Section</h2>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Headline Title</label>
              <input
                type="text"
                className={styles.input}
                value={brandStoryTitle}
                onChange={(e) => setBrandStoryTitle(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Paragraph 1</label>
              <textarea
                rows={2}
                className={styles.textarea}
                value={brandStoryPara1}
                onChange={(e) => setBrandStoryPara1(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Paragraph 2</label>
              <textarea
                rows={2}
                className={styles.textarea}
                value={brandStoryPara2}
                onChange={(e) => setBrandStoryPara2(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
