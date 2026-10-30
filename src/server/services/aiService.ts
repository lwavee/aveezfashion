import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { StorageService } from './storageService';
import { resolveColorHex } from '@/lib/colors';

export interface ProductAiAnalysisResult {
  title: string;
  shortDescription: string;
  description: string;
  department: 'MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES';
  categorySlug: string;
  categoryId?: string;
  subCategorySlug?: string | null;
  subCategoryId?: string | null;
  newCategorySuggestion?: string | null;
  productType: 'clothing' | 'accessories';
  colors: { name: string; hex: string }[];
  tags: string[];
  searchKeywords: string[];
  metaTitle: string;
  metaDescription: string;
  imageAlt: string;
  suggestedSlug: string;
  suggestedCollection?: string | null;
  suggestedCollectionId?: string | null;
  suggestedHomepageSection?: 'hero' | 'new_arrivals' | 'featured' | 'seasonal' | 'category';
  fabric?: string;
  fit?: string;
  stylingTips?: string;
  confidence?: number;
  sourceModel?: string;
}

export interface CampaignGenerationParams {
  prompt: string;
  theme?: string;
  purpose?: string;
  aspectRatio?: '16:9' | '1:1' | '9:16';
  quality?: 'standard' | 'hd';
}

export interface CampaignGenerationResult {
  success: boolean;
  imageUrl?: string;
  b2FileKey?: string;
  storageProvider?: 'b2' | 'local';
  width?: number;
  height?: number;
  sizeBytes?: number;
  revisedPrompt?: string;
  error?: string;
  errorCode?: string;
}

export interface UploadedImageItem {
  url: string;
  fileName?: string;
  alt?: string;
  color?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ColorGroupResult {
  colorName: string;
  colorHex: string;
  confidence: number;
  images: UploadedImageItem[];
}

export interface GroupColorsParams {
  title?: string;
  images: UploadedImageItem[];
}

export interface GroupColorsResult {
  success: boolean;
  groups: ColorGroupResult[];
  unclassified: (UploadedImageItem & { reason?: string })[];
  source: 'vision-ai' | 'computer-vision' | 'hybrid';
}

export class AiService {
  /**
   * Resolves the active OpenAI API Key from environment variables.
   */
  private static getOpenAiKey(): string | null {
    return process.env.OPENAI_API_KEY || null;
  }

  /**
   * Resolves the active Gemini API Key from environment variables.
   */
  private static getGeminiKey(): string | null {
    return process.env.GEMINI_API_KEY || null;
  }

  // =========================================================================
  // COLOR CLASSIFICATION & HYBRID COMPUTER VISION HELPERS
  // =========================================================================

  /**
   * Converts RGB [0-255] to HSV (H: 0-360, S: 0-100, V: 0-100).
   */
  public static rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;
    const v = max * 100;
    const s = max === 0 ? 0 : (d / max) * 100;
    let h = 0;

    if (d !== 0) {
      if (max === rn) {
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
      } else if (max === gn) {
        h = ((bn - rn) / d + 2) * 60;
      } else if (max === bn) {
        h = ((rn - gn) / d + 4) * 60;
      }
    }
    return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
  }

  /**
   * Normalizes any raw color phrase to standardized, consistent Aveez fashion palette labels.
   */
  public static normalizeColorName(rawName: string): string {
    const clean = (rawName || '').trim().toLowerCase();

    if (/^(sky\s*blue|light\s*blue|baby\s*blue|ice\s*blue|powder\s*blue|pastel\s*blue)$/i.test(clean)) return 'Sky Blue';
    if (/^(navy|navy\s*blue|dark\s*blue|midnight\s*blue)$/i.test(clean)) return 'Navy Blue';
    if (/^(royal\s*blue|cobalt|vivid\s*blue|bright\s*blue)$/i.test(clean)) return 'Royal Blue';
    if (/^(denim|denim\s*blue|indigo)$/i.test(clean)) return 'Denim Blue';
    if (/^(blue)$/i.test(clean)) return 'Blue';

    if (/^(white|pure\s*white|snow\s*white|optic\s*white)$/i.test(clean)) return 'White';
    if (/^(chalk\s*white)$/i.test(clean)) return 'Chalk White';
    if (/^(off\s*white|off-white|cream|ivory|ecru|eggshell|pearl)$/i.test(clean)) return 'Off White';

    if (/^(black|onyx|onyx\s*black|jet\s*black|noir)$/i.test(clean)) return 'Black';
    if (/^(charcoal|anthracite|dark\s*grey|dark\s*gray|graphite)$/i.test(clean)) return 'Charcoal';
    if (/^(slate|slate\s*gray|slate\s*grey|ash|heather\s*grey|heather\s*gray)$/i.test(clean)) return 'Slate Gray';
    if (/^(gray|grey|light\s*gray|light\s*grey|silver)$/i.test(clean)) return 'Gray';

    if (/^(olive|olive\s*green|army\s*green|military\s*green)$/i.test(clean)) return 'Olive';
    if (/^(sage|sage\s*green|moss|pistachio)$/i.test(clean)) return 'Sage Green';
    if (/^(forest\s*green|dark\s*green|pine|hunter\s*green|emerald)$/i.test(clean)) return 'Forest Green';
    if (/^(mint|mint\s*green|seafoam)$/i.test(clean)) return 'Mint Green';
    if (/^(green)$/i.test(clean)) return 'Green';

    if (/^(beige|raw\s*ecru|bone|nude)$/i.test(clean)) return 'Beige';
    if (/^(sand|light\s*beige)$/i.test(clean)) return 'Sand';
    if (/^(camel|tan|caramel|taupe)$/i.test(clean)) return 'Camel';
    if (/^(brown|coffee|chocolate|mocha|chestnut)$/i.test(clean)) return 'Brown';
    if (/^(khaki)$/i.test(clean)) return 'Khaki';

    if (/^(maroon|burgundy|wine)$/i.test(clean)) return 'Maroon';
    if (/^(red|crimson|ruby|scarlet|cherry)$/i.test(clean)) return 'Red';
    if (/^(rust|terracotta)$/i.test(clean)) return 'Rust';

    if (/^(dusty\s*rose|rose|blush|pale\s*pink)$/i.test(clean)) return 'Dusty Rose';
    if (/^(pink|bubblegum|magenta|fuchsia)$/i.test(clean)) return 'Pink';
    if (/^(purple|violet|plum)$/i.test(clean)) return 'Purple';
    if (/^(lavender|lilac|mauve)$/i.test(clean)) return 'Lavender';

    if (/^(yellow|mustard)$/i.test(clean)) return 'Yellow';
    if (/^(gold|ochre)$/i.test(clean)) return 'Mustard';
    if (/^(orange|peach|apricot|coral)$/i.test(clean)) return 'Orange';

    // Capitalize words if not matched
    return clean.replace(/\b\w/g, (l) => l.toUpperCase());
  }

  /**
   * Maps HSV and RGB color metrics to a standardized Aveez fashion shade.
   */
  private static mapHsvToFashionColor(
    h: number,
    s: number,
    v: number,
    r: number,
    g: number,
    b: number
  ): { colorName: string; colorHex: string; confidence: number; isAmbiguous: boolean } {
    // 1. Dark Neutrals (Black / Charcoal)
    if (v < 20) {
      return { colorName: 'Black', colorHex: '#0A0A0A', confidence: 0.95, isAmbiguous: false };
    }
    if (v < 34 && s < 20) {
      return { colorName: 'Charcoal', colorHex: '#334155', confidence: 0.88, isAmbiguous: false };
    }

    // 2. Light Neutrals (White / Off White / Slate Gray)
    if (v > 86 && s < 10) {
      return { colorName: 'White', colorHex: '#FFFFFF', confidence: 0.95, isAmbiguous: false };
    }
    if (v > 76 && s < 18) {
      return { colorName: 'Off White', colorHex: '#FAF9F6', confidence: 0.88, isAmbiguous: false };
    }
    if (s < 14) {
      return { colorName: 'Slate Gray', colorHex: '#64748B', confidence: 0.82, isAmbiguous: false };
    }

    // 3. Blues
    if (h >= 170 && h <= 250) {
      // Sky blue: light or pastel blue (brightness v >= 55)
      if (v >= 55 && s <= 85) {
        return { colorName: 'Sky Blue', colorHex: '#38BDF8', confidence: 0.92, isAmbiguous: false };
      }
      if (v < 40) {
        return { colorName: 'Navy Blue', colorHex: '#1E293B', confidence: 0.90, isAmbiguous: false };
      }
      return { colorName: 'Royal Blue', colorHex: '#1D4ED8', confidence: 0.88, isAmbiguous: false };
    }

    // 4. Greens & Olives
    if (h >= 65 && h <= 170) {
      if (h <= 100 && v < 60) {
        return { colorName: 'Olive', colorHex: '#708238', confidence: 0.90, isAmbiguous: false };
      }
      if (s < 35) {
        return { colorName: 'Sage Green', colorHex: '#9CA986', confidence: 0.85, isAmbiguous: false };
      }
      if (v < 45) {
        return { colorName: 'Forest Green', colorHex: '#14532D', confidence: 0.88, isAmbiguous: false };
      }
      return { colorName: 'Green', colorHex: '#16A34A', confidence: 0.85, isAmbiguous: false };
    }

    // 5. Beiges, Sands, Browns
    if (h >= 25 && h <= 55) {
      if (v > 75 && s < 30) {
        return { colorName: 'Beige', colorHex: '#E8DCC4', confidence: 0.88, isAmbiguous: false };
      }
      if (v >= 60 && s < 40) {
        return { colorName: 'Sand', colorHex: '#D8CBB5', confidence: 0.85, isAmbiguous: false };
      }
      if (v < 50 && s >= 25) {
        return { colorName: 'Brown', colorHex: '#78350F', confidence: 0.88, isAmbiguous: false };
      }
      return { colorName: 'Camel', colorHex: '#C19A6B', confidence: 0.85, isAmbiguous: false };
    }

    // 6. Reds, Maroons, Burgundies
    if (h >= 345 || h <= 18) {
      if (v < 38 && s > 25) {
        return { colorName: 'Maroon', colorHex: '#800000', confidence: 0.90, isAmbiguous: false };
      }
      if (v >= 38 && s > 45) {
        return { colorName: 'Red', colorHex: '#DC2626', confidence: 0.90, isAmbiguous: false };
      }
      return { colorName: 'Rust', colorHex: '#C2410C', confidence: 0.82, isAmbiguous: false };
    }

    // 7. Pinks & Purples
    if (h >= 300 && h < 345) {
      if (v > 70 && s < 45) {
        return { colorName: 'Dusty Rose', colorHex: '#FDA4AF', confidence: 0.85, isAmbiguous: false };
      }
      if (s >= 45) {
        return { colorName: 'Pink', colorHex: '#EC4899', confidence: 0.88, isAmbiguous: false };
      }
      return { colorName: 'Lavender', colorHex: '#C4B5FD', confidence: 0.82, isAmbiguous: false };
    }

    // 8. Yellows & Oranges
    if (h > 18 && h < 45 && s > 50) {
      return { colorName: 'Orange', colorHex: '#EA580C', confidence: 0.88, isAmbiguous: false };
    }
    if (h >= 45 && h < 65 && s > 40) {
      return { colorName: 'Yellow', colorHex: '#EAB308', confidence: 0.88, isAmbiguous: false };
    }

    return {
      colorName: 'Unclassified',
      colorHex: '#A1A1AA',
      confidence: 0.45,
      isAmbiguous: true,
    };
  }

  /**
   * Computer vision color classification using Sharp buffer pixel sampling.
   * Isolates central garment area and filters out studio/background noise.
   */
  public static async classifyBufferColor(buffer: Buffer): Promise<{
    colorName: string;
    colorHex: string;
    confidence: number;
    isAmbiguous: boolean;
  }> {
    try {
      const { data, info } = await sharp(buffer)
        .resize(100, 100, { fit: 'inside' })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const channels = info.channels;
      const width = info.width;
      const height = info.height;

      // Sample inner 60% of image to isolate garment from background
      const minX = Math.floor(width * 0.2);
      const maxX = Math.floor(width * 0.8);
      const minY = Math.floor(height * 0.15);
      const maxY = Math.floor(height * 0.85);

      let rSum = 0, gSum = 0, bSum = 0;
      let rSqSum = 0, gSqSum = 0, bSqSum = 0;
      let validPixels = 0;

      for (let y = minY; y < maxY; y++) {
        for (let x = minX; x < maxX; x++) {
          const idx = (y * width + x) * channels;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Discard pure white studio border background (> 253 on all channels)
          if (r > 253 && g > 253 && b > 253) continue;
          // Discard pure black margin (< 3 on all channels)
          if (r < 3 && g < 3 && b < 3) continue;

          rSum += r;
          gSum += g;
          bSum += b;
          rSqSum += r * r;
          gSqSum += g * g;
          bSqSum += b * b;
          validPixels++;
        }
      }

      if (validPixels < 40) {
        // Fallback to average across the entire image
        const stats = await sharp(buffer).stats();
        const avgR = Math.round(stats.channels[0]?.mean || 255);
        const avgG = Math.round(stats.channels[1]?.mean || 255);
        const avgB = Math.round(stats.channels[2]?.mean || 255);
        const stdevR = stats.channels[0]?.stdev || 0;
        const stdevG = stats.channels[1]?.stdev || 0;
        const stdevB = stats.channels[2]?.stdev || 0;
        const avgStdev = (stdevR + stdevG + stdevB) / 3;

        if (avgStdev > 40) {
          return {
            colorName: 'Unclassified',
            colorHex: '#A1A1AA',
            confidence: 0.35,
            isAmbiguous: true,
          };
        }

        const { h, s, v } = this.rgbToHsv(avgR, avgG, avgB);
        return this.mapHsvToFashionColor(h, s, v, avgR, avgG, avgB);
      }

      const avgR = Math.round(rSum / validPixels);
      const avgG = Math.round(gSum / validPixels);
      const avgB = Math.round(bSum / validPixels);

      // Calculate pixel standard deviation to catch random noise, blurry artifacts, or ambiguous patterns
      const varR = Math.max(0, rSqSum / validPixels - avgR * avgR);
      const varG = Math.max(0, gSqSum / validPixels - avgG * avgG);
      const varB = Math.max(0, bSqSum / validPixels - avgB * avgB);
      const stdDev = Math.sqrt((varR + varG + varB) / 3);

      if (stdDev > 40) {
        return {
          colorName: 'Unclassified',
          colorHex: '#A1A1AA',
          confidence: 0.35,
          isAmbiguous: true,
        };
      }

      const { h, s, v } = this.rgbToHsv(avgR, avgG, avgB);

      return this.mapHsvToFashionColor(h, s, v, avgR, avgG, avgB);
    } catch (err) {
      console.warn('[AiService] Sharp buffer analysis error:', err);
      return {
        colorName: 'Unclassified',
        colorHex: '#A1A1AA',
        confidence: 0.4,
        isAmbiguous: true,
      };
    }
  }

  /**
   * Resolves the raw Buffer for any image URL (local public/uploads or remote Backblaze B2).
   */
  public static async resolveImageBuffer(imageUrl: string): Promise<{ buffer: Buffer; mimeType: string } | null> {
    try {
      if (imageUrl.startsWith('/api/media/') || imageUrl.startsWith('/uploads/')) {
        const cleanPath = imageUrl.replace(/^\/(api\/media|uploads)\//, '');
        const localPath = path.resolve('public/uploads', cleanPath);
        if (fs.existsSync(localPath)) {
          const buf = fs.readFileSync(localPath);
          const ext = path.extname(localPath).toLowerCase().slice(1);
          const mime = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg';
          return { buffer: buf, mimeType: mime };
        }

        // In serverless / read-only production environments (like Vercel), fetch directly from Backblaze B2
        const b2Asset = await StorageService.fetchB2Asset(cleanPath);
        if (b2Asset) {
          return { buffer: b2Asset.buffer, mimeType: b2Asset.mimeType };
        }
      }

      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        const resp = await fetch(imageUrl);
        if (resp.ok) {
          const arr = await resp.arrayBuffer();
          const mime = resp.headers.get('content-type') || 'image/jpeg';
          return { buffer: Buffer.from(arr), mimeType: mime };
        }
      }

      if (imageUrl.startsWith('data:image/')) {
        const match = imageUrl.match(/^data:(image\/[a-zA-Z0-9]+);base64,(.+)$/);
        if (match) {
          return { buffer: Buffer.from(match[2], 'base64'), mimeType: match[1] };
        }
      }
    } catch (err) {
      console.warn('[AiService] Failed to resolve image buffer for:', imageUrl, err);
    }
    return null;
  }

  /**
   * Analyzes a single image using Multimodal Vision AI with Computer Vision calibration
   * to accurately detect the visible garment colour.
   */
  public static async detectImageColor(params: {
    imageUrl: string;
    productTitle?: string;
  }): Promise<{
    colorName: string;
    colorHex: string;
    confidence: number;
    isAmbiguous: boolean;
    notes?: string;
  }> {
    const { imageUrl, productTitle = 'Garment' } = params;
    const resolved = await this.resolveImageBuffer(imageUrl);

    if (!resolved) {
      return {
        colorName: 'Unclassified',
        colorHex: '#A1A1AA',
        confidence: 0,
        isAmbiguous: true,
        notes: 'Image buffer could not be downloaded or resolved.',
      };
    }

    const base64Data = resolved.buffer.toString('base64');
    const mimeType = resolved.mimeType;

    const visionPrompt = `You are a fashion catalog computer vision specialist for AVEEZ FASHION.
Analyze this product photograph of: "${productTitle}".

TASK:
Identify the precise visible color of the primary garment ("${productTitle}").

STRICT RULES:
1. ONLY identify the color of the MAIN GARMENT ("${productTitle}"). Ignore the background, mannequin, model skin/hair, jeans/pants, or styling accessories.
2. Return a standardized fashion color name from this dictionary:
   - White, Off White, Chalk White
   - Black, Onyx Black, Charcoal
   - Sky Blue, Navy Blue, Royal Blue, Denim Blue
   - Olive, Sage Green, Forest Green, Emerald Green
   - Beige, Sand, Camel, Taupe, Brown
   - Maroon, Burgundy, Wine, Crimson, Red
   - Dusty Rose, Blush Pink, Magenta, Purple, Lavender
   - Yellow, Mustard, Amber, Orange, Rust, Terracotta
3. For shades of blue: distinguish Sky Blue (light/pastel blue) from Navy Blue (dark blue) and Royal Blue (rich vivid blue).
4. For light neutrals: distinguish pure White from Off White and Beige.
5. For dark neutrals: distinguish pure Black from Charcoal and Slate Gray.
6. If the garment color is obscured, lighting is deceptive, confidence is < 70%, or the image does not clearly show an apparel item (e.g. random noise, blur, packaging, corrupted file), set "colorName": "Unclassified", "isAmbiguous": true, and "confidence": 0.3.
7. Return STRICT JSON with this exact schema:
{
  "colorName": "Sky Blue",
  "confidence": 0.95,
  "isAmbiguous": false,
  "notes": "Light pastel blue boxy tee"
}`;

    // 1. Try OpenAI GPT-4o-mini Vision
    const openAiKey = this.getOpenAiKey();
    if (openAiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openAiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: visionPrompt },
                  {
                    type: 'image_url',
                    image_url: { url: `data:${mimeType};base64,${base64Data}` },
                  },
                ],
              },
            ],
            max_tokens: 200,
            temperature: 0.1,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            const rawName = String(parsed.colorName || '').trim();
            const normalized = this.normalizeColorName(rawName);
            const isAmbiguous = Boolean(parsed.isAmbiguous || (parsed.confidence && parsed.confidence < 0.65));
            const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.9;
            const hex = resolveColorHex(normalized);

            return {
              colorName: isAmbiguous ? 'Unclassified' : normalized,
              colorHex: hex,
              confidence,
              isAmbiguous,
              notes: parsed.notes || 'Detected via OpenAI Vision',
            };
          }
        }
      } catch (openAiErr) {
        console.warn('[AiService] OpenAI color vision error, falling back:', openAiErr);
      }
    }

    // 2. Try Gemini Vision (gemini-2.5-flash)
    const geminiKey = this.getGeminiKey();
    if (geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: visionPrompt },
                  {
                    inlineData: {
                      mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            const rawName = String(parsed.colorName || '').trim();
            const normalized = this.normalizeColorName(rawName);
            const isAmbiguous = Boolean(parsed.isAmbiguous || (parsed.confidence && parsed.confidence < 0.65));
            const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.9;
            const hex = resolveColorHex(normalized);

            return {
              colorName: isAmbiguous ? 'Unclassified' : normalized,
              colorHex: hex,
              confidence,
              isAmbiguous,
              notes: parsed.notes || 'Detected via Gemini Vision',
            };
          }
        }
      } catch (geminiErr) {
        console.warn('[AiService] Gemini color vision error, falling back:', geminiErr);
      }
    }

    // 3. Fallback: Sharp Computer Vision Pixel Analysis
    const cvResult = await this.classifyBufferColor(resolved.buffer);
    return {
      colorName: cvResult.isAmbiguous ? 'Unclassified' : cvResult.colorName,
      colorHex: cvResult.colorHex,
      confidence: cvResult.confidence,
      isAmbiguous: cvResult.isAmbiguous,
      notes: 'Detected via computer-vision HSV pixel analysis',
    };
  }

  /**
   * Groups uploaded product images into color variants based on genuine image evidence.
   * Never selects colors randomly, never creates variants without photos, and segregates ambiguous images.
   */
  public static async groupProductImagesByColor(params: GroupColorsParams): Promise<GroupColorsResult> {
    const { title = 'Apparel Product', images } = params;

    if (!Array.isArray(images) || images.length === 0) {
      return {
        success: true,
        groups: [],
        unclassified: [],
        source: 'computer-vision',
      };
    }

    const groupMap = new Map<string, { colorHex: string; confidenceSum: number; count: number; images: UploadedImageItem[] }>();
    const unclassified: (UploadedImageItem & { reason?: string })[] = [];
    let usedVision = false;

    // Analyze each uploaded image individually
    for (const img of images) {
      if (!img.url) continue;

      const detected = await this.detectImageColor({
        imageUrl: img.url,
        productTitle: title,
      });

      if (detected.notes?.includes('OpenAI') || detected.notes?.includes('Gemini') || !detected.notes?.includes('computer-vision')) {
        usedVision = true;
      }

      if (detected.isAmbiguous || detected.confidence < 0.6 || detected.colorName === 'Unclassified') {
        unclassified.push({
          ...img,
          color: undefined,
          reason: detected.notes || 'Color distinction uncertain or obscured',
        });
      } else {
        const colorName = detected.colorName;
        const colorHex = detected.colorHex;

        if (!groupMap.has(colorName)) {
          groupMap.set(colorName, {
            colorHex,
            confidenceSum: detected.confidence,
            count: 1,
            images: [{ ...img, color: colorName }],
          });
        } else {
          const existing = groupMap.get(colorName)!;
          existing.confidenceSum += detected.confidence;
          existing.count += 1;
          existing.images.push({ ...img, color: colorName });
        }
      }
    }

    const groups: ColorGroupResult[] = Array.from(groupMap.entries()).map(([colorName, val]) => ({
      colorName,
      colorHex: val.colorHex,
      confidence: Number((val.confidenceSum / val.count).toFixed(2)),
      images: val.images,
    }));

    return {
      success: true,
      groups,
      unclassified,
      source: usedVision ? 'vision-ai' : 'computer-vision',
    };
  }

  // =========================================================================
  // TITLE-GROUNDED PRODUCT AI ANALYSIS & COPYWRITING
  // =========================================================================

  /**
   * Analyzes an uploaded product image and generates merchandising metadata strictly grounded
   * in the entered title, actual photos, and genuine evidence (without hallucinating specs).
   */
  static async analyzeProductImage(params: {
    imageBuffer?: Buffer;
    imageUrl?: string;
    mimeType?: string;
    title?: string;
    detectedColors?: string[] | { name: string; hex: string }[];
    department?: string;
    productType?: string;
    existingCategories: { id: string; name: string; slug: string; departments?: string[]; group?: string }[];
    existingCollections?: { id: string; title: string; slug: string }[];
    forceField?: string;
  }): Promise<ProductAiAnalysisResult> {
    const {
      imageBuffer,
      imageUrl,
      mimeType = 'image/jpeg',
      title: inputTitle,
      detectedColors = [],
      department = 'UNISEX',
      productType = 'clothing',
      existingCategories,
      existingCollections = [],
      forceField,
    } = params;

    let base64Data: string | null = null;
    let effectiveMime = mimeType;

    if (imageBuffer) {
      base64Data = imageBuffer.toString('base64');
    } else if (imageUrl) {
      const resolved = await this.resolveImageBuffer(imageUrl);
      if (resolved) {
        base64Data = resolved.buffer.toString('base64');
        effectiveMime = resolved.mimeType;
      }
    }

    if (!base64Data) {
      throw new Error('No valid image data available for AI analysis.');
    }

    // Format colors context for the prompt
    const colorNames: string[] = detectedColors.map((c) => (typeof c === 'string' ? c : c.name)).filter(Boolean);
    const colorsContext = colorNames.length > 0 ? colorNames.join(', ') : 'Determined from visual inspection';

    const categoriesList = existingCategories.slice(0, 50).map((c) => ({
      name: c.name,
      slug: c.slug,
      departments: c.departments || ['UNISEX'],
      group: c.group || 'General',
    }));

    const collectionsList = existingCollections.map((col) => ({
      title: col.title,
      slug: col.slug,
    }));

    // Construct Title-Grounded Prompt
    const groundedTitle = inputTitle?.trim() || '';
    const titleInstruction = groundedTitle
      ? `PRIMARY GROUND TRUTH: The administrator has entered the exact product title: "${groundedTitle}".
YOU MUST USE THIS EXACT TITLE: "${groundedTitle}". Do NOT change, replace, or invent another product name.`
      : `Provide an evocative, minimalist luxury product title appropriate for Aveez Fashion.`;

    const systemPrompt = `You are the Senior Catalog Merchandiser for AVEEZ FASHION (luxury contemporary Indian streetwear & architectural apparel).

${titleInstruction}
Available Garment Colors: ${colorsContext}
Department: ${department}
Product Type: ${productType}

Catalog Categories:
${JSON.stringify(categoriesList, null, 2)}

Collections:
${JSON.stringify(collectionsList, null, 2)}

STRICT TITLE & EVIDENCE GROUNDING RULES:
1. TITLE: ${groundedTitle ? `The title is strictly "${groundedTitle}". Do NOT alter it.` : `Generate a clean, evocative product name.`}
2. EVIDENCE-BASED COPYWRITING:
   - shortDescription: 1-sentence punchy, elegant description grounded in ${groundedTitle || 'the garment'} and visual drape.
   - description: 2-3 paragraphs of elegant architectural luxury copy highlighting the silhouette and styling versatility.
   - NO FABRICATION OF SPECS: DO NOT invent fabric composition, GSM (e.g. do not invent 450 GSM unless visible or in title), thread counts, mill origins, or unsupported technical certifications. If fabric is not visually evident, leave fabric as null or simple 'Cotton' (subject to confirmation).
   - fit: Infer from title (e.g. 'Boxy Fit' for a Boxy Fit Tee) or visible silhouette (e.g. 'Relaxed Fit').
   - tags: 4-8 style, occasion, and silhouette tags directly relevant to ${groundedTitle || 'the garment'}.
   - searchKeywords: 4-6 high-intent search terms based on ${groundedTitle || 'the product'}.
   - metaTitle: SEO title (< 60 chars) incorporating "${groundedTitle || 'AVEEZ FASHION'}".
   - metaDescription: SEO meta description (< 160 chars).
   - imageAlt: Accessibility alt text for "${groundedTitle || 'product'}".
3. CATEGORY MATCHING: Select the closest matching categorySlug from the catalog list based on ${groundedTitle ? `"${groundedTitle}"` : 'the garment'}. If none match, provide newCategorySuggestion.

Return pure JSON matching this exact structure:
{
  "title": "${groundedTitle || 'string'}",
  "shortDescription": "string",
  "description": "string",
  "department": "${department}",
  "categorySlug": "string",
  "subCategorySlug": "string" | null,
  "newCategorySuggestion": "string" | null,
  "productType": "${productType}",
  "colors": [{ "name": "string", "hex": "#RRGGBB" }],
  "tags": ["string"],
  "searchKeywords": ["string"],
  "metaTitle": "string",
  "metaDescription": "string",
  "imageAlt": "string",
  "suggestedSlug": "string",
  "suggestedCollection": "string" | null,
  "suggestedHomepageSection": "new_arrivals" | "featured" | "seasonal" | "hero" | "category",
  "fabric": "string" | null,
  "fit": "string" | null,
  "stylingTips": "string"
}`;

    // 1. Primary: Try OpenAI GPT-4o-mini Vision with structured JSON
    const openAiKey = this.getOpenAiKey();
    if (openAiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openAiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: [
                  { type: 'text', text: `Analyze this garment image and generate product metadata in structured JSON. Product title: "${groundedTitle || 'Apparel Piece'}"` },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${effectiveMime};base64,${base64Data}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 1500,
            temperature: 0.15,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return this.normalizeAnalysisResult(
              parsed,
              existingCategories,
              existingCollections,
              'openai-gpt-4o-mini',
              groundedTitle,
              colorNames
            );
          }
        }
      } catch (openAiErr) {
        console.warn('[AiService] OpenAI analysis error, falling back to Gemini:', openAiErr);
      }
    }

    // 2. Fallback: Try Gemini Vision (gemini-2.5-flash)
    const geminiKey = this.getGeminiKey();
    if (geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  {
                    inlineData: {
                      mimeType: effectiveMime,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.15,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return this.normalizeAnalysisResult(
              parsed,
              existingCategories,
              existingCollections,
              'gemini-2.5-flash',
              groundedTitle,
              colorNames
            );
          }
        }
      } catch (geminiErr) {
        console.warn('[AiService] Gemini analysis error, falling back to heuristic:', geminiErr);
      }
    }

    // 3. Resilient Fallback: Fashion Heuristic Engine
    return this.generateFallbackAnalysis(
      existingCategories,
      existingCollections,
      groundedTitle,
      colorNames,
      department as any,
      productType as any
    );
  }

  /**
   * Generates a high-fashion editorial campaign image via DALL-E 3 and uploads to Backblaze B2.
   */
  static async generateCampaignBanner(
    params: CampaignGenerationParams
  ): Promise<CampaignGenerationResult> {
    const openAiKey = this.getOpenAiKey();
    if (!openAiKey) {
      return {
        success: false,
        error: 'OpenAI API Key is not configured. Please add OPENAI_API_KEY to .env.local.',
        errorCode: 'MISSING_API_KEY',
      };
    }

    const refinedPrompt = `Luxury Indian fashion editorial campaign photograph for AVEEZ FASHION. ${params.prompt.trim()}.
High-fashion editorial aesthetic, 35mm film photography, natural golden hour ambient lighting, realistic fabric textures, impeccably tailored silhouettes, natural relaxed posture.
CRITICAL: Clean composition with NO watermarks, NO text overlay, NO logos, NO artificial CGI plastic look, anatomically correct hands and features.`;

    const size =
      params.aspectRatio === '9:16'
        ? '1024x1792'
        : params.aspectRatio === '1:1'
        ? '1024x1024'
        : '1792x1024';

    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: refinedPrompt,
          n: 1,
          size: size as any,
          quality: params.quality || 'standard',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.error?.message || 'OpenAI image generation request failed.';
        const errorCode = data?.error?.code || 'OPENAI_ERROR';
        console.error('[AiService] DALL-E 3 generation error:', res.status, data);

        return {
          success: false,
          error: errorMsg,
          errorCode,
        };
      }

      let rawBuffer: Buffer;
      if (data.data?.[0]?.b64_json) {
        rawBuffer = Buffer.from(data.data[0].b64_json, 'base64');
      } else if (data.data?.[0]?.url) {
        const imageRes = await fetch(data.data[0].url);
        if (!imageRes.ok) throw new Error('Failed to download generated image from OpenAI.');
        const arr = await imageRes.arrayBuffer();
        rawBuffer = Buffer.from(arr);
      } else {
        return {
          success: false,
          error: 'No image data returned from generation API.',
          errorCode: 'EMPTY_RESPONSE',
        };
      }

      // Convert Base64/Raw buffer to optimized WebP
      const webpBuffer = await sharp(rawBuffer)
        .webp({ quality: 88, effort: 5 })
        .toBuffer();

      const meta = await sharp(webpBuffer).metadata();
      const themeSlug = (params.theme || 'campaign').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const fileKey = `campaigns/ai/${themeSlug}-${Date.now()}.webp`;

      // Upload to Backblaze B2 & local upload cache
      const uploadResult = await StorageService.uploadCampaignAsset(
        webpBuffer,
        fileKey,
        'image/webp'
      );

      return {
        success: true,
        imageUrl: uploadResult.url,
        b2FileKey: fileKey,
        storageProvider: uploadResult.storageProvider,
        width: meta.width || (params.aspectRatio === '9:16' ? 1024 : 1792),
        height: meta.height || (params.aspectRatio === '9:16' ? 1792 : 1024),
        sizeBytes: webpBuffer.length,
        revisedPrompt: data.data?.[0]?.revised_prompt || refinedPrompt,
      };
    } catch (err: any) {
      console.error('[AiService] Exception in generateCampaignBanner:', err);
      return {
        success: false,
        error: err.message || 'Image generation service exception.',
        errorCode: 'EXCEPTION',
      };
    }
  }

  /**
   * Normalizes AI output into exact schema expectations and enforces title grounding.
   */
  private static normalizeAnalysisResult(
    raw: any,
    existingCategories: { id: string; name: string; slug: string; departments?: string[]; group?: string }[],
    existingCollections: { id: string; title: string; slug: string }[],
    sourceModel: string,
    groundedTitle?: string,
    groundedColors?: string[]
  ): ProductAiAnalysisResult {
    const rawCategory = String(raw.categorySlug || raw.category || '').toLowerCase().trim();
    const matchedCategory = existingCategories.find(
      (c) =>
        c.slug.toLowerCase() === rawCategory ||
        c.name.toLowerCase() === rawCategory ||
        c.slug.toLowerCase().includes(rawCategory) ||
        rawCategory.includes(c.slug.toLowerCase())
    );

    let matchedSubCategory = null;
    if (raw.subCategorySlug) {
      const subSlug = String(raw.subCategorySlug).toLowerCase().trim();
      matchedSubCategory = existingCategories.find(
        (c) => c.slug.toLowerCase() === subSlug || c.name.toLowerCase() === subSlug
      );
    }

    let matchedCollection = null;
    if (raw.suggestedCollection) {
      const colSlug = String(raw.suggestedCollection).toLowerCase().trim();
      matchedCollection = existingCollections.find(
        (col) => col.slug.toLowerCase() === colSlug || col.title.toLowerCase().includes(colSlug)
      );
    }

    // Title Priority: groundedTitle > raw.title > fallback
    const title = (groundedTitle || raw.title || 'Architectural Luxury Garment').trim();
    const slug =
      String(raw.suggestedSlug || raw.slug || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Colors: if groundedColors supplied, use those; else use raw.colors; else empty (NO random Onyx Black!)
    let colors: { name: string; hex: string }[] = [];
    if (Array.isArray(groundedColors) && groundedColors.length > 0) {
      colors = groundedColors.map((name) => ({
        name,
        hex: resolveColorHex(name),
      }));
    } else if (Array.isArray(raw.colors) && raw.colors.length > 0) {
      colors = raw.colors.map((c: any) => {
        const name = typeof c === 'string' ? c : (c.name || 'White');
        const hex = typeof c === 'object' && c.hex ? c.hex : resolveColorHex(name);
        return { name, hex };
      });
    }

    const tags = Array.isArray(raw.tags) && raw.tags.length > 0
      ? raw.tags.map((t: any) => String(t).toLowerCase().trim()).filter(Boolean)
      : ['luxury', 'contemporary', 'aveez-signature'];

    const searchKeywords = Array.isArray(raw.searchKeywords) && raw.searchKeywords.length > 0
      ? raw.searchKeywords.map((k: any) => String(k).trim())
      : [title.toLowerCase(), 'aveez fashion', 'luxury apparel'];

    const validSections = ['hero', 'new_arrivals', 'featured', 'seasonal', 'category'];
    const suggestedHomepageSection = validSections.includes(raw.suggestedHomepageSection)
      ? raw.suggestedHomepageSection
      : 'new_arrivals';

    // Infer fit if not provided
    let fit = raw.fit ? String(raw.fit).trim() : '';
    if (!fit && title.toLowerCase().includes('boxy')) fit = 'Boxy Fit';
    else if (!fit && title.toLowerCase().includes('oversized')) fit = 'Oversized Fit';
    else if (!fit && title.toLowerCase().includes('slim')) fit = 'Tailored Slim Fit';

    return {
      title,
      shortDescription: String(raw.shortDescription || `${title} crafted for distinct contemporary presence.`).trim(),
      description: String(
        raw.description ||
          `${title} designed with precision proportions and refined finishing. Retains structural elegance across daily wear.`
      ).trim(),
      department: ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'].includes(raw.department)
        ? raw.department
        : 'UNISEX',
      categorySlug: matchedCategory ? matchedCategory.slug : (existingCategories[0]?.slug || 'men'),
      categoryId: matchedCategory ? matchedCategory.id : (existingCategories[0]?.id || undefined),
      subCategorySlug: matchedSubCategory ? matchedSubCategory.slug : null,
      subCategoryId: matchedSubCategory ? matchedSubCategory.id : null,
      newCategorySuggestion:
        !matchedCategory && raw.newCategorySuggestion ? String(raw.newCategorySuggestion).trim() : null,
      productType: raw.productType === 'accessories' ? 'accessories' : 'clothing',
      colors,
      tags,
      searchKeywords,
      metaTitle: String(raw.metaTitle || `${title} | AVEEZ FASHION`).slice(0, 60),
      metaDescription: String(
        raw.metaDescription || raw.shortDescription || `Discover ${title} at AVEEZ FASHION.`
      ).slice(0, 160),
      imageAlt: String(raw.imageAlt || `AVEEZ FASHION — ${title}`).trim(),
      suggestedSlug: slug,
      suggestedCollection: matchedCollection ? matchedCollection.slug : null,
      suggestedCollectionId: matchedCollection ? matchedCollection.id : null,
      suggestedHomepageSection,
      fabric: raw.fabric ? String(raw.fabric).trim() : '',
      fit,
      stylingTips: raw.stylingTips ? String(raw.stylingTips).trim() : '',
      confidence: 0.95,
      sourceModel,
    };
  }

  /**
   * Fallback generation when external AI endpoints are unreachable.
   * Respects input title and detected colors rather than hallucinating random defaults.
   */
  private static generateFallbackAnalysis(
    existingCategories: { id: string; name: string; slug: string }[],
    existingCollections: { id: string; title: string; slug: string }[] = [],
    groundedTitle?: string,
    groundedColors?: string[],
    department: 'MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES' = 'UNISEX',
    productType: 'clothing' | 'accessories' = 'clothing'
  ): ProductAiAnalysisResult {
    const defaultCat = existingCategories[0] || { id: 'default', slug: 'men', name: 'Men' };
    const defaultCol = existingCollections[0];
    const timestamp = Date.now();

    const title = groundedTitle?.trim() || 'Architectural Contemporary Garment';
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${timestamp.toString(36).slice(-4)}`;

    const colors = Array.isArray(groundedColors) && groundedColors.length > 0
      ? groundedColors.map((name) => ({ name, hex: resolveColorHex(name) }))
      : [];

    let fit = '';
    if (title.toLowerCase().includes('boxy')) fit = 'Boxy Fit';
    else if (title.toLowerCase().includes('oversized')) fit = 'Oversized Fit';
    else if (title.toLowerCase().includes('relaxed')) fit = 'Relaxed Fit';

    return {
      title,
      shortDescription: `${title} designed with clean architectural lines for modern individuality.`,
      description: `${title} crafted with meticulous attention to silhouette, structural balance, and refined finishing. Engineered for effortless comfort and versatility across diverse styling aesthetics.`,
      department,
      categorySlug: defaultCat.slug,
      categoryId: defaultCat.id,
      subCategorySlug: null,
      subCategoryId: null,
      newCategorySuggestion: null,
      productType,
      colors,
      tags: ['luxury', 'contemporary', 'aveez-signature'],
      searchKeywords: [title.toLowerCase(), 'aveez fashion', 'luxury apparel'],
      metaTitle: `${title} | AVEEZ FASHION`.slice(0, 60),
      metaDescription: `Discover ${title} at AVEEZ FASHION.`.slice(0, 160),
      imageAlt: `AVEEZ FASHION — ${title}`,
      suggestedSlug: slug,
      suggestedCollection: defaultCol ? defaultCol.slug : null,
      suggestedCollectionId: defaultCol ? defaultCol.id : null,
      suggestedHomepageSection: 'new_arrivals',
      fabric: '',
      fit,
      stylingTips: 'Pair with tailored trousers or clean minimalist bottoms.',
      confidence: 0.85,
      sourceModel: 'aveez-fashion-merchandising-engine',
    };
  }
}
