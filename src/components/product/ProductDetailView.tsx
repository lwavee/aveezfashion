'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Star, ShieldCheck, Truck, RotateCcw, ChevronDown, Check, Ruler } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { resolveColorHex } from '@/lib/colors';
import styles from './ProductDetailView.module.css';

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  relatedProducts,
}) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Active Selected States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.variants[0]?.color || ''
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants.find((v) => v.stock > 0)?.size || product.variants[0]?.size || 'M'
  );
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  // Filter images according to the active selected color
  const displayedImages = useMemo(() => {
    if (!product.images || product.images.length === 0) return [];

    const hasColorImages = product.images.some((img) => Boolean(img.color && img.color.trim()));
    if (!hasColorImages || !selectedColor) {
      return product.images;
    }

    const matching = product.images.filter(
      (img) => img.color && img.color.trim().toLowerCase() === selectedColor.trim().toLowerCase()
    );

    if (matching.length > 0) {
      // Color-specific images first, followed by any general images with no color set
      const common = product.images.filter((img) => !img.color || !img.color.trim());
      return [...matching, ...common];
    }

    return product.images;
  }, [product.images, selectedColor]);

  // Swipe handling
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 40 && displayedImages.length > 1) {
      if (diffX > 0) {
        setSelectedImageIndex((prev) => (prev + 1) % displayedImages.length);
      } else {
        setSelectedImageIndex((prev) => (prev - 1 + displayedImages.length) % displayedImages.length);
      }
    }
    touchStartX.current = null;
  };

  // Lock body scroll when size guide modal is open
  useEffect(() => {
    if (sizeGuideOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sizeGuideOpen]);

  // Accordion Toggles
  const [openAccordion, setOpenAccordion] = useState<string | null>('fabric');

  // Extract unique color variants
  const availableColors = product.variants.filter(
    (v, i, self) =>
      Boolean(v.color) &&
      i === self.findIndex((t) => t.color.toLowerCase() === v.color.toLowerCase())
  );

  const isAccessory = Boolean(
    product.tags?.some((t) =>
      [
        'accessories',
        'hairband',
        'hairbands',
        'hair-clip',
        'hair-clips',
        'claw-clip',
        'claw-clips',
        'keychain',
        'keychains',
        'bag-charm',
        'bag-charms',
        'matching-sets',
      ].includes(t.toLowerCase())
    ) || product.accessoryType
  );

  const currentColorVariants = product.variants.filter((v) =>
    selectedColor ? v.color.toLowerCase() === selectedColor.toLowerCase() : true
  );
  const displayedVariants = currentColorVariants.length > 0 ? currentColorVariants : product.variants;

  const activeVariant =
    product.variants.find((v) => 
      (selectedColor ? v.color.toLowerCase() === selectedColor.toLowerCase() : true) &&
      v.size === selectedSize
    ) ||
    product.variants.find((v) => v.size === selectedSize) ||
    product.variants[0];

  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor);
    setSelectedImageIndex(0); // Reset gallery view to first photo of chosen color
    const inStockForColor = product.variants.find(
      (v) => v.color.toLowerCase() === newColor.toLowerCase() && v.stock > 0
    );
    if (inStockForColor) {
      setSelectedSize(inStockForColor.size);
    }
  };

  const handleCheckPincode = () => {
    if (pincode.length === 6) {
      setPincodeStatus(`Delivering to ${pincode}: 2–4 business days • Free shipping eligible • COD available`);
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  const isFavorited = isInWishlist(product.slug);
  const isOutOfStock = !activeVariant || activeVariant.stock <= 0;
  const isLowStock = activeVariant && activeVariant.stock > 0 && activeVariant.stock <= 5;

  const hasSale = product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasSale
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100)
    : 0;

  const currentImage = displayedImages[selectedImageIndex] || displayedImages[0] || product.images[0];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(
      {
        productId: product._id,
        variantSku: activeVariant.sku,
        title: product.title,
        slug: product.slug,
        size: activeVariant.size,
        color: activeVariant.color,
        price: product.salePrice || product.basePrice,
        originalPrice: product.basePrice,
        image: currentImage.url,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className={styles.detailWrapper}>
      <div className={styles.productGrid}>
        {/* Left Column: Image Gallery */}
        <div className={styles.galleryColumn}>
          {/* Thumbnails list */}
          <div className={styles.thumbnails}>
            {displayedImages.map((img, idx) => (
              <button
                key={img.url + idx}
                type="button"
                className={`${styles.thumbBtn} ${selectedImageIndex === idx ? styles.activeThumb : ''}`}
                onClick={() => setSelectedImageIndex(idx)}
                aria-label={`View photo ${idx + 1}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${product.title} preview ${idx + 1}`}
                  fill
                  sizes="80px"
                  className={styles.thumbImage}
                />
              </button>
            ))}
          </div>

          {/* Main Stage Image */}
          <div
            className={styles.mainStage}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.alt || product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className={styles.mainImage}
            />
            {hasSale ? (
              <div className={styles.saleBadgeOverlay}>
                <Badge variant="sale">SAVE {discountPercent}%</Badge>
              </div>
            ) : null}

            {displayedImages.length > 1 && (
              <div className={styles.mobileDotsTrack} aria-hidden="true">
                {displayedImages.map((_, dotIdx) => (
                  <span
                    key={dotIdx}
                    className={`${styles.mobileDot} ${
                      dotIdx === selectedImageIndex ? styles.mobileDotActive : ''
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Purchasing Stack */}
        <div className={styles.infoColumn}>
          <div className={styles.headerStack}>
            <span className={styles.skuTag}>SKU: {product.sku}</span>
            <h1 className={styles.title}>{product.title}</h1>

            {/* Ratings */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    fill={star <= Math.round(product.averageRating) ? '#0A0A0A' : 'none'}
                    color="#0A0A0A"
                  />
                ))}
              </div>
              <span className={styles.ratingValue}>{product.averageRating}</span>
              <span className={styles.reviewCount}>({product.totalReviews} Reviews)</span>
            </div>

            {/* Pricing */}
            <div className={styles.priceRow}>
              {hasSale ? (
                <>
                  <span className={styles.salePrice}>
                    ₹{product.salePrice?.toLocaleString('en-IN')}
                  </span>
                  <span className={styles.originalPrice}>
                    ₹{product.basePrice.toLocaleString('en-IN')}
                  </span>
                  <span className={styles.discountTag}>({discountPercent}% OFF)</span>
                </>
              ) : (
                <span className={styles.basePrice}>
                  ₹{product.basePrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className={styles.taxInclusive}>INCLUSIVE OF ALL TAXES</span>
            </div>
          </div>

          {/* Color Details & Selection */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>COLOR:</span>
              <span className={styles.selectedValue}>{activeVariant.color}</span>
            </div>
            {availableColors.length > 1 ? (
              <div className={styles.colorSwatchesList} aria-label="Choose color">
                {availableColors.map((colorObj) => {
                  const isSelected = activeVariant.color.toLowerCase() === colorObj.color.toLowerCase();
                  return (
                    <button
                      key={colorObj.color}
                      type="button"
                      onClick={() => handleColorChange(colorObj.color)}
                      className={`${styles.colorSwatchBtn} ${isSelected ? styles.selectedColorBtn : ''}`}
                      title={colorObj.color}
                      aria-pressed={isSelected}
                    >
                      <span
                        className={styles.colorSwatchDot}
                        style={{ backgroundColor: resolveColorHex(colorObj.color, colorObj.colorHex) }}
                      />
                      <span>{colorObj.color}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={styles.colorPill}>
                <span
                  className={styles.colorSwatch}
                  style={{ backgroundColor: resolveColorHex(activeVariant.color, activeVariant.colorHex) }}
                />
                <span>{activeVariant.color}</span>
              </div>
            )}
          </div>

          {/* Sizing Selection & Size Guide */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>SELECT SIZE:</span>
              <button
                type="button"
                className={styles.sizeGuideTrigger}
                onClick={() => setSizeGuideOpen(true)}
              >
                <Ruler size={14} />
                <span>{isAccessory ? 'DIMENSIONS GUIDE' : 'SIZE GUIDE'}</span>
              </button>
            </div>

            <div className={styles.sizeGrid}>
              {displayedVariants.map((variant) => {
                const isSelected = selectedSize === variant.size;
                const outOfStock = variant.stock <= 0;

                return (
                  <button
                    key={variant.sku}
                    disabled={outOfStock}
                    onClick={() => setSelectedSize(variant.size)}
                    className={`${styles.sizeBox} ${isSelected ? styles.selectedBox : ''} ${outOfStock ? styles.outBox : ''}`}
                  >
                    <span>{variant.size === 'ONESIZE' ? 'ONE SIZE' : variant.size}</span>
                    {outOfStock ? <span className={styles.outNotice}>SOLD</span> : null}
                  </button>
                );
              })}
            </div>

            {/* Low stock or Out of stock urgency alert */}
            {isLowStock ? (
              <span className={styles.urgencyAlert}>
                HURRY! ONLY {activeVariant.stock} PIECES LEFT IN SIZE {selectedSize}
              </span>
            ) : isOutOfStock ? (
              <span className={styles.outOfStockAlert}>
                SIZE {selectedSize} IS CURRENTLY OUT OF STOCK
              </span>
            ) : null}
          </div>

          {/* Quantity Selector */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionLabel}>QUANTITY:</span>
            <div className={styles.qtyContainer}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className={styles.qtyBtn}
                disabled={quantity <= 1 || isOutOfStock}
              >
                -
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(activeVariant.stock, q + 1))}
                className={styles.qtyBtn}
                disabled={quantity >= activeVariant.stock || isOutOfStock}
              >
                +
              </button>
            </div>
          </div>

          {/* Action CTAs: Add to Bag, Buy Now, Wishlist */}
          <div className={styles.ctaStack}>
            <div className={styles.primaryActions}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO BAG'}
              </Button>
              <button
                className={`${styles.wishlistActionBtn} ${isFavorited ? styles.favorited : ''}`}
                onClick={() => toggleWishlist(product.slug)}
                aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart size={20} fill={isFavorited ? '#0A0A0A' : 'none'} />
              </button>
            </div>

            {!isOutOfStock && (
              <Button variant="secondary" size="lg" fullWidth onClick={handleBuyNow}>
                BUY NOW (INSTANT CHECKOUT)
              </Button>
            )}
          </div>

          {/* Trust Value Propositions */}
          <div className={styles.trustBadges}>
            <div className={styles.trustItem}>
              <Truck size={18} />
              <span>Free Express Shipping above ₹1,999</span>
            </div>
            <div className={styles.trustItem}>
              <RotateCcw size={18} />
              <span>Hassle-Free 7-Day Return / Exchange</span>
            </div>
            <div className={styles.trustItem}>
              <ShieldCheck size={18} />
              <span>Authentic 100% Combed Heavy Cotton</span>
            </div>
          </div>

          {/* Delivery & Pincode Checker */}
          <div className={styles.pincodeSection}>
            <div className={styles.pincodeHeader}>
              <Truck size={16} />
              <span className={styles.pincodeTitle}>ESTIMATE DELIVERY & AVAILABILITY</span>
            </div>
            <div className={styles.pincodeInputRow}>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className={styles.pincodeInput}
                aria-label="Enter pincode"
              />
              <button
                type="button"
                onClick={handleCheckPincode}
                className={styles.pincodeCheckBtn}
              >
                CHECK
              </button>
            </div>
            {pincodeStatus && (
              <div className={styles.pincodeResult}>
                <Check size={14} className={styles.pincodeCheckIcon} />
                <span>{pincodeStatus}</span>
              </div>
            )}
          </div>

          {/* Product Description */}
          <div className={styles.descriptionText}>{product.description}</div>

          {/* Accordion Panels */}
          <div className={styles.accordionContainer}>
            {/* Fabric & Spec */}
            <div className={styles.accordionItem}>
              <button
                className={styles.accordionHeader}
                onClick={() =>
                  setOpenAccordion(openAccordion === 'fabric' ? null : 'fabric')
                }
              >
                <span>FABRIC & SPECIFICATIONS</span>
                <ChevronDown
                  size={18}
                  className={`${styles.arrowIcon} ${openAccordion === 'fabric' ? styles.arrowOpen : ''}`}
                />
              </button>
              {openAccordion === 'fabric' && (
                <div className={styles.accordionBody}>
                  <ul>
                    <li>
                      <strong>Fabric:</strong> {product.attributes?.fabric || '100% Cotton'}
                    </li>
                    <li>
                      <strong>Fit:</strong> {product.attributes?.fit || 'Relaxed Boxy'}
                    </li>
                    <li>
                      <strong>Origin:</strong> {product.attributes?.origin || 'India'}
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Wash Care */}
            <div className={styles.accordionItem}>
              <button
                className={styles.accordionHeader}
                onClick={() =>
                  setOpenAccordion(openAccordion === 'care' ? null : 'care')
                }
              >
                <span>CARE INSTRUCTIONS</span>
                <ChevronDown
                  size={18}
                  className={`${styles.arrowIcon} ${openAccordion === 'care' ? styles.arrowOpen : ''}`}
                />
              </button>
              {openAccordion === 'care' && (
                <div className={styles.accordionBody}>
                  <p>
                    {product.attributes?.washCare ||
                      'Machine wash cold inside out. Flat dry in shade to preserve textile structure.'}
                  </p>
                </div>
              )}
            </div>

            {/* Shipping & Returns */}
            <div className={styles.accordionItem}>
              <button
                className={styles.accordionHeader}
                onClick={() =>
                  setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')
                }
              >
                <span>SHIPPING & RETURNS</span>
                <ChevronDown
                  size={18}
                  className={`${styles.arrowIcon} ${openAccordion === 'shipping' ? styles.arrowOpen : ''}`}
                />
              </button>
              {openAccordion === 'shipping' && (
                <div className={styles.accordionBody}>
                  <p>
                    Dispatched within 24 hours. Delivery SLA is 2–4 business days across metro
                    cities and 3–6 business days nationwide. Returns or exchanges accepted
                    within 7 days of delivery for unworn items with original tags intact.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className={styles.modalOverlay} onClick={() => setSizeGuideOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {isAccessory ? 'ACCESSORY SPECIFICATIONS & DIMENSIONS' : 'SIZE & FIT GUIDE'}
              </h3>
              <button
                onClick={() => setSizeGuideOpen(false)}
                className={styles.modalClose}
                aria-label="Close size chart"
              >
                ✕
              </button>
            </div>
            {isAccessory ? (
              <>
                <p className={styles.modalNote}>
                  All AVEEZ handcrafted accessories are engineered in versatile One-Size silhouettes
                  crafted with ergonomic proportions for everyday comfort and universal styling.
                </p>
                <div className={styles.tableWrapper}>
                  <table className={styles.sizeTable}>
                    <thead>
                      <tr>
                        <th>ACCESSORY TYPE</th>
                        <th>DIMENSIONS</th>
                        <th>FIT & STYLING NOTE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Hairbands</strong></td>
                        <td>Width: 3.5 cm • Arc: 38 cm</td>
                        <td>Pinch-free ergonomic flex band (Fits 52–58 cm circumference)</td>
                      </tr>
                      <tr>
                        <td><strong>Claw Clips</strong></td>
                        <td>Length: 10.5 cm • Height: 4.5 cm</td>
                        <td>High-tension spring; all hair densities (fine to thick)</td>
                      </tr>
                      <tr>
                        <td><strong>Hair Clips (Duo)</strong></td>
                        <td>Length: 6.0 cm • Width: 1.5 cm</td>
                        <td>Alligator grip back; accent and face-framing placement</td>
                      </tr>
                      <tr>
                        <td><strong>Keychains & Charms</strong></td>
                        <td>Total Drop: 12–15 cm</td>
                        <td>Standard carabiner snap hook for belt loops, totes, & carry</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <p className={styles.modalNote}>
                  All garment measurements are listed in inches. Designed with an intentional
                  oversized drop-shoulder silhouette. Choose your standard size for the intended
                  boxy drape.
                </p>
                <div className={styles.tableWrapper}>
                  <table className={styles.sizeTable}>
                    <thead>
                      <tr>
                        <th>SIZE</th>
                        <th>CHEST (INCHES)</th>
                        <th>LENGTH (INCHES)</th>
                        <th>SHOULDER (INCHES)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>S</strong></td>
                        <td>44</td>
                        <td>27.5</td>
                        <td>22</td>
                      </tr>
                      <tr>
                        <td><strong>M</strong></td>
                        <td>46</td>
                        <td>28.5</td>
                        <td>23</td>
                      </tr>
                      <tr>
                        <td><strong>L</strong></td>
                        <td>48</td>
                        <td>29.5</td>
                        <td>24</td>
                      </tr>
                      <tr>
                        <td><strong>XL</strong></td>
                        <td>50</td>
                        <td>30.5</td>
                        <td>25</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => setSizeGuideOpen(false)}
            >
              GOT IT
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
