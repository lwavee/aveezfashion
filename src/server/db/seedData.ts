import { Category, Collection, Product, HomepageContent, Settings } from '@/types';

export const initialCategories: Partial<Category>[] = [
  {
    name: 'Men',
    slug: 'men',
    description: 'Elevated menswear, boxy streetwear silhouettes, and heavyweight cotton essentials.',
    image: '/api/media/categories/men.webp',
    displayOrder: 1,
    isActive: true,
  },
  {
    name: 'Women',
    slug: 'women',
    description: 'Modern luxury womenswear, architectural tailoring, and relaxed oversized drapes.',
    image: '/api/media/categories/women.webp',
    displayOrder: 2,
    isActive: true,
  },
  {
    name: 'Hoodies',
    slug: 'hoodies',
    description: 'Custom 450 GSM luxury brushed French terry hoodies with drop shoulders.',
    image: '/api/media/categories/hoodies.webp',
    displayOrder: 3,
    isActive: true,
  },
  {
    name: 'Oversized Tees',
    slug: 'oversized-tees',
    description: 'Heavyweight 280 GSM combed cotton t-shirts with structured rib collars.',
    image: '/api/media/categories/oversized-tees.webp',
    displayOrder: 4,
    isActive: true,
  },
  {
    name: 'Bottoms',
    slug: 'bottoms',
    description: 'Pleated trousers, heavyweight relaxed cargos, and tailored wide-leg pants.',
    image: '/api/media/categories/bottoms.webp',
    displayOrder: 5,
    isActive: true,
  },
  {
    name: 'Shirts',
    slug: 'shirts',
    description: 'Relaxed Cuban collar resort shirts and boxy heavyweight overshirts.',
    image: '/api/media/categories/shirts.webp',
    displayOrder: 6,
    isActive: true,
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'The Finishing Touch — Handcrafted hair accessories, floral headbands, clips, and styling charms.',
    image: '/api/media/together/made-for-two.webp',
    displayOrder: 7,
    isActive: true,
  },
  {
    name: 'Hairbands',
    slug: 'hairbands',
    description: 'Handmade floral headbands and sculpted hair bands designed to complete your silhouette.',
    displayOrder: 8,
    isActive: true,
  },
  {
    name: 'Hair Clips',
    slug: 'hair-clips',
    description: 'Minimalist statement clips, floral accents, and curated clip sets.',
    displayOrder: 9,
    isActive: true,
  },
  {
    name: 'Claw Clips',
    slug: 'claw-clips',
    description: 'Architectural matte and tortoiseshell claw clips for effortless hair styling.',
    displayOrder: 10,
    isActive: true,
  },
  {
    name: 'Keychains',
    slug: 'keychains',
    description: 'Handmade floral charm keychains and engraved metal hardware.',
    displayOrder: 11,
    isActive: true,
  },
  {
    name: 'Bag Charms',
    slug: 'bag-charms',
    description: 'Tactile accessory accents and signature Aveez charms for everyday carry.',
    displayOrder: 12,
    isActive: true,
  },
  {
    name: 'Matching Sets',
    slug: 'matching-sets',
    description: 'Curated accessory bundles and paired colorway styling sets.',
    displayOrder: 13,
    isActive: true,
  },
];

export const initialCollections: Partial<Collection>[] = [
  {
    title: 'Aveez Originals — Chapter 1',
    slug: 'aveez-originals',
    tagline: 'Architectural silhouettes crafted in heavyweight French terry.',
    description:
      'The foundational drop representing Aveez Fashion’s design philosophy: substantial fabrics, precision cuts, and effortless drape.',
    coverImage: '/api/media/campaigns/signature.webp',
    featured: true,
    isActive: true,
  },
  {
    title: 'The Monochrome Edit',
    slug: 'monochrome-edit',
    tagline: 'Timeless minimalism in pure onyx black and optic white.',
    description: 'A curated edit of high-contrast pieces designed for effortless pairing.',
    coverImage: '/api/media/hero/hero2.webp',
    featured: true,
    isActive: true,
  },
];

export const initialProducts: Partial<Product>[] = [
  {
    _id: '6ad88d912634bd961d886d2c' as any,
    title: 'Handmade Teddy Bear Keychain',
    slug: 'handmade-teddy-bear-keychain',
    sku: 'AVZ-ACC-KC-006',
    description:
      'Handmade teddy bear keychain with soft plush texture and sturdy split keyring. Perfect for everyday carry, bags, and keys.',
    gender: 'UNISEX',
    department: 'ACCESSORIES',
    basePrice: 99,
    images: [
      {
        url: '/api/media/together/made-for-two.webp',
        alt: 'Handmade Teddy Bear Keychain',
        isPrimary: true,
        sortOrder: 0,
      },
    ],
    variants: [
      {
        sku: 'AVZ-ACC-KC-006-BRN',
        size: 'ONESIZE',
        color: 'Brown',
        colorHex: '#8B5A2B',
        stock: 24,
      },
    ],
    attributes: {
      fabric: 'Plush & Metal Hardware',
      fit: 'Compact Keychain',
      washCare: 'Wipe clean with a dry cloth.',
      origin: 'Crafted in India',
    },
    status: 'PUBLISHED',
    tags: ['accessories', 'keychains', 'keychain', 'charms', 'finishing-touch'],
    averageRating: 5,
    totalReviews: 8,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    isAveezOriginal: true,
    accessoryType: 'keychain',
    matchingColors: ['Raw Ecru', 'Warm Brown', 'Vintage Bone'],
  },
];

export const paymentTestProduct: Partial<Product> = {
  _id: '6ad9256373bf492b785b2001',
  title: 'AVEEZ Payment Test Product',
  slug: 'aveez-payment-test-product',
  sku: 'AVZ-TEST-PAY-001',
  description:
    'Temporary internal payment test item for Razorpay live end-to-end payment verification. Subtotal: ₹1.00 + Shipping: ₹1.00 = Total: ₹2.00.',
  gender: 'UNISEX',
  department: 'ACCESSORIES',
  basePrice: 1,
  salePrice: 1,
  images: [
    {
      url: '/api/media/together/made-for-two.webp',
      alt: 'AVEEZ Payment Test Product - Internal Razorpay Verification',
      isPrimary: true,
      sortOrder: 0,
    },
  ],
  variants: [
    {
      sku: 'AVZ-TEST-PAY-001-STD',
      size: 'ONESIZE',
      color: 'Test Edition',
      colorHex: '#000000',
      stock: 999,
    },
  ],
  attributes: {
    fabric: 'Internal Test Item (Razorpay Live Verification)',
    fit: 'N/A',
    washCare: 'N/A',
    origin: 'AVEEZ Internal Testing',
  },
  status: 'DRAFT', // Kept as DRAFT to exclude from normal public catalog queries
  tags: ['payment-test', 'internal-only'],
  isFeatured: false,
  isBestSeller: false,
  isNewArrival: false,
  isAveezOriginal: false,
};

