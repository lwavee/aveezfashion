'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Image as ImageIcon,
  Calendar,
  Layers,
  ArrowRight,
  Check,
  AlertCircle,
  RefreshCw,
  Sliders,
  Trash2,
  Eye,
  Smartphone,
  Monitor,
  Upload,
  CheckCircle2,
  Clock,
  Archive,
  ExternalLink,
} from 'lucide-react';
import styles from './aiStudio.module.css';

interface CampaignItem {
  _id: string;
  name: string;
  slug: string;
  purpose: 'hero_banner' | 'seasonal' | 'new_arrivals' | 'collection' | 'category';
  theme: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'ARCHIVED';
  desktopImage: string;
  mobileImage?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  offerText?: string;
  priority: number;
  startDate?: string | null;
  endDate?: string | null;
  targetSection: string;
  createdAt: string;
}

interface ThemePreset {
  id: string;
  name: string;
  presetPrompt: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  offerText: string;
  sampleImage: string;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'diwali',
    name: 'Diwali Collection',
    presetPrompt:
      'Editorial royal Indian festive fashion. Handcrafted silk blend kurtas, opulent gold accents, warm diwali ambient illumination, timeless elegance.',
    headline: 'THIS DIWALI, WEAR DIFFERENT.',
    subheadline: 'Luxury festive edit with handcrafted silhouettes & architectural tailoring.',
    ctaText: 'EXPLORE FESTIVE DROP →',
    ctaLink: '/shop?collection=diwali',
    offerText: 'BUY 1 GET 1 FREE (CODE: DIWALIBOGO)',
    sampleImage: '/uploads/campaigns/diwali/diwali-edit-banner.webp',
  },
  {
    id: 'winter',
    name: 'Winter Collection',
    presetPrompt:
      'Winter luxury streetwear editorial. Heavyweight 450 GSM French terry hoodies, structured boxy wool outerwear, cold moody ambient daylight.',
    headline: 'WINTER ARCHITECTURE 2026.',
    subheadline: 'Substantial heavyweight essentials built to withstand the elements.',
    ctaText: 'SHOP WINTER EDIT →',
    ctaLink: '/shop?collection=winter',
    offerText: 'NEW SEASON DROP',
    sampleImage: '/api/media/hero/hero1.webp',
  },
  {
    id: 'new_arrivals',
    name: 'New Arrivals',
    presetPrompt:
      'Minimalist avant-garde streetwear drop. Crisp architectural silhouettes, neutral bone and onyx tones, high fashion studio lighting.',
    headline: 'CHAPTER 01 / NEW DROP.',
    subheadline: 'Modern luxury essentials designed for distinct individuality.',
    ctaText: 'SHOP NEW ARRIVALS →',
    ctaLink: '/shop?filter=new-arrivals',
    offerText: 'LIMITED EDITION',
    sampleImage: '/api/media/hero/hero2.webp',
  },
  {
    id: 'men',
    name: "Men's Collection",
    presetPrompt:
      "High-fashion men's luxury editorial. Structured drop-shoulder boxy tee, tailored trousers, clean minimal background.",
    headline: "THE MEN'S EDIT.",
    subheadline: 'Heavyweight silhouettes and uncompromising drape mechanics.',
    ctaText: 'SHOP MEN →',
    ctaLink: '/shop?gender=MEN',
    offerText: 'SIGNATURE PIECES',
    sampleImage: '/api/media/campaigns/diwali/men.webp',
  },
  {
    id: 'women',
    name: "Women's Collection",
    presetPrompt:
      'Luxury womenswear fashion editorial. Modern silhouettes, bespoke festive textures, refined architectural elegance.',
    headline: 'CONTEMPORARY LUXURY.',
    subheadline: 'Tailored elegance meets relaxed modern proportions.',
    ctaText: 'SHOP WOMEN →',
    ctaLink: '/shop?gender=WOMEN',
    offerText: 'CURATED EDIT',
    sampleImage: '/api/media/campaigns/diwali/women.webp',
  },
  {
    id: 'couple',
    name: 'Matching Couple Styles',
    presetPrompt:
      'Harmonious couple styling editorial. Coordinating luxury tones in beige, olive, and chalk white, natural chemistry, modern luxury.',
    headline: 'TOGETHER IN STYLE.',
    subheadline: 'Coordinated palettes engineered for effortless pairing.',
    ctaText: 'EXPLORE MATCHING STYLES →',
    ctaLink: '/shop?collection=matching-styles',
    offerText: 'PAIRED PERFECTION',
    sampleImage: '/api/media/campaigns/diwali/matching-styles.webp',
  },
  {
    id: 'wedding',
    name: 'Wedding & Festive Wear',
    presetPrompt:
      'Royal Indian wedding festive occasion wear. Intricate minimalist embroidery, regal posture, golden hour natural light.',
    headline: 'ROYAL FESTIVE ATELIER.',
    subheadline: 'Heritage craftsmanship engineered for modern celebration.',
    ctaText: 'VIEW FESTIVE ATELIER →',
    ctaLink: '/shop?category=festive',
    offerText: 'CELEBRATION EDIT',
    sampleImage: '/uploads/campaigns/diwali/diwali-edit-banner.webp',
  },
  {
    id: 'custom',
    name: 'Custom Campaign',
    presetPrompt:
      'Luxury fashion editorial campaign photograph for AVEEZ FASHION. Impeccably tailored silhouettes, natural lighting, high-end styling.',
    headline: 'INDIVIDUALITY BY DESIGN.',
    subheadline: 'Contemporary luxury streetwear handcrafted in India.',
    ctaText: 'DISCOVER COLLECTION →',
    ctaLink: '/shop',
    offerText: '',
    sampleImage: '/uploads/campaigns/diwali/diwali-edit-banner.webp',
  },
];

export default function AiStudioPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'catalog'>('create');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Campaign Form State
  const [selectedTheme, setSelectedTheme] = useState<string>('diwali');
  const [campaignName, setCampaignName] = useState('Diwali 2026 Luxury Festive Edit');
  const [purpose, setPurpose] = useState<'hero_banner' | 'seasonal' | 'new_arrivals' | 'collection' | 'category'>('hero_banner');
  const [targetSection, setTargetSection] = useState('hero');
  const [prompt, setPrompt] = useState(THEME_PRESETS[0].presetPrompt);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '9:16'>('16:9');
  const [headline, setHeadline] = useState(THEME_PRESETS[0].headline);
  const [subheadline, setSubheadline] = useState(THEME_PRESETS[0].subheadline);
  const [ctaText, setCtaText] = useState(THEME_PRESETS[0].ctaText);
  const [ctaLink, setCtaLink] = useState(THEME_PRESETS[0].ctaLink);
  const [offerText, setOfferText] = useState(THEME_PRESETS[0].offerText);
  const [priority, setPriority] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Current Generated Image
  const [currentImage, setCurrentImage] = useState<string>(THEME_PRESETS[0].sampleImage);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Catalog State
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState<string>('ALL');

  const customUploadInputRef = useRef<HTMLInputElement | null>(null);

  // Load existing campaigns on mount
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const res = await fetch('/api/admin/campaigns');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCampaigns(json.data);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch campaigns:', err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Handle Theme Selection
  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    const preset = THEME_PRESETS.find((p) => p.id === themeId);
    if (preset) {
      setCampaignName(`${preset.name} — ${new Date().getFullYear()}`);
      setPrompt(preset.presetPrompt);
      setHeadline(preset.headline);
      setSubheadline(preset.subheadline);
      setCtaText(preset.ctaText);
      setCtaLink(preset.ctaLink);
      setOfferText(preset.offerText);
      setCurrentImage(preset.sampleImage);
    }
  };

  // Trigger DALL-E 3 Generation via backend API
  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationSuccess(null);

    try {
      const res = await fetch('/api/admin/ai/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          theme: selectedTheme,
          purpose,
          aspectRatio,
          headline,
          subheadline,
          ctaText,
          ctaLink,
          offerText,
          saveDraft: false,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        if (json.errorCode === 'credit_balance_exhausted' || json.errorCode === 'insufficient_quota') {
          setGenerationError(
            'OpenAI API billing quota exhausted. To continue using DALL-E 3, add credits at platform.openai.com/billing. In the meantime, you can upload a custom image or use curated Aveez editorial assets below.'
          );
        } else {
          setGenerationError(json.error || 'Failed to generate campaign image.');
        }
        return;
      }

      if (json.data?.imageUrl) {
        setCurrentImage(json.data.imageUrl);
        setGenerationSuccess(
          `Campaign image generated and uploaded to Backblaze B2 successfully (${json.data.storageProvider.toUpperCase()} storage).`
        );
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Error communicating with campaign generator.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Custom Image Upload to Backblaze B2
  const handleCustomUpload = async (file: File) => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target', 'campaign');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Upload failed.');
      }

      setCurrentImage(json.data.url);
      setGenerationSuccess('Custom campaign asset uploaded to Backblaze B2 successfully.');
    } catch (err: any) {
      setGenerationError(err.message || 'Failed to upload custom asset.');
    } finally {
      setIsGenerating(false);
      if (customUploadInputRef.current) customUploadInputRef.current.value = '';
    }
  };

  // Save Campaign to MongoDB
  const handleSaveCampaign = async (status: 'DRAFT' | 'ACTIVE' | 'SCHEDULED') => {
    setIsSaving(true);
    setGenerationError(null);
    setGenerationSuccess(null);

    try {
      const effectiveStatus =
        status === 'ACTIVE' && startDate && new Date(startDate) > new Date()
          ? 'SCHEDULED'
          : status;

      const payload = {
        name: campaignName.trim(),
        purpose,
        theme: selectedTheme,
        status: effectiveStatus,
        desktopImage: currentImage,
        mobileImage: currentImage,
        headline: headline.trim(),
        subheadline: subheadline.trim(),
        ctaText: ctaText.trim(),
        ctaLink: ctaLink.trim(),
        offerText: offerText.trim() || undefined,
        priority: Number(priority) || 0,
        startDate: startDate || null,
        endDate: endDate || null,
        targetSection,
      };

      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save campaign.');
      }

      setGenerationSuccess(
        `Campaign "${campaignName}" saved successfully with status: ${effectiveStatus}!`
      );
      loadCampaigns();
      if (status === 'ACTIVE') {
        setActiveTab('catalog');
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Failed to save campaign.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Status Update for Catalog
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadCampaigns();
      }
    } catch (err) {
      console.warn('Failed to update campaign status:', err);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        loadCampaigns();
      }
    } catch (err) {
      console.warn('Failed to delete campaign:', err);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    if (catalogFilter === 'ALL') return true;
    return c.status === catalogFilter;
  });

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>AI Studio</h1>
            <span className={styles.aiBadge}>
              <Sparkles size={12} /> DALL-E 3 & B2
            </span>
          </div>
          <p className={styles.subtitle}>
            Generate high-fashion editorial campaign imagery, hero banners, and seasonal drops directly to Backblaze B2 without modifying website code.
          </p>
        </div>

        {/* Studio View Tabs */}
        <div className={styles.tabNav}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'create' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Campaign
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'catalog' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            Campaigns ({campaigns.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: STUDIO GENERATOR */}
      {activeTab === 'create' && (
        <div className={styles.workspaceGrid}>
          {/* LEFT: Campaign Controls */}
          <div className={styles.studioCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>1. Campaign Theme & Prompt</h2>
              <span style={{ fontSize: '0.6875rem', color: '#71717A', fontWeight: 600 }}>
                Aveez Fashion Atelier
              </span>
            </div>

            <div className={styles.cardBody}>
              {/* Campaign Options / Themes */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Select Theme Preset</span>
                </label>
                <div className={styles.themeGrid}>
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`${styles.themePill} ${
                        selectedTheme === preset.id ? styles.themePillActive : ''
                      }`}
                      onClick={() => handleSelectTheme(preset.id)}
                    >
                      {selectedTheme === preset.id && <Check size={12} />}
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign Title & Purpose */}
              <div className={styles.rowGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Campaign Name</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g. Diwali Festive Edit 2026"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Placement Purpose</span>
                  </label>
                  <select
                    className={styles.select}
                    value={purpose}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setPurpose(val);
                      if (val === 'hero_banner') setTargetSection('hero');
                    }}
                  >
                    <option value="hero_banner">Hero Banner (Top of Homepage)</option>
                    <option value="seasonal">Seasonal Campaign Feature</option>
                    <option value="new_arrivals">New Arrivals Drop</option>
                    <option value="collection">Collection Showcase</option>
                    <option value="category">Category Promo Banner</option>
                  </select>
                </div>
              </div>

              {/* Prompt Input */}
              <div className={styles.formGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className={styles.label}>
                    <span>DALL-E 3 Fashion Prompt</span>
                  </label>
                  <span style={{ fontSize: '0.6875rem', color: '#71717A' }}>
                    Editorial Fashion Copy
                  </span>
                </div>
                <textarea
                  rows={4}
                  className={styles.textarea}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe garment textures, lighting, model poses, colors, and atmosphere..."
                />
              </div>

              {/* Aspect Ratio */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Aspect Ratio</span>
                </label>
                <div className={styles.aspectGrid}>
                  <button
                    type="button"
                    className={`${styles.aspectBtn} ${aspectRatio === '16:9' ? styles.aspectBtnActive : ''}`}
                    onClick={() => {
                      setAspectRatio('16:9');
                      setPreviewMode('desktop');
                    }}
                  >
                    <span>16:9 Landscape</span>
                    <span className={styles.aspectSub}>Desktop Hero (1792×1024)</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.aspectBtn} ${aspectRatio === '1:1' ? styles.aspectBtnActive : ''}`}
                    onClick={() => setAspectRatio('1:1')}
                  >
                    <span>1:1 Square</span>
                    <span className={styles.aspectSub}>Showcase (1024×1024)</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.aspectBtn} ${aspectRatio === '9:16' ? styles.aspectBtnActive : ''}`}
                    onClick={() => {
                      setAspectRatio('9:16');
                      setPreviewMode('mobile');
                    }}
                  >
                    <span>9:16 Portrait</span>
                    <span className={styles.aspectSub}>Mobile Banner (1024×1792)</span>
                  </button>
                </div>
              </div>

              {/* Copy & Website Overlay Text */}
              <div className={styles.rowGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Headline Text</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. WEAR DIFFERENT."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Offer / Tagline</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={offerText}
                    onChange={(e) => setOfferText(e.target.value)}
                    placeholder="e.g. BUY 1 GET 1 FREE"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Subheadline Description</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  placeholder="Architectural silhouettes & heavyweight essentials."
                />
              </div>

              <div className={styles.rowGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Button CTA Text</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="EXPLORE COLLECTION →"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Button CTA Link</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/shop"
                  />
                </div>
              </div>

              {/* Scheduling & Priority */}
              <div className={styles.rowGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Start Date (Optional)</span>
                  </label>
                  <input
                    type="date"
                    className={styles.input}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>End Date (Optional)</span>
                  </label>
                  <input
                    type="date"
                    className={styles.input}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Alerts */}
              {generationError && (
                <div className={styles.quotaWarning}>
                  <div className={styles.quotaWarningTitle}>
                    <AlertCircle size={16} />
                    <span>Generation Notice</span>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.4 }}>{generationError}</p>
                  <div className={styles.presetBar}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, alignSelf: 'center' }}>
                      Quick Editorial Fallbacks:
                    </span>
                    <button
                      type="button"
                      className={styles.presetBtn}
                      onClick={() =>
                        setCurrentImage('/uploads/campaigns/diwali/diwali-edit-banner.webp')
                      }
                    >
                      Diwali Banner
                    </button>
                    <button
                      type="button"
                      className={styles.presetBtn}
                      onClick={() => setCurrentImage('/api/media/hero/hero1.webp')}
                    >
                      Monochrome Drop
                    </button>
                    <button
                      type="button"
                      className={styles.presetBtn}
                      onClick={() =>
                        setCurrentImage('/api/media/campaigns/diwali/matching-styles.webp')
                      }
                    >
                      Matching Styles
                    </button>
                  </div>
                </div>
              )}

              {generationSuccess && (
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #6EE7B7',
                    borderRadius: '6px',
                    color: '#065F46',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{generationSuccess}</span>
                </div>
              )}

              {/* Generation & Upload Actions */}
              <div className={styles.generateActionRow}>
                <button
                  type="button"
                  className={styles.primaryGenerateBtn}
                  onClick={handleGenerateImage}
                  disabled={isGenerating || isSaving}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={15} className={styles.spin} />
                      <span>GENERATING WITH DALL-E 3...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>GENERATE CAMPAIGN BANNER (DALL-E 3)</span>
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    ref={customUploadInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleCustomUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={styles.draftBtn}
                    onClick={() => customUploadInputRef.current?.click()}
                    disabled={isGenerating || isSaving}
                  >
                    <Upload size={14} style={{ display: 'inline', marginRight: '6px' }} />
                    <span>Upload Custom Image to B2</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Interactive Preview Simulator */}
          <div className={styles.studioCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>2. Live Storefront Simulator</h2>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${previewMode === 'desktop' ? styles.tabBtnActive : ''}`}
                  onClick={() => setPreviewMode('desktop')}
                >
                  <Monitor size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Desktop
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${previewMode === 'mobile' ? styles.tabBtnActive : ''}`}
                  onClick={() => setPreviewMode('mobile')}
                >
                  <Smartphone size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Mobile
                </button>
              </div>
            </div>

            <div className={styles.cardBody}>
              {/* Simulator Screen */}
              <div
                className={`${styles.previewSimulator} ${
                  previewMode === 'mobile' ? styles.simulatorMobile : ''
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentImage}
                  alt={campaignName}
                  className={styles.previewImage}
                />

                {/* Live Text Overlay (renders true website typography without burned-in text) */}
                <div className={styles.previewOverlay}>
                  {offerText && <span className={styles.offerBadge}>{offerText}</span>}
                  <h3 className={styles.previewHeadline}>{headline || 'CAMPAIGN HEADLINE'}</h3>
                  <p className={styles.previewSubheadline}>
                    {subheadline || 'Subheadline description for the campaign banner.'}
                  </p>
                  <span className={styles.previewCtaBtn}>
                    {ctaText || 'EXPLORE COLLECTION →'}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: '#FAFAFA',
                  border: '1px solid #E4E4E7',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#71717A',
                }}
              >
                <span>Storage Key: Backblaze B2 / Cloud Storage</span>
                <span style={{ fontWeight: 600, color: '#0A0A0A' }}>
                  Target: {targetSection.toUpperCase()}
                </span>
              </div>

              {/* Publish & Draft Actions */}
              <div className={styles.secondaryActionRow}>
                <button
                  type="button"
                  className={styles.draftBtn}
                  onClick={() => handleSaveCampaign('DRAFT')}
                  disabled={isSaving || isGenerating}
                >
                  {isSaving ? 'SAVING...' : 'SAVE AS DRAFT'}
                </button>
                <button
                  type="button"
                  className={styles.publishBtn}
                  onClick={() => handleSaveCampaign('ACTIVE')}
                  disabled={isSaving || isGenerating}
                >
                  <Check size={14} />
                  <span>{isSaving ? 'PUBLISHING...' : 'APPROVE & PUBLISH'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CAMPAIGN CATALOG & SCHEDULING */}
      {activeTab === 'catalog' && (
        <div className={styles.catalogCard}>
          <div className={styles.cardHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className={styles.cardTitle}>Scheduled & Active Campaigns</h2>
              <span style={{ fontSize: '0.75rem', color: '#71717A' }}>
                ({filteredCampaigns.length} campaigns)
              </span>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {['ALL', 'ACTIVE', 'SCHEDULED', 'DRAFT', 'EXPIRED', 'ARCHIVED'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`${styles.tabBtn} ${catalogFilter === filter ? styles.tabBtnActive : ''}`}
                  onClick={() => setCatalogFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.tableContainer}>
            {loadingCampaigns ? (
              <div className={styles.emptyState}>
                <RefreshCw size={24} className={styles.spin} />
                <span>Loading campaigns from MongoDB...</span>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className={styles.emptyState}>
                <ImageIcon size={32} />
                <p style={{ margin: 0, fontWeight: 600 }}>No campaigns found.</p>
                <p style={{ margin: 0, fontSize: '0.75rem' }}>
                  Generate a campaign in AI Studio or switch the filter tab.
                </p>
                <button
                  type="button"
                  className={styles.draftBtn}
                  onClick={() => setActiveTab('create')}
                  style={{ marginTop: '12px' }}
                >
                  Create Campaign
                </button>
              </div>
            ) : (
              <table className={styles.campaignTable}>
                <thead>
                  <tr>
                    <th>Banner</th>
                    <th>Campaign Details</th>
                    <th>Theme / Section</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Schedule</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((camp) => (
                    <tr key={camp._id}>
                      <td>
                        <div className={styles.thumbnailWrapper}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={camp.desktopImage}
                            alt={camp.name}
                            className={styles.thumbnailImg}
                          />
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700, color: '#0A0A0A' }}>{camp.name}</span>
                          <span style={{ fontSize: '0.6875rem', color: '#71717A' }}>
                            {camp.headline || 'No headline set'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                            {camp.theme}
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: '#71717A' }}>
                            {camp.purpose} ({camp.targetSection})
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[`status${camp.status}`]}`}>
                          {camp.status}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{camp.priority}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.6875rem', color: '#52525B' }}>
                          {camp.startDate ? new Date(camp.startDate).toLocaleDateString('en-IN') : 'Immediate'}
                          {camp.endDate ? ` → ${new Date(camp.endDate).toLocaleDateString('en-IN')}` : ' (No expiry)'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionBtnGroup}>
                          {camp.status !== 'ACTIVE' && (
                            <button
                              type="button"
                              className={styles.tableActionBtn}
                              onClick={() => handleUpdateStatus(camp._id, 'ACTIVE')}
                              title="Publish / Activate"
                            >
                              Activate
                            </button>
                          )}
                          {camp.status === 'ACTIVE' && (
                            <button
                              type="button"
                              className={styles.tableActionBtn}
                              onClick={() => handleUpdateStatus(camp._id, 'DRAFT')}
                              title="Pause / Draft"
                            >
                              Pause
                            </button>
                          )}
                          <button
                            type="button"
                            className={`${styles.tableActionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDeleteCampaign(camp._id)}
                            title="Delete campaign"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

