import mongoose, { Schema, Document, Model } from 'mongoose';
import { HomepageContent as IHomepageContent } from '@/types';

export interface HomepageContentDocument extends IHomepageContent, Document {}

const HomepageContentSchema = new Schema<HomepageContentDocument>(
  {
    announcementBar: {
      message: { type: String, default: 'FREE SHIPPING ON ALL ORDERS ABOVE ₹1,999' },
      ctaText: { type: String, default: 'SHOP NEW DROP' },
      ctaLink: { type: String, default: '/shop' },
      isActive: { type: Boolean, default: true },
    },
    hero: {
      headline: { type: String, default: 'WEAR DIFFERENT.' },
      subheadline: {
        type: String,
        default: 'Architectural silhouettes & heavyweight essentials designed for individuality.',
      },
      desktopImage: {
        type: String,
        default: '/api/media/hero/hero1.webp',
      },
      mobileImage: {
        type: String,
        default: '/api/media/hero/hero1.webp',
      },
      primaryCtaText: { type: String, default: 'SHOP MEN' },
      primaryCtaLink: { type: String, default: '/shop?gender=MEN' },
      secondaryCtaText: { type: String, default: 'SHOP WOMEN' },
      secondaryCtaLink: { type: String, default: '/shop?gender=WOMEN' },
    },
    aveezOriginals: {
      tagline: { type: String, default: 'CHAPTER 01 / SIGNATURE DROP' },
      headline: { type: String, default: 'THE ARCHITECTURAL SILHOUETTE' },
      description: {
        type: String,
        default:
          'Crafted from custom 450 GSM luxury brushed French terry cotton with relaxed drop shoulders and structured drapes. Designed and constructed in India.',
      },
      image: {
        type: String,
        default: '/api/media/campaigns/signature.webp',
      },
      ctaText: { type: String, default: 'EXPLORE AVEEZ ORIGINALS' },
      ctaLink: { type: String, default: '/collections/aveez-originals' },
    },
    brandStory: {
      title: { type: String, default: 'INDIVIDUALITY BY DESIGN.' },
      paragraphs: {
        type: [String],
        default: [
          'Aveez Fashion was founded on a simple conviction: clothing should reflect confident self-expression, not mass conformity.',
          'Every garment begins with deliberate textile engineering. We source heavyweight, combed natural fibers, test drape mechanics, and refine boxy proportions to create pieces that feel substantial the moment you put them on.',
          'No fleeting micro-trends. Just timeless, modern fashion built to endure.',
        ],
      },
      ctaText: { type: String, default: 'OUR STORY' },
      ctaLink: { type: String, default: '/about' },
    },
  },
  { timestamps: true }
);

export const HomepageContent: Model<HomepageContentDocument> =
  mongoose.models.HomepageContent ||
  mongoose.model<HomepageContentDocument>('HomepageContent', HomepageContentSchema);
