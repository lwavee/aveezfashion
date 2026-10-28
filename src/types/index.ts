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
  color?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductAttributes {
  fabric?: string;
  fit?: string;
  washCare?: string;
  origin?: string;
}

export type Department = 'MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES';
export const DEPARTMENTS: Department[] = ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'];

export interface Product {
  _id: string;
  title: string;
  slug: string;
  sku: string;
  description: string;
  gender: Gender;
  department?: Department;
  category: string; // Category ID or populated Category object
  subCategory?: string;
  collectionId?: string;
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  productType?: 'clothing' | 'accessories';
  lowStockThreshold?: number;
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
  matchingColors?: string[];
  accessoryType?: string;
  isBundle?: boolean;
  bundleProductIds?: string[];
  bundleDetails?: string;
  stylingTips?: string;
  relatedAccessories?: string[] | Product[];
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
  departments?: Department[];
  group?: string;
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
  departments?: Department[];
  categories?: string[];
  products?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Address {
  _id?: string;
  recipientName: string;
  phone: string;
  house?: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  addressType?: 'HOME' | 'WORK' | 'OTHER';
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
  | 'PENDING'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'UNFULFILLED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export interface OrderStatusHistoryItem {
  status: string;
  previousStatus?: string;
  timestamp: string | Date;
  note?: string;
  description?: string;
  updatedBy?: string;
}

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
  idempotencyKey?: string;
  user?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  pricing: {
    subtotal: number;
    discountTotal: number;
    taxTotal: number;
    shippingFee: number;
    giftWrapFee?: number;
    grandTotal: number;
    currency: string;
  };
  giftPackaging?: boolean;
  paymentMethod: 'ONLINE_GATEWAY' | 'COD' | 'UPI' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'NET_BANKING';
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  orderStatus?: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  returnStatus?: 'NONE' | 'REQUESTED' | 'APPROVED' | 'PICKUP_SCHEDULED' | 'INSPECTED' | 'REFUNDED' | 'EXCHANGED' | 'REJECTED';
  statusHistory?: OrderStatusHistoryItem[];
  cancellationReason?: string;
  cancelledAt?: string | Date;
  cancelledBy?: string;
  stockRestored?: boolean;
  invoiceNumber?: string;
  invoiceIssuedAt?: string | Date;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  courierName?: string;
  estimatedDelivery?: string | Date;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnRequest {
  _id: string;
  requestId: string;
  orderId: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: 'RETURN' | 'EXCHANGE';
  items: {
    productId: string;
    variantSku: string;
    title: string;
    size: string;
    exchangeSize?: string;
    quantity: number;
    unitPrice: number;
  }[];
  reason: string;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'PICKUP_SCHEDULED' | 'INSPECTED' | 'COMPLETED' | 'REJECTED';
  refundStatus: 'PENDING' | 'PROCESSED' | 'FAILED' | 'NOT_APPLICABLE';
  refundAmount: number;
  adminNotes?: string;
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
  addresses?: Address[];
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

export interface CampaignAssetMetadata {
  id: string;
  purpose: string;
  fileKey: string;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
  variant?: 'desktop' | 'mobile' | 'editorial' | 'square';
  active: boolean;
  createdAt: string;
}

export interface SeasonalThemeConfig {
  enabled: boolean;
  theme: 'normal' | 'diwali';
  announcementText: string;
  announcementCtaText?: string;
  announcementCtaLink?: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroOfferText?: string;
  heroDesktopImage: string;
  heroMobileImage: string;
  heroOverlayMode?: 'with_text' | 'without_text';
  heroPrimaryCtaText?: string;
  heroPrimaryCtaLink?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  giftPackagingPrice?: number;
  matchingStylesImage?: string;
  menImage?: string;
  womenImage?: string;
  accessoriesImage?: string;
  campaignStartDate?: string | null;
  campaignEndDate?: string | null;
  campaignAssets?: CampaignAssetMetadata[];
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
  seasonalTheme?: SeasonalThemeConfig;
}
