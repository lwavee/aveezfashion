import { connectToDatabase } from '@/server/db/connect';
import { Product } from '@/server/models/Product';
import { Category } from '@/server/models/Category';
import { Collection } from '@/server/models/Collection';
import { HomepageContent } from '@/server/models/HomepageContent';
import { Settings } from '@/server/models/Settings';
import {
  initialCategories,
  initialCollections,
  initialProducts,
} from '@/server/db/seedData';
import {
  Product as IProduct,
  Category as ICategory,
  Collection as ICollection,
  HomepageContent as IHomepageContent,
  Settings as ISettings,
} from '@/types';

export class CatalogService {
  /**
   * Retrieves all active categories
   */
  static async getCategories(): Promise<ICategory[]> {
    try {
      await connectToDatabase();
      const categories = await Category.find({ isActive: true })
        .sort({ displayOrder: 1 })
        .lean();

      if (categories && categories.length > 0) {
        return JSON.parse(JSON.stringify(categories));
      }
    } catch {
      // Fallback to seed catalog if database is connecting/initializing
    }

    return initialCategories.map((c, i) => ({
      _id: `cat_${i + 1}`,
      name: c.name || '',
      slug: c.slug || '',
      description: c.description,
      image: c.image,
      displayOrder: c.displayOrder || i,
      isActive: true,
      createdAt: new Date().toISOString(),
    }));
  }

  /**
   * Retrieves all active collections
   */
  static async getCollections(): Promise<ICollection[]> {
    try {
      await connectToDatabase();
      const collections = await Collection.find({ isActive: true }).lean();
      if (collections && collections.length > 0) {
        return JSON.parse(JSON.stringify(collections));
      }
    } catch {
      // Fallback
    }

    return initialCollections.map((c, i) => ({
      _id: `col_${i + 1}`,
      title: c.title || '',
      slug: c.slug || '',
      tagline: c.tagline,
      description: c.description,
      coverImage: c.coverImage || '',
      featured: c.featured || false,
      isActive: true,
      createdAt: new Date().toISOString(),
    }));
  }

  /**
   * Query products with multi-facet filters, sorting, and pagination
   */
  static async getProducts(params: {
    categorySlug?: string;
    gender?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    search?: string;
    page?: number;
    limit?: number;
    tag?: string;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isAveezOriginal?: boolean;
  }): Promise<{ products: IProduct[]; total: number; page: number; totalPages: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;

    try {
      await connectToDatabase();

      // Build MongoDB Query Filter
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filter: any = { status: 'PUBLISHED' };

      if (params.gender) {
        filter.gender = { $in: [params.gender.toUpperCase(), 'UNISEX'] };
      }

      if (params.isBestSeller) filter.isBestSeller = true;
      if (params.isNewArrival) filter.isNewArrival = true;
      if (params.isAveezOriginal) filter.isAveezOriginal = true;

      if (params.categorySlug) {
        const cat = await Category.findOne({ slug: params.categorySlug });
        if (cat) {
          filter.category = cat._id;
        }
      }

      if (params.size) {
        filter['variants.size'] = params.size.toUpperCase();
      }

      if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        filter.basePrice = {};
        if (params.minPrice !== undefined) filter.basePrice.$gte = params.minPrice;
        if (params.maxPrice !== undefined) filter.basePrice.$lte = params.maxPrice;
      }

      if (params.search) {
        filter.$or = [
          { title: { $regex: params.search, $options: 'i' } },
          { description: { $regex: params.search, $options: 'i' } },
          { tags: { $in: [new RegExp(params.search, 'i')] } },
        ];
      }

      // Sorting
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let sortQuery: any = { createdAt: -1 };
      if (params.sort === 'price_asc') sortQuery = { basePrice: 1 };
      else if (params.sort === 'price_desc') sortQuery = { basePrice: -1 };
      else if (params.sort === 'best_selling') sortQuery = { isBestSeller: -1, averageRating: -1 };

      const total = await Product.countDocuments(filter);
      const products = await Product.find(filter)
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      if (products && products.length > 0) {
        return {
          products: JSON.parse(JSON.stringify(products)),
          total,
          page,
          totalPages: Math.ceil(total / limit),
        };
      }
    } catch {
      // Fallback to static catalog filtering
    }

    // Static fallback filtering
    let filtered = initialProducts.map((p, i) => ({
      _id: `prod_${i + 1}`,
      title: p.title || '',
      slug: p.slug || '',
      sku: p.sku || '',
      description: p.description || '',
      gender: p.gender || 'UNISEX',
      category: 'cat_1',
      basePrice: p.basePrice || 2999,
      salePrice: p.salePrice,
      images: p.images || [],
      variants: p.variants || [],
      attributes: p.attributes,
      status: 'PUBLISHED' as const,
      tags: p.tags,
      averageRating: p.averageRating || 4.8,
      totalReviews: p.totalReviews || 20,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival,
      isAveezOriginal: p.isAveezOriginal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    if (params.gender) {
      filtered = filtered.filter(
        (p) => p.gender === params.gender || p.gender === 'UNISEX'
      );
    }
    if (params.isBestSeller) filtered = filtered.filter((p) => p.isBestSeller);
    if (params.isNewArrival) filtered = filtered.filter((p) => p.isNewArrival);
    if (params.isAveezOriginal) filtered = filtered.filter((p) => p.isAveezOriginal);
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (params.sort === 'price_asc') {
      filtered.sort((a, b) => (a.salePrice || a.basePrice) - (b.salePrice || b.basePrice));
    } else if (params.sort === 'price_desc') {
      filtered.sort((a, b) => (b.salePrice || b.basePrice) - (a.salePrice || a.basePrice));
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return {
      products: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieves single product by slug
   */
  static async getProductBySlug(slug: string): Promise<IProduct | null> {
    try {
      await connectToDatabase();
      const product = await Product.findOne({ slug, status: 'PUBLISHED' })
        .populate('category')
        .lean();

      if (product) {
        return JSON.parse(JSON.stringify(product));
      }
    } catch {
      // Fallback
    }

    const found = initialProducts.find((p) => p.slug === slug);
    if (!found) return null;

    return {
      _id: `prod_seed`,
      title: found.title || '',
      slug: found.slug || '',
      sku: found.sku || '',
      description: found.description || '',
      gender: found.gender || 'UNISEX',
      category: 'cat_1',
      basePrice: found.basePrice || 2999,
      salePrice: found.salePrice,
      images: found.images || [],
      variants: found.variants || [],
      attributes: found.attributes,
      status: 'PUBLISHED',
      tags: found.tags,
      averageRating: found.averageRating || 4.9,
      totalReviews: found.totalReviews || 35,
      isFeatured: found.isFeatured,
      isBestSeller: found.isBestSeller,
      isNewArrival: found.isNewArrival,
      isAveezOriginal: found.isAveezOriginal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieves homepage content
   */
  static async getHomepageContent(): Promise<IHomepageContent> {
    try {
      await connectToDatabase();
      const content = await HomepageContent.findOne().lean();
      if (content) {
        return JSON.parse(JSON.stringify(content));
      }
    } catch {
      // Fallback
    }

    return {
      announcementBar: {
        message: 'FREE SHIPPING ON ALL ORDERS ABOVE ₹1,999',
        ctaText: 'SHOP NEW DROP',
        ctaLink: '/shop',
        isActive: true,
      },
      hero: {
        headline: 'WEAR DIFFERENT.',
        subheadline:
          'ARCHITECTURAL SILHOUETTES & HEAVYWEIGHT ESSENTIALS DESIGNED FOR INDIVIDUALITY.',
        desktopImage: '/images/heroimage1.png',
        mobileImage: '/images/heroimage1.png',
        primaryCtaText: 'SHOP MEN',
        primaryCtaLink: '/shop?gender=MEN',
        secondaryCtaText: 'SHOP WOMEN',
        secondaryCtaLink: '/shop?gender=WOMEN',
      },
      aveezOriginals: {
        tagline: 'CHAPTER 01 / SIGNATURE DROP',
        headline: 'THE ARCHITECTURAL SILHOUETTE',
        description:
          'Crafted from custom 450 GSM luxury brushed French terry cotton with relaxed drop shoulders and structured drapes. Designed and constructed in India.',
        image:
          'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1400&auto=format&fit=crop',
        ctaText: 'EXPLORE AVEEZ ORIGINALS',
        ctaLink: '/collections/aveez-originals',
      },
      brandStory: {
        title: 'INDIVIDUALITY BY DESIGN.',
        paragraphs: [
          'Aveez Fashion was founded on a simple conviction: clothing should reflect confident self-expression, not mass conformity.',
          'Every garment begins with deliberate textile engineering. We source heavyweight, combed natural fibers, test drape mechanics, and refine boxy proportions to create pieces that feel substantial the moment you put them on.',
          'No fleeting micro-trends. Just timeless, modern fashion built to endure.',
        ],
        ctaText: 'OUR STORY',
        ctaLink: '/about',
      },
    };
  }

  /**
   * Retrieves store settings
   */
  static async getSettings(): Promise<ISettings> {
    try {
      await connectToDatabase();
      const settings = await Settings.findOne().lean();
      if (settings) {
        return JSON.parse(JSON.stringify(settings));
      }
    } catch {
      // Fallback
    }

    return {
      storeName: 'AVEEZ FASHION',
      supportEmail: 'support@aveezfashion.com',
      supportPhone: '+91 98765 43210',
      currency: 'INR',
      freeShippingThreshold: 1999,
      standardShippingFee: 99,
      codEnabled: true,
      codFee: 49,
      gstPercentage: 12,
    };
  }
}
