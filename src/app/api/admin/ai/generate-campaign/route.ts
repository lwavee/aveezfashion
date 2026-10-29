import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/server/auth';
import { connectToDatabase } from '@/server/db/connect';
import { Campaign } from '@/server/models/Campaign';
import { AiService } from '@/server/services/aiService';

export const runtime = 'nodejs';

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
    const {
      prompt,
      theme = 'custom',
      purpose = 'hero_banner',
      aspectRatio = '16:9',
      headline,
      subheadline,
      ctaText = 'EXPLORE COLLECTION →',
      ctaLink = '/shop',
      offerText,
      saveDraft = true,
    } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required for AI image generation.' },
        { status: 400 }
      );
    }

    // Call AI Service to generate image via DALL-E 3 and save to B2
    const genResult = await AiService.generateCampaignBanner({
      prompt,
      theme,
      purpose,
      aspectRatio,
    });

    if (!genResult.success || !genResult.imageUrl) {
      return NextResponse.json(
        {
          success: false,
          error: genResult.error || 'AI image generation failed.',
          errorCode: genResult.errorCode,
        },
        { status: genResult.errorCode === 'credit_balance_exhausted' || genResult.errorCode === 'insufficient_quota' ? 429 : 500 }
      );
    }

    // If generation succeeded, save draft or pending campaign in MongoDB
    let campaignDoc = null;
    if (saveDraft) {
      await connectToDatabase();
      const campaignName = `${theme.toUpperCase()} AI Campaign — ${new Date().toLocaleDateString('en-IN')}`;
      const campaignSlug = `campaign-${Date.now()}`;

      campaignDoc = new Campaign({
        name: campaignName,
        slug: campaignSlug,
        purpose,
        theme,
        status: 'DRAFT',
        desktopImage: genResult.imageUrl,
        mobileImage: genResult.imageUrl,
        headline: headline || `${theme.toUpperCase()} EDIT`,
        subheadline: subheadline || prompt,
        ctaText,
        ctaLink,
        offerText,
        priority: 0,
        aiPrompt: prompt,
        aiModel: 'dall-e-3',
        targetSection: 'hero',
        metadata: {
          fileKey: genResult.b2FileKey,
          width: genResult.width,
          height: genResult.height,
          sizeBytes: genResult.sizeBytes,
          storageProvider: genResult.storageProvider,
          revisedPrompt: genResult.revisedPrompt,
          generatedAt: new Date().toISOString(),
        },
      });

      await campaignDoc.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign banner generated and uploaded to Backblaze B2 successfully.',
      data: {
        campaignId: campaignDoc?._id,
        imageUrl: genResult.imageUrl,
        b2FileKey: genResult.b2FileKey,
        storageProvider: genResult.storageProvider,
        width: genResult.width,
        height: genResult.height,
        sizeBytes: genResult.sizeBytes,
        revisedPrompt: genResult.revisedPrompt,
      },
    });
  } catch (error: any) {
    console.error('[AiGenerateCampaignAPI] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Campaign generation failed.' },
      { status: 500 }
    );
  }
}
