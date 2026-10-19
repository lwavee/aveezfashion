import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env.local
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

type Department = 'MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES';

interface CatalogCategoryDef {
  name: string;
  slug: string;
  group: string;
  departments: Department[];
  description?: string;
}

// Complete Category Catalog Definition
// Notice: Categories shared across departments are unified into a single document with multi-department associations!
const CATALOG_CATEGORIES: CatalogCategoryDef[] = [
  // Existing baseline categories (must preserve exact slugs!)
  { name: 'Men', slug: 'men', group: 'General', departments: ['MEN'] },
  { name: 'Women', slug: 'women', group: 'General', departments: ['WOMEN'] },
  { name: 'Accessories', slug: 'accessories', group: 'General', departments: ['ACCESSORIES'], description: 'The Finishing Touch curated accessory capsules' },
  { name: 'Oversized T-Shirts', slug: 'oversized-tees', group: 'Tops', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Hoodies', slug: 'hoodies', group: 'Tops', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Bottoms', slug: 'bottoms', group: 'Bottoms', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Shirts', slug: 'shirts', group: 'Tops', departments: ['MEN', 'WOMEN'] },
  { name: 'Hairbands', slug: 'hairbands', group: 'Hair Accessories', departments: ['ACCESSORIES'] },
  { name: 'Hair Clips', slug: 'hair-clips', group: 'Hair Accessories', departments: ['ACCESSORIES'] },
  { name: 'Claw Clips', slug: 'claw-clips', group: 'Hair Accessories', departments: ['ACCESSORIES'] },
  { name: 'Keychains', slug: 'keychains', group: 'Charms and Small Accessories', departments: ['ACCESSORIES'] },
  { name: 'Bag Charms', slug: 'bag-charms', group: 'Charms and Small Accessories', departments: ['ACCESSORIES'] },
  { name: 'Matching Sets', slug: 'matching-sets', group: 'Sets and Gifts', departments: ['WOMEN', 'ACCESSORIES'] },

  // --- TOPS (MEN, WOMEN, UNISEX) ---
  { name: 'T-Shirts', slug: 't-shirts', group: 'Tops', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Basic T-Shirts', slug: 'basic-t-shirts', group: 'Tops', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Graphic T-Shirts', slug: 'graphic-t-shirts', group: 'Tops', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Polo T-Shirts', slug: 'polo-t-shirts', group: 'Tops', departments: ['MEN'] },
  { name: 'Casual Shirts', slug: 'casual-shirts', group: 'Tops', departments: ['MEN'] },
  { name: 'Formal Shirts', slug: 'formal-shirts', group: 'Tops', departments: ['MEN'] },
  { name: 'Linen Shirts', slug: 'linen-shirts', group: 'Tops', departments: ['MEN'] },
  { name: 'Printed Shirts', slug: 'printed-shirts', group: 'Tops', departments: ['MEN'] },
  { name: 'Tank Tops', slug: 'tank-tops', group: 'Tops', departments: ['MEN', 'WOMEN'] },
  { name: 'Henley T-Shirts', slug: 'henley-t-shirts', group: 'Tops', departments: ['MEN'] },
  { name: 'Sweatshirts', slug: 'sweatshirts', group: 'Tops', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Sweaters', slug: 'sweaters', group: 'Tops', departments: ['MEN', 'WOMEN'] },
  { name: 'Cardigans', slug: 'cardigans', group: 'Tops', departments: ['MEN', 'WOMEN'] },
  { name: 'Jackets', slug: 'jackets', group: 'Tops', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Blazers', slug: 'blazers', group: 'Tops', departments: ['MEN', 'WOMEN'] },
  { name: 'Coats', slug: 'coats', group: 'Tops', departments: ['MEN', 'WOMEN'] },
  { name: 'Vests', slug: 'vests', group: 'Tops', departments: ['MEN'] },
  { name: 'Crop Tops', slug: 'crop-tops', group: 'Tops', departments: ['WOMEN'] },
  { name: 'Blouses', slug: 'blouses', group: 'Tops', departments: ['WOMEN'] },
  { name: 'Camisoles', slug: 'camisoles', group: 'Tops', departments: ['WOMEN'] },
  { name: 'Bodysuits', slug: 'bodysuits', group: 'Tops', departments: ['WOMEN'] },
  { name: 'Tunics', slug: 'tunics', group: 'Tops', departments: ['WOMEN'] },

  // --- BOTTOMS (MEN, WOMEN, UNISEX) ---
  { name: 'Jeans', slug: 'jeans', group: 'Bottoms', departments: ['MEN', 'WOMEN'] },
  { name: 'Slim-Fit Jeans', slug: 'slim-fit-jeans', group: 'Bottoms', departments: ['MEN'] },
  { name: 'Straight-Fit Jeans', slug: 'straight-fit-jeans', group: 'Bottoms', departments: ['MEN', 'WOMEN'] },
  { name: 'Wide-Leg Jeans', slug: 'wide-leg-jeans', group: 'Bottoms', departments: ['MEN', 'WOMEN'] },
  { name: 'Trousers', slug: 'trousers', group: 'Bottoms', departments: ['MEN', 'WOMEN'] },
  { name: 'Formal Pants', slug: 'formal-pants', group: 'Bottoms', departments: ['MEN', 'WOMEN'] },
  { name: 'Cargo Pants', slug: 'cargo-pants', group: 'Bottoms', departments: ['MEN', 'WOMEN'] },
  { name: 'Joggers', slug: 'joggers', group: 'Bottoms', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Track Pants', slug: 'track-pants', group: 'Bottoms', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Chinos', slug: 'chinos', group: 'Bottoms', departments: ['MEN'] },
  { name: 'Shorts', slug: 'shorts', group: 'Bottoms', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Denim Shorts', slug: 'denim-shorts', group: 'Bottoms', departments: ['MEN', 'WOMEN'] },
  { name: 'Sweatpants', slug: 'sweatpants', group: 'Bottoms', departments: ['MEN'] },
  { name: 'Leggings', slug: 'leggings', group: 'Bottoms', departments: ['WOMEN'] },
  { name: 'Jeggings', slug: 'jeggings', group: 'Bottoms', departments: ['WOMEN'] },
  { name: 'Skirts', slug: 'skirts', group: 'Bottoms', departments: ['WOMEN'] },
  { name: 'Palazzo Pants', slug: 'palazzo-pants', group: 'Bottoms', departments: ['WOMEN'] },

  // --- DRESSES & ONE-PIECE OUTFITS (WOMEN) ---
  { name: 'Casual Dresses', slug: 'casual-dresses', group: 'Dresses and One-Piece Outfits', departments: ['WOMEN'] },
  { name: 'Midi Dresses', slug: 'midi-dresses', group: 'Dresses and One-Piece Outfits', departments: ['WOMEN'] },
  { name: 'Maxi Dresses', slug: 'maxi-dresses', group: 'Dresses and One-Piece Outfits', departments: ['WOMEN'] },
  { name: 'Mini Dresses', slug: 'mini-dresses', group: 'Dresses and One-Piece Outfits', departments: ['WOMEN'] },
  { name: 'Bodycon Dresses', slug: 'bodycon-dresses', group: 'Dresses and One-Piece Outfits', departments: ['WOMEN'] },
  { name: 'Shirt Dresses', slug: 'shirt-dresses', group: 'Dresses and One-Piece Outfits', departments: ['WOMEN'] },
  { name: 'Jumpsuits', slug: 'jumpsuits', group: 'Dresses and One-Piece Outfits', departments: ['WOMEN'] },
  { name: 'Rompers', slug: 'rompers', group: 'Dresses and One-Piece Outfits', departments: ['WOMEN'] },
  { name: 'Playsuits', slug: 'playsuits', group: 'Dresses and One-Piece Outfits', departments: ['WOMEN'] },

  // --- OUTFITS AND ETHNIC WEAR (MEN & WOMEN) ---
  { name: 'Co-ord Sets', slug: 'co-ord-sets', group: 'Outfits and Ethnic Wear', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Tracksuits', slug: 'tracksuits', group: 'Outfits and Ethnic Wear', departments: ['MEN', 'WOMEN', 'UNISEX'] },
  { name: 'Two-Piece Sets', slug: 'two-piece-sets', group: 'Outfits and Ethnic Wear', departments: ['MEN'] },
  { name: 'Three-Piece Sets', slug: 'three-piece-sets', group: 'Outfits and Ethnic Wear', departments: ['MEN'] },
  { name: 'Kurtas', slug: 'kurtas', group: 'Outfits and Ethnic Wear', departments: ['MEN', 'WOMEN'] },
  { name: 'Kurta-Pajamas', slug: 'kurta-pajamas', group: 'Outfits and Ethnic Wear', departments: ['MEN'] },
  { name: 'Kurta Sets', slug: 'kurta-sets', group: 'Ethnic and Festive Wear', departments: ['WOMEN'] },
  { name: 'Salwar Suits', slug: 'salwar-suits', group: 'Ethnic and Festive Wear', departments: ['WOMEN'] },
  { name: 'Anarkali Suits', slug: 'anarkali-suits', group: 'Ethnic and Festive Wear', departments: ['WOMEN'] },
  { name: 'Ethnic Co-ord Sets', slug: 'ethnic-co-ord-sets', group: 'Ethnic and Festive Wear', departments: ['WOMEN'] },
  { name: 'Lehengas', slug: 'lehengas', group: 'Ethnic and Festive Wear', departments: ['WOMEN'] },
  { name: 'Sarees', slug: 'sarees', group: 'Ethnic and Festive Wear', departments: ['WOMEN'] },
  { name: 'Dupattas', slug: 'dupattas', group: 'Ethnic and Festive Wear', departments: ['WOMEN'] },
  { name: 'Sherwanis', slug: 'sherwanis', group: 'Outfits and Ethnic Wear', departments: ['MEN'] },
  { name: 'Ethnic Jackets', slug: 'ethnic-jackets', group: 'Outfits and Ethnic Wear', departments: ['MEN'] },
  { name: 'Festive Wear', slug: 'festive-wear', group: 'Outfits and Ethnic Wear', departments: ['MEN', 'WOMEN'] },
  { name: 'Wedding Wear', slug: 'wedding-wear', group: 'Outfits and Ethnic Wear', departments: ['MEN', 'WOMEN'] },

  // --- INNERWEAR, LOUNGEWEAR & NIGHTWEAR ---
  { name: 'Briefs', slug: 'briefs', group: 'Innerwear and Nightwear', departments: ['MEN', 'WOMEN'] },
  { name: 'Boxers', slug: 'boxers', group: 'Innerwear and Nightwear', departments: ['MEN'] },
  { name: 'Trunks', slug: 'trunks', group: 'Innerwear and Nightwear', departments: ['MEN'] },
  { name: 'Innerwear Sets', slug: 'innerwear-sets', group: 'Innerwear and Nightwear', departments: ['MEN'] },
  { name: 'Pyjamas', slug: 'pyjamas', group: 'Innerwear and Nightwear', departments: ['MEN'] },
  { name: 'Pyjama Sets', slug: 'pyjama-sets', group: 'Co-ords, Nightwear and Innerwear', departments: ['WOMEN'] },
  { name: 'Night Suits', slug: 'night-suits', group: 'Innerwear and Nightwear', departments: ['MEN', 'WOMEN'] },
  { name: 'Night Dresses', slug: 'night-dresses', group: 'Co-ords, Nightwear and Innerwear', departments: ['WOMEN'] },
  { name: 'Loungewear', slug: 'loungewear', group: 'Co-ords, Nightwear and Innerwear', departments: ['WOMEN'] },
  { name: 'Bathrobes', slug: 'bathrobes', group: 'Innerwear and Nightwear', departments: ['MEN'] },
  { name: 'Bras', slug: 'bras', group: 'Co-ords, Nightwear and Innerwear', departments: ['WOMEN'] },
  { name: 'Shapewear', slug: 'shapewear', group: 'Co-ords, Nightwear and Innerwear', departments: ['WOMEN'] },
  { name: 'Socks', slug: 'socks', group: 'Fashion Essentials', departments: ['MEN', 'WOMEN', 'ACCESSORIES'] },

  // --- UNISEX SPECIFICS ---
  { name: 'Unisex Co-ord Sets', slug: 'unisex-co-ord-sets', group: 'Outfits and Ethnic Wear', departments: ['UNISEX'] },
  { name: 'Couple T-Shirts', slug: 'couple-t-shirts', group: 'Tops', departments: ['UNISEX'] },
  { name: 'Matching Couple Outfits', slug: 'matching-couple-outfits', group: 'Outfits and Ethnic Wear', departments: ['UNISEX'] },

  // --- ACCESSORIES: HAIR ACCESSORIES ---
  { name: 'Headbands', slug: 'headbands', group: 'Hair Accessories', departments: ['ACCESSORIES'] },
  { name: 'Scrunchies', slug: 'scrunchies', group: 'Hair Accessories', departments: ['ACCESSORIES'] },
  { name: 'Hair Ties', slug: 'hair-ties', group: 'Hair Accessories', departments: ['ACCESSORIES'] },
  { name: 'Hair Bows', slug: 'hair-bows', group: 'Hair Accessories', departments: ['ACCESSORIES'] },
  { name: 'Hair Pins', slug: 'hair-pins', group: 'Hair Accessories', departments: ['ACCESSORIES'] },
  { name: 'Floral Hair Accessories', slug: 'floral-hair-accessories', group: 'Hair Accessories', departments: ['ACCESSORIES'] },

  // --- ACCESSORIES: CHARMS AND SMALL ACCESSORIES ---
  { name: 'Crochet Charms', slug: 'crochet-charms', group: 'Charms and Small Accessories', departments: ['ACCESSORIES'] },
  { name: 'Phone Charms', slug: 'phone-charms', group: 'Charms and Small Accessories', departments: ['ACCESSORIES'] },
  { name: 'Decorative Charms', slug: 'decorative-charms', group: 'Charms and Small Accessories', departments: ['ACCESSORIES'] },
  { name: 'Handmade Flower Accessories', slug: 'handmade-flower-accessories', group: 'Charms and Small Accessories', departments: ['ACCESSORIES'] },

  // --- ACCESSORIES: FASHION ESSENTIALS ---
  { name: 'Caps', slug: 'caps', group: 'Fashion Essentials', departments: ['ACCESSORIES'] },
  { name: 'Hats', slug: 'hats', group: 'Fashion Essentials', departments: ['ACCESSORIES'] },
  { name: 'Belts', slug: 'belts', group: 'Fashion Essentials', departments: ['ACCESSORIES'] },
  { name: 'Wallets', slug: 'wallets', group: 'Fashion Essentials', departments: ['ACCESSORIES'] },
  { name: 'Tote Bags', slug: 'tote-bags', group: 'Fashion Essentials', departments: ['ACCESSORIES'] },
  { name: 'Mini Bags', slug: 'mini-bags', group: 'Fashion Essentials', departments: ['ACCESSORIES'] },
  { name: 'Sling Bags', slug: 'sling-bags', group: 'Fashion Essentials', departments: ['ACCESSORIES'] },
  { name: 'Scarves', slug: 'scarves', group: 'Fashion Essentials', departments: ['ACCESSORIES'] },
  { name: 'Sunglasses', slug: 'sunglasses', group: 'Fashion Essentials', departments: ['ACCESSORIES'] },
  { name: 'Jewellery', slug: 'jewellery', group: 'Fashion Essentials', departments: ['ACCESSORIES'] },

  // --- ACCESSORIES: SETS AND GIFTS ---
  { name: 'Couple Accessories', slug: 'couple-accessories', group: 'Sets and Gifts', departments: ['ACCESSORIES'] },
  { name: 'Gift Sets', slug: 'gift-sets', group: 'Sets and Gifts', departments: ['ACCESSORIES'] },
  { name: 'Handmade Bouquets', slug: 'handmade-bouquets', group: 'Sets and Gifts', departments: ['ACCESSORIES'] },
  { name: 'Hair Accessory Sets', slug: 'hair-accessory-sets', group: 'Sets and Gifts', departments: ['ACCESSORIES'] },
  { name: 'Clothing + Accessory Bundles', slug: 'clothing-accessory-bundles', group: 'Sets and Gifts', departments: ['ACCESSORIES'] },
];

async function seedClassification() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set in environment or .env.local');
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  const categoriesColl = db.collection('categories');
  const collectionsColl = db.collection('collections');
  const productsColl = db.collection('products');

  console.log('======================================================');
  console.log('1. SEEDING / UPDATING CATEGORIES (IDEMPOTENT)');
  console.log('======================================================');

  let createdCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < CATALOG_CATEGORIES.length; i++) {
    const item = CATALOG_CATEGORIES[i];
    const existing = await categoriesColl.findOne({ slug: item.slug });

    if (existing) {
      // Merge existing departments with defined departments without duplicates
      const existingDepts: string[] = existing.departments || [];
      const mergedDepts = Array.from(new Set([...existingDepts, ...item.departments]));

      await categoriesColl.updateOne(
        { _id: existing._id },
        {
          $set: {
            departments: mergedDepts,
            group: existing.group || item.group,
            isActive: existing.isActive !== undefined ? existing.isActive : true,
          },
        }
      );
      updatedCount++;
    } else {
      // Create new category document
      await categoriesColl.insertOne({
        name: item.name,
        slug: item.slug,
        group: item.group,
        departments: item.departments,
        description: item.description || `${item.name} collection by Aveez Fashion.`,
        displayOrder: i + 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      createdCount++;
    }
  }

  console.log(`Categories Result: ${createdCount} created, ${updatedCount} verified/updated.`);
  const totalCats = await categoriesColl.countDocuments();
  console.log(`Total active categories in database: ${totalCats}`);

  console.log('\n======================================================');
  console.log('2. SEEDING / UPDATING COLLECTIONS (IDEMPOTENT)');
  console.log('======================================================');

  // Defined collections with explicit department associations
  const COLLECTIONS_DEF = [
    {
      title: 'Aveez Originals — Chapter 1',
      slug: 'aveez-originals',
      tagline: 'CHAPTER 01 / SIGNATURE DROP',
      description: 'Crafted from custom 450 GSM luxury brushed French terry cotton with relaxed drop shoulders and structured drapes.',
      coverImage: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1400&auto=format&fit=crop',
      featured: true,
      departments: ['MEN', 'WOMEN', 'UNISEX'] as Department[],
    },
    {
      title: 'The Monochrome Edit',
      slug: 'monochrome-edit',
      tagline: 'ESSENTIALS / MINIMALIST CAPSULE',
      description: 'Pure black, optic white, and neutral greys designed for modern styling.',
      coverImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1400&auto=format&fit=crop',
      featured: true,
      departments: ['MEN', 'WOMEN', 'UNISEX'] as Department[],
    },
    {
      title: 'New Arrivals',
      slug: 'new-arrivals',
      tagline: 'LATEST LUXURY RELEASES',
      description: 'The newest heavyweight apparel silhouettes and handcrafted accessory statements.',
      coverImage: '/images/heroimage1.png',
      featured: true,
      departments: ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'] as Department[],
    },
    {
      title: 'Matching Styles',
      slug: 'matching-styles',
      tagline: 'COORDINATED CAPSULES',
      description: 'Two-piece matching sets, co-ords, and harmonious apparel and accessory styling.',
      coverImage: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=1400&auto=format&fit=crop',
      featured: false,
      departments: ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'] as Department[],
    },
    {
      title: 'Aveez Handmade',
      slug: 'aveez-handmade',
      tagline: 'ARTISANAL ACCESSORIES & CHARMS',
      description: 'Handmade flower accessories, custom bouquets, crochet charms, and bespoke hair statements.',
      coverImage: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=1400&auto=format&fit=crop',
      featured: false,
      departments: ['ACCESSORIES'] as Department[],
    },
  ];

  for (const col of COLLECTIONS_DEF) {
    const existingCol = await collectionsColl.findOne({ slug: col.slug });
    if (existingCol) {
      await collectionsColl.updateOne(
        { _id: existingCol._id },
        {
          $set: {
            departments: col.departments,
            isActive: existingCol.isActive !== undefined ? existingCol.isActive : true,
          },
        }
      );
      console.log(` - Collection "${col.title}" updated with departments: ${col.departments.join(', ')}`);
    } else {
      await collectionsColl.insertOne({
        title: col.title,
        slug: col.slug,
        tagline: col.tagline,
        description: col.description,
        coverImage: col.coverImage,
        featured: col.featured,
        departments: col.departments,
        categories: [],
        products: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(` - Collection "${col.title}" created with departments: ${col.departments.join(', ')}`);
    }
  }

  console.log('\n======================================================');
  console.log('3. BACKFILLING DEPARTMENT ON EXISTING PRODUCTS');
  console.log('======================================================');

  const products = await productsColl.find({}).toArray();
  let updatedProducts = 0;

  for (const p of products) {
    let dept: Department = 'UNISEX';
    if (p.productType === 'accessories' || (p.tags && p.tags.includes('accessories'))) {
      dept = 'ACCESSORIES';
    } else if (p.gender === 'MEN') {
      dept = 'MEN';
    } else if (p.gender === 'WOMEN') {
      dept = 'WOMEN';
    } else {
      dept = 'UNISEX';
    }

    if (!p.department || p.department !== dept) {
      await productsColl.updateOne(
        { _id: p._id },
        {
          $set: {
            department: dept,
          },
        }
      );
      updatedProducts++;
    }
  }
  console.log(`Backfilled department on ${updatedProducts} existing products (Total: ${products.length} products).`);

  await mongoose.disconnect();
  console.log('\n🎉 CLASSIFICATION SEEDING COMPLETE & SAFE!');
}

seedClassification().catch((err) => {
  console.error('Error during classification seeding:', err);
  process.exit(1);
});
