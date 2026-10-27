import mongoose, { Schema, Document, Model } from 'mongoose';
import { SeasonalThemeConfig } from '@/types';

export interface SettingsDocument extends Document {
  storeName: string;
  supportEmail: string;
  supportPhone?: string;
  currency: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  codEnabled: boolean;
  codFee: number;
  gstPercentage: number;
  seasonalTheme?: SeasonalThemeConfig;
}

const SettingsSchema = new Schema<SettingsDocument>(
  {
    storeName: { type: String, default: 'AVEEZ FASHION' },
    supportEmail: { type: String, default: 'support@aveezfashion.com' },
    supportPhone: { type: String, default: '+91 98765 43210' },
    currency: { type: String, default: 'INR' },
    freeShippingThreshold: { type: Number, default: 1999 },
    standardShippingFee: { type: Number, default: 99 },
    codEnabled: { type: Boolean, default: true },
    codFee: { type: Number, default: 49 },
    gstPercentage: { type: Number, default: 12 },
    seasonalTheme: {
      type: Schema.Types.Mixed,
      default: {
        enabled: false,
        theme: 'normal',
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
      },
    },
  },
  { timestamps: true }
);

export const Settings: Model<SettingsDocument> =
  mongoose.models.Settings || mongoose.model<SettingsDocument>('Settings', SettingsSchema);
