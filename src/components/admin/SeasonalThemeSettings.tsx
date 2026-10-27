'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Save,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Cloud,
  Eye,
  Calendar,
  Layers,
  Upload,
  Image as ImageIcon,
  FileText,
  Truck,
  Gift,
} from 'lucide-react';
import { SeasonalThemeConfig, CampaignAssetMetadata } from '@/types';
import styles from './SeasonalThemeSettings.module.css';

interface SeasonalThemeSettingsProps {
  initialTheme?: SeasonalThemeConfig;
}

export const SeasonalThemeSettings: React.FC<SeasonalThemeSettingsProps> = ({ initialTheme }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const defaultTheme: SeasonalThemeConfig = {
    enabled: false,
    theme: 'diwali',
    announcementText: '✨ THE DIWALI EDIT — CELEBRATE THE SEASON IN TIMELESS STYLE',
    announcementCtaText: 'EXPLORE THE COLLECTION',
    announcementCtaLink: '/shop?gender=MEN',
    heroHeadline: 'THE DIWALI EDIT',
    heroSubheadline: 'Celebrate the season in timeless style. Architectural silhouettes meet festive warmth.',
    heroDesktopImage: '/uploads/campaigns/diwali/diwali-edit-banner.webp',
    heroMobileImage: '/uploads/campaigns/diwali/diwali-edit-banner.webp',
    heroOverlayMode: 'without_text',
    heroPrimaryCtaText: 'SHOP FESTIVE MEN →',
    heroPrimaryCtaLink: '/shop?gender=MEN',
    heroSecondaryCtaText: 'SHOP FESTIVE WOMEN →',
    heroSecondaryCtaLink: '/shop?gender=WOMEN',
    giftPackagingPrice: 99,
    matchingStylesImage: '/api/media/campaigns/diwali/matching-styles.webp',
    menImage: '/api/media/campaigns/diwali/men.webp',
    womenImage: '/api/media/campaigns/diwali/women.webp',
    accessoriesImage: '/api/media/campaigns/diwali/accessories.webp',
    campaignStartDate: null,
    campaignEndDate: null,
    campaignAssets: [],
  };

  const [form, setForm] = useState<SeasonalThemeConfig>({
    ...defaultTheme,
    ...(initialTheme || {}),
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  const defaultDiwaliBanners = [
    {
      id: 'edit-banner',
      title: 'The Diwali Edit (Editorial Banner)',
      url: '/uploads/campaigns/diwali/diwali-edit-banner.webp',
    },
    {
      id: 'winter-collection',
      title: 'Diwali Winter Collection',
      url: '/uploads/campaigns/diwali/diwali-winter-collection.webp',
    },
    {
      id: 'bogo-banner',
      title: 'Diwali Buy One Get One (BOGO)',
      url: '/uploads/campaigns/diwali/diwali-bogo-banner.webp',
    },
  ];

  const isDiwaliActive = form.enabled && form.theme === 'diwali';
  const heroOverlayMode = form.heroOverlayMode || 'without_text';

  const handleToggle = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      enabled: checked,
      theme: checked ? 'diwali' : 'normal',
    }));
  };

  const handleOverlayModeChange = (mode: 'with_text' | 'without_text') => {
    setForm((prev) => ({
      ...prev,
      heroOverlayMode: mode,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectDesktopHero = (url: string) => {
    setForm((prev) => ({ ...prev, heroDesktopImage: url }));
  };

  const handleSelectMobileHero = (url: string) => {
    setForm((prev) => ({ ...prev, heroMobileImage: url }));
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingHero(true);
    setUploadSuccessMsg(null);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target', 'diwali-hero');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload hero image.');
      }

      const uploadedUrl = data.data.url;
      setForm((prev) => ({
        ...prev,
        heroDesktopImage: uploadedUrl,
        heroMobileImage: uploadedUrl,
      }));
      setUploadSuccessMsg(`Hero banner "${file.name}" uploaded and set!`);
      setTimeout(() => setUploadSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Error uploading hero banner:', err);
      setErrorMessage(err.message || 'Image upload failed.');
    } finally {
      setIsUploadingHero(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seasonalTheme: form,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save theme settings.');
      }

      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error updating seasonal theme:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const assets: CampaignAssetMetadata[] = form.campaignAssets || [];

  return (
    <form onSubmit={handleSubmit} className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleGroup}>
          <Sparkles size={18} className={styles.sectionHeaderIcon} />
          <div>
            <h2 className={styles.cardTitle}>Seasonal Campaign & Storefront Theme</h2>
            <p className={styles.cardSubtitle}>
              Activate festive seasonal themes (e.g., Diwali Edit) with Backblaze B2 campaign imagery.
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className={styles.switchContainer}>
          <span className={styles.switchLabel}>
            {form.enabled ? 'Diwali Theme: ON' : 'Diwali Theme: OFF'}
          </span>
          <label className={styles.switch} aria-label="Toggle Seasonal Theme">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => handleToggle(e.target.checked)}
            />
            <span className={styles.slider} />
          </label>
        </div>
      </div>

      <div className={styles.cardBody}>
        {/* Dynamic Status Banner */}
        {isDiwaliActive ? (
          <div className={styles.festiveBannerActive}>
            <div className={styles.bannerInfo}>
              <span className={styles.diwaliIcon}>🪔</span>
              <div>
                <p className={styles.bannerTitle}>Diwali Mode is currently LIVE across the storefront</p>
                <p className={styles.bannerDesc}>
                  All visitors will see the rich wine & gold festive palette, Diwali announcement bar, and AI hero campaign.
                </p>
              </div>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.previewBtn}
              style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', borderColor: '#C5A059' }}
            >
              <Eye size={14} />
              <span>Preview Storefront</span>
            </a>
          </div>
        ) : (
          <div className={styles.festiveBannerInactive}>
            <div className={styles.bannerInfo}>
              <span style={{ fontSize: '1.25rem' }}>⚪</span>
              <div>
                <p className={styles.bannerTitle}>Normal Luxury Monochrome Theme is Active</p>
                <p className={styles.bannerDesc}>
                  The storefront is displaying default architectural black, off-white, and core hero imagery.
                </p>
              </div>
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.previewBtn}
            >
              <Eye size={14} />
              <span>View Storefront</span>
            </a>
          </div>
        )}

        {/* Theme Mode Selection & Scheduling */}
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Theme Preset</label>
            <select
              name="theme"
              value={form.theme}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="normal">Normal (Monochrome Luxury)</option>
              <option value="diwali">Diwali (Burgundy, Warm Ivory & Gold)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Active Mode Precedence</label>
            <input
              type="text"
              readOnly
              value={form.enabled ? 'Manual Override: Active (ON)' : 'Manual Override: Inactive (OFF)'}
              className={styles.input}
              style={{ background: '#F4F4F5', cursor: 'default' }}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Campaign Start Date (Optional)</label>
            <input
              type="date"
              name="campaignStartDate"
              value={form.campaignStartDate ? form.campaignStartDate.slice(0, 10) : ''}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Campaign End Date (Optional)</label>
            <input
              type="date"
              name="campaignEndDate"
              value={form.campaignEndDate ? form.campaignEndDate.slice(0, 10) : ''}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        </div>

        {/* Festive Announcement Bar */}
        <div className={styles.formGridFull}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Festive Announcement Bar Message</label>
            <input
              type="text"
              name="announcementText"
              value={form.announcementText}
              onChange={handleChange}
              placeholder="e.g., ✨ THE DIWALI EDIT — CELEBRATE THE SEASON IN TIMELESS STYLE"
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Announcement CTA Text</label>
            <input
              type="text"
              name="announcementCtaText"
              value={form.announcementCtaText || ''}
              onChange={handleChange}
              placeholder="e.g., EXPLORE THE COLLECTION"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Announcement CTA Link</label>
            <input
              type="text"
              name="announcementCtaLink"
              value={form.announcementCtaLink || ''}
              onChange={handleChange}
              placeholder="e.g., /shop?gender=MEN"
              className={styles.input}
            />
          </div>
        </div>

        {/* Festive Shipping & Gift Packaging Status */}
        <div className={styles.perksBox}>
          <div className={styles.perkItem}>
            <span className={styles.perkIcon}>🚚</span>
            <div>
              <p className={styles.perkTitle}>0 Delivery Charge on Any Order</p>
              <p className={styles.perkDesc}>
                Automatic ₹0 standard shipping fee applied storewide for all customers when Diwali Mode is active.
              </p>
            </div>
          </div>
          <div className={styles.perkItem}>
            <span className={styles.perkIcon}>🎁</span>
            <div>
              <p className={styles.perkTitle}>Premium Festive Gift Packaging (₹99)</p>
              <p className={styles.perkDesc}>
                Optional luxury magnetic presentation box, festive satin ribbon & wax-sealed greeting card for ₹99.
              </p>
            </div>
          </div>
        </div>

        {/* Hero Section Banner & Overlay Controls */}
        <div className={styles.heroConfigCard}>
          <div>
            <label className={styles.label} style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0A0A0A' }}>
              Diwali Hero Presentation Mode
            </label>
            <p style={{ fontSize: '0.75rem', color: '#71717A', margin: '2px 0 10px' }}>
              Choose whether the hero section shows pure campaign artwork or overlay typography with CTA buttons.
            </p>

            {/* Segmented Button: With Overlay Text vs Without Text */}
            <div className={styles.overlayModeSelector}>
              <button
                type="button"
                className={`${styles.modeBtn} ${heroOverlayMode === 'without_text' ? styles.modeBtnActive : ''}`}
                onClick={() => handleOverlayModeChange('without_text')}
                aria-pressed={heroOverlayMode === 'without_text'}
              >
                <ImageIcon size={15} />
                <span>Without Text (Clean Banner)</span>
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${heroOverlayMode === 'with_text' ? styles.modeBtnActive : ''}`}
                onClick={() => handleOverlayModeChange('with_text')}
                aria-pressed={heroOverlayMode === 'with_text'}
              >
                <FileText size={15} />
                <span>With Overlay Text & Button</span>
              </button>
            </div>
          </div>

          {heroOverlayMode === 'without_text' ? (
            <div className={styles.modeNotice}>
              <strong>🖼️ Clean Banner Mode Active:</strong> The Diwali hero slider displays pure high-fashion photography from <code>/uploads/campaigns/diwali</code> without text overlays or vignette shadows. The entire banner is clickable to explore the collection.
            </div>
          ) : (
            <div className={styles.modeNotice}>
              <strong>✍️ Overlay Text & Buttons Active:</strong> The hero banner will render editorial headline typography, festive subheadline, and direct CTA buttons over the artwork.
            </div>
          )}

          {/* Upload Diwali Hero Image */}
          <div>
            <label className={styles.label}>Upload Diwali Hero Banner</label>
            <div className={styles.heroUploadWrap}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleHeroUpload}
                accept="image/webp,image/jpeg,image/png,image/avif"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className={styles.uploadFileBtn}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingHero}
              >
                <Upload size={15} />
                <span>{isUploadingHero ? 'Uploading Image...' : 'Upload New Hero Banner'}</span>
              </button>

              {uploadSuccessMsg && (
                <span className={styles.uploadSuccessAlert}>
                  <CheckCircle2 size={14} />
                  <span>{uploadSuccessMsg}</span>
                </span>
              )}

              <span style={{ fontSize: '0.75rem', color: '#71717A' }}>
                Supports WebP, PNG, JPG (Saved to <code>/uploads/campaigns/diwali</code>)
              </span>
            </div>
          </div>

          {/* Quick Select Preset Diwali Campaign Banners */}
          <div className={styles.presetBannersWrap}>
            <span className={styles.label}>Diwali Campaign Banners (Select Active Hero Image)</span>
            <div className={styles.presetBannerGrid}>
              {defaultDiwaliBanners.map((banner) => {
                const isActive = form.heroDesktopImage === banner.url;
                return (
                  <div
                    key={banner.id}
                    className={`${styles.presetBannerCard} ${isActive ? styles.presetBannerActive : ''}`}
                    onClick={() => {
                      handleSelectDesktopHero(banner.url);
                      handleSelectMobileHero(banner.url);
                    }}
                  >
                    {isActive && <span className={styles.presetActiveBadge}>Active Hero</span>}
                    <div className={styles.presetThumbWrap}>
                      <Image
                        src={banner.url}
                        alt={banner.title}
                        fill
                        className={styles.imageThumb}
                        sizes="240px"
                      />
                    </div>
                    <div className={styles.presetDetails}>
                      <p className={styles.presetTitle}>{banner.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image URL Inputs */}
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Active Desktop Hero Image URL</label>
              <input
                type="text"
                name="heroDesktopImage"
                value={form.heroDesktopImage}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Active Mobile Hero Image URL</label>
              <input
                type="text"
                name="heroMobileImage"
                value={form.heroMobileImage}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          {/* Conditional: Hero Overlay Copy & CTA Buttons (Visible when "With Overlay Text" is selected) */}
          {heroOverlayMode === 'with_text' && (
            <>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Festive Hero Headline</label>
                  <input
                    type="text"
                    name="heroHeadline"
                    value={form.heroHeadline}
                    onChange={handleChange}
                    placeholder="THE DIWALI EDIT"
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Festive Hero Subheadline</label>
                  <textarea
                    name="heroSubheadline"
                    value={form.heroSubheadline}
                    onChange={handleChange}
                    placeholder="Celebrate the season in timeless style. Architectural silhouettes meet festive warmth."
                    className={styles.textarea}
                    rows={2}
                  />
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Primary Hero CTA Button (Men)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      name="heroPrimaryCtaText"
                      value={form.heroPrimaryCtaText || ''}
                      onChange={handleChange}
                      placeholder="SHOP MEN →"
                      className={styles.input}
                    />
                    <input
                      type="text"
                      name="heroPrimaryCtaLink"
                      value={form.heroPrimaryCtaLink || ''}
                      onChange={handleChange}
                      placeholder="/shop?gender=MEN"
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Secondary Hero CTA Button (Women)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      name="heroSecondaryCtaText"
                      value={form.heroSecondaryCtaText || ''}
                      onChange={handleChange}
                      placeholder="SHOP WOMEN →"
                      className={styles.input}
                    />
                    <input
                      type="text"
                      name="heroSecondaryCtaLink"
                      value={form.heroSecondaryCtaLink || ''}
                      onChange={handleChange}
                      placeholder="/shop?gender=WOMEN"
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Backblaze B2 Campaign Assets Gallery */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cloud size={14} color="#1D4ED8" />
              <span>Backblaze B2 Campaign Imagery (Click to Select)</span>
            </span>
            <span style={{ fontSize: '0.6875rem', color: '#71717A' }}>
              Optimized WebP • Stored in B2 Private Bucket &apos;Aveezfashion&apos;
            </span>
          </div>

          <div className={styles.imageSelectorGrid}>
            {assets.map((asset) => {
              const isDesktopSelected = form.heroDesktopImage === asset.url;
              const isMobileSelected = form.heroMobileImage === asset.url;
              const isSelected = isDesktopSelected || isMobileSelected;

              return (
                <div
                  key={asset.id}
                  className={`${styles.imageCard} ${isSelected ? styles.imageCardActive : ''}`}
                  onClick={() => {
                    if (asset.variant === 'mobile') {
                      handleSelectMobileHero(asset.url);
                    } else {
                      handleSelectDesktopHero(asset.url);
                    }
                  }}
                  title="Click to assign to hero"
                >
                  <div className={styles.imageThumbWrap}>
                    <Image
                      src={asset.url}
                      alt={asset.purpose}
                      fill
                      className={styles.imageThumb}
                      sizes="220px"
                    />
                  </div>
                  <div className={styles.imageDetails}>
                    <p className={styles.imageTitle}>{asset.purpose}</p>
                    <div className={styles.imageMeta}>
                      <span>{asset.width}×{asset.height}</span>
                      <span className={styles.b2Badge}>{(asset.sizeBytes / 1024).toFixed(0)} KB WebP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionFooter}>
          {saveSuccess && (
            <div className={styles.successMessage}>
              <CheckCircle2 size={16} />
              <span>Theme configuration saved & SSR cache revalidated!</span>
            </div>
          )}

          {errorMessage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#DC2626', fontSize: '0.75rem' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.previewBtn}
          >
            <ExternalLink size={15} />
            <span>Preview Storefront</span>
          </a>

          <button
            type="submit"
            disabled={isSaving}
            className={styles.saveBtn}
          >
            <Save size={15} />
            <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
