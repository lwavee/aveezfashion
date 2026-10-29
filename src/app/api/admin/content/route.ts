import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSessionFromRequest } from '@/server/auth';
import { connectToDatabase } from '@/server/db/connect';
import { HomepageContent } from '@/server/models/HomepageContent';
import { Settings } from '@/server/models/Settings';
import { Campaign } from '@/server/models/Campaign';

export const runtime = 'nodejs';

// GET homepage configurations, active hero campaigns, and seasonal settings
export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN' && session.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const [content, settings, campaigns] = await Promise.all([
      HomepageContent.findOne().lean(),
      Settings.findOne().lean(),
      Campaign.find({}).sort({ priority: -1, createdAt: -1 }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        content: content || {},
        settings: settings || {},
        campaigns: campaigns || [],
      },
    });
  } catch (error: any) {
    console.error('[AdminContentAPI GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch homepage content.' },
      { status: 500 }
    );
  }
}

// POST/PUT update homepage content & trigger instant revalidation
export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN' && session.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { announcementBar, hero, aveezOriginals, brandStory, seasonalTheme } = body;

    await connectToDatabase();

    let contentDoc = await HomepageContent.findOne();
    if (!contentDoc) {
      contentDoc = new HomepageContent();
    }

    if (announcementBar) {
      contentDoc.announcementBar = {
        message: announcementBar.message ?? contentDoc.announcementBar?.message,
        ctaText: announcementBar.ctaText ?? contentDoc.announcementBar?.ctaText,
        ctaLink: announcementBar.ctaLink ?? contentDoc.announcementBar?.ctaLink,
        isActive: announcementBar.isActive !== undefined ? Boolean(announcementBar.isActive) : true,
      };
    }

    if (hero) {
      contentDoc.hero = {
        headline: hero.headline ?? contentDoc.hero?.headline,
        subheadline: hero.subheadline ?? contentDoc.hero?.subheadline,
        desktopImage: hero.desktopImage ?? contentDoc.hero?.desktopImage,
        mobileImage: hero.mobileImage ?? contentDoc.hero?.mobileImage,
        primaryCtaText: hero.primaryCtaText ?? contentDoc.hero?.primaryCtaText,
        primaryCtaLink: hero.primaryCtaLink ?? contentDoc.hero?.primaryCtaLink,
        secondaryCtaText: hero.secondaryCtaText ?? contentDoc.hero?.secondaryCtaText,
        secondaryCtaLink: hero.secondaryCtaLink ?? contentDoc.hero?.secondaryCtaLink,
      };
    }

    if (aveezOriginals) {
      contentDoc.aveezOriginals = {
        tagline: aveezOriginals.tagline ?? contentDoc.aveezOriginals?.tagline,
        headline: aveezOriginals.headline ?? contentDoc.aveezOriginals?.headline,
        description: aveezOriginals.description ?? contentDoc.aveezOriginals?.description,
        image: aveezOriginals.image ?? contentDoc.aveezOriginals?.image,
        ctaText: aveezOriginals.ctaText ?? contentDoc.aveezOriginals?.ctaText,
        ctaLink: aveezOriginals.ctaLink ?? contentDoc.aveezOriginals?.ctaLink,
      };
    }

    if (brandStory) {
      contentDoc.brandStory = {
        title: brandStory.title ?? contentDoc.brandStory?.title,
        paragraphs: Array.isArray(brandStory.paragraphs)
          ? brandStory.paragraphs
          : contentDoc.brandStory?.paragraphs,
        ctaText: brandStory.ctaText ?? contentDoc.brandStory?.ctaText,
        ctaLink: brandStory.ctaLink ?? contentDoc.brandStory?.ctaLink,
      };
    }

    await contentDoc.save();

    // If seasonal theme toggled or updated, update settings
    if (seasonalTheme) {
      let settingsDoc = await Settings.findOne();
      if (!settingsDoc) {
        settingsDoc = new Settings();
      }
      const existingSeasonal = (settingsDoc as any).seasonalTheme || {};
      (settingsDoc as any).seasonalTheme = {
        ...existingSeasonal,
        enabled: seasonalTheme.enabled !== undefined ? Boolean(seasonalTheme.enabled) : existingSeasonal.enabled,
        theme: seasonalTheme.theme || existingSeasonal.theme || 'diwali',
        heroDesktopImage: seasonalTheme.heroDesktopImage || existingSeasonal.heroDesktopImage,
        heroMobileImage: seasonalTheme.heroMobileImage || existingSeasonal.heroMobileImage,
      };
      await settingsDoc.save();
    }

    // Trigger immediate Next.js ISR revalidation
    try {
      revalidatePath('/');
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: 'Homepage content updated successfully & storefront cache revalidated.',
      data: contentDoc,
    });
  } catch (error: any) {
    console.error('[AdminContentAPI POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update homepage content.' },
      { status: 500 }
    );
  }
}
