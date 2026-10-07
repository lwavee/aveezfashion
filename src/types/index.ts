export type Gender = 'MEN' | 'WOMEN' | 'UNISEX';

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface ProductVariant {
  sku: string;
  size: string; // 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'
  color: string;
  colorHex: string;
  stock: number;
  reservedStock?: number;
  barcode?: string;
}

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductAttributes {
  fabric?: string;
  fit?: string;
  washCare?: string;
  origin?: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  gender: Gender;
  category: string; // Category ID or populated Category object
  subCategory?: string;
  basePrice: number;
  salePrice?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes?: ProductAttributes;
  status: ProductStatus;
  tags?: string[];
  averageRating: number;
  totalReviews: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isAveezOriginal?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: string | null;
  image?: string;
  displayOrder?: number;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

export interface Collection {
  _id: string;
  title: string;
  slug: string;
  tagline?: string;
  description?: string;
  coverImage: string;
  featured: boolean;
  products?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Address {
  _id?: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface CartItem {
  productId: string;
  variantSku: string;
  title: string;
  slug: string;
  size: string;
  color: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
}

export type OrderPaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderFulfillmentStatus =
  | 'UNFULFILLED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export interface OrderItem {
  productId: string;
  variantSku: string;
  title: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  thumbnailImage: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  pricing: {
    subtotal: number;
    discountTotal: number;
    taxTotal: number;
    shippingFee: number;
    grandTotal: number;
    currency: string;
  };
  paymentMethod: 'ONLINE_GATEWAY' | 'COD';
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  defaultShippingAddress?: Address;
  createdAt: string;
}

export interface Review {
  _id: string;
  product: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rating: number;
  headline: string;
  body: string;
  fitFeedback?: 'RUNS_SMALL' | 'TRUE_TO_SIZE' | 'RUNS_LARGE';
  isVerifiedBuyer: boolean;
  createdAt: string;
}

export interface HomepageContent {
  announcementBar: {
    message: string;
    ctaText?: string;
    ctaLink?: string;
    isActive: boolean;
  };
  hero: {
    headline: string;
    subheadline: string;
    desktopImage: string;
    mobileImage: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
  };
  aveezOriginals: {
    tagline: string;
    headline: string;
    description: string;
    image: string;
    ctaText: string;
    ctaLink: string;
  };
  brandStory: {
    title: string;
    paragraphs: string[];
    ctaText: string;
    ctaLink: string;
  };
}

export interface Settings {
  storeName: string;
  supportEmail: string;
  supportPhone?: string;
  currency: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  codEnabled: boolean;
  codFee: number;
  gstPercentage: number;
}
