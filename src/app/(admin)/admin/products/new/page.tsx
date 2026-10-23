'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resolveColorHex } from '@/lib/colors';
import {
  Shirt,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  Check,
  AlertCircle,
  Trash2,
  MoveLeft,
  MoveRight,
  Star,
  Plus,
  RefreshCw,
  Sliders,
  DollarSign,
  Package,
  Layers,
  HelpCircle,
  Palette,
  Eye,
  Info,
} from 'lucide-react';
import styles from './newProduct.module.css';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  group: string;
  departments: ('MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES')[];
  isAccessory: boolean;
}

interface CollectionOption {
  id: string;
  title: string;
  slug: string;
  departments: ('MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES')[];
  categories: string[];
}

interface ColorVariant {
  name: string;
  hex: string;
}

interface MatrixVariantItem {
  key: string;
  sku: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  enabled: boolean;
}

interface UploadedImage {
  url: string;
  alt: string;
  color?: string;
  isPrimary: boolean;
  sortOrder: number;
  fileName: string;
}

const APPAREL_SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const WAIST_SIZE_PRESETS = ['28', '30', '32', '34', '36', '38'];

const STANDARD_PALETTE = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Olive', hex: '#708238' },
  { name: 'Beige', hex: '#E8DCC4' },
  { name: 'Onyx Black', hex: '#0A0A0A' },
  { name: 'Chalk White', hex: '#F9FAFB' },
  { name: 'Slate Gray', hex: '#64748B' },
  { name: 'Vintage Bone', hex: '#E7E5E4' },
  { name: 'Navy Blue', hex: '#1E293B' },
  { name: 'Sage Green', hex: '#9CA986' },
  { name: 'Raw Ecru', hex: '#F5F5DC' },
  { name: 'Charcoal', hex: '#334155' },
  { name: 'Forest Green', hex: '#14532D' },
  { name: 'Dusty Rose', hex: '#FDA4AF' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Camel Tan', hex: '#C19A6B' },
];

function NewProductStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit') || searchParams?.get('id');
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);

  // Navigation & Selection State
  const [productType, setProductType] = useState<'clothing' | 'accessories' | null>(null);
  const [showTypeChangeConfirm, setShowTypeChangeConfirm] = useState(false);
  const [pendingTypeChange, setPendingTypeChange] = useState<'clothing' | 'accessories' | null>(null);

  // Taxonomy from Database
  const [allCategories, setAllCategories] = useState<CategoryOption[]>([]);
  const [clothingCategories, setClothingCategories] = useState<CategoryOption[]>([]);
  const [accessoryCategories, setAccessoryCategories] = useState<CategoryOption[]>([]);
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);

  // Form Fields
  const [department, setDepartment] = useState<'MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES'>('MEN');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState<'UNISEX' | 'MEN' | 'WOMEN'>('MEN');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [collectionId, setCollectionId] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Images
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [suggestedColors, setSuggestedColors] = useState<ColorVariant[]>([]);
  const [activeUploadColor, setActiveUploadColor] = useState<string>('ALL');
  const [isQuickAddingColor, setIsQuickAddingColor] = useState(false);
  const [quickColorName, setQuickColorName] = useState('');
  const [quickColorHex, setQuickColorHex] = useState('#0A0A0A');

  // Pricing
  const [basePrice, setBasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');

  // Clothing Sizing & Colours
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M', 'L']);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [colors, setColors] = useState<ColorVariant[]>([{ name: 'Onyx Black', hex: '#0A0A0A' }]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#0A0A0A');

  // Variant Matrix
  const [variantMatrix, setVariantMatrix] = useState<MatrixVariantItem[]>([]);
  const [bulkStockVal, setBulkStockVal] = useState('10');

  // Accessories Specific State
  const [accessoryStockMode, setAccessoryStockMode] = useState<'SINGLE' | 'COLORS'>('SINGLE');
  const [singleStock, setSingleStock] = useState('20');
  const [singleSku, setSingleSku] = useState('');
  const [bundleDetails, setBundleDetails] = useState('');

  // Inventory & Publishing Settings
  const [masterSku, setMasterSku] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isAveezOriginal, setIsAveezOriginal] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');

  // Garment Attributes (Optional)
  const [fabric, setFabric] = useState('');
  const [fit, setFit] = useState('');
  const [washCare, setWashCare] = useState('');

  // Form Processing State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Fetch live categories & collections from DB
  useEffect(() => {
    async function loadTaxonomy() {
      try {
        const res = await fetch('/api/admin/taxonomy');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const rawCats: CategoryOption[] = data.data.categories || [];
            setAllCategories(rawCats);
            setClothingCategories(data.data.clothingCategories || []);
            setAccessoryCategories(data.data.accessoryCategories || []);
            setCollections(data.data.collections || []);

            // Set sensible default category for initial department
            const initialValid = rawCats.filter((c) => (c.departments || []).includes('MEN'));
            if (initialValid.length > 0) {
              const def = initialValid.find((c) => c.slug === 'oversized-tees') || initialValid[0];
              setCategory(def.slug);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch taxonomy:', err);
      } finally {
        setLoadingTaxonomy(false);
      }
    }
    loadTaxonomy();
  }, []);

  // 1b. Load existing product if edit mode is active
  useEffect(() => {
    if (!editId) return;

    async function loadProductToEdit() {
      setIsLoadingEdit(true);
      try {
        const res = await fetch(`/api/admin/products/${editId}`);
        if (!res.ok) return;
        const json = await res.json();
        const p = json?.data?.product;
        if (!p) return;

        setTitle(p.title || '');
        setSlug(p.slug || '');
        setIsSlugManuallyEdited(true);
        setMasterSku(p.sku || '');
        setDescription(p.description || '');
        const dept = p.department || (p.productType === 'accessories' ? 'ACCESSORIES' : 'UNISEX');
        setDepartment(dept);
        setGender(p.gender || 'UNISEX');
        setCategory(typeof p.category === 'object' ? p.category?.slug || p.category?._id : p.category);
        if (p.collectionId) {
          setCollectionId(typeof p.collectionId === 'object' ? p.collectionId?._id : p.collectionId);
        }
        setBasePrice(p.basePrice ? String(p.basePrice) : '');
        setSalePrice(p.salePrice ? String(p.salePrice) : '');
        setCostPrice(p.costPrice ? String(p.costPrice) : '');
        setProductType(p.productType || 'clothing');
        setLowStockThreshold(p.lowStockThreshold ? String(p.lowStockThreshold) : '5');
        setIsFeatured(Boolean(p.isFeatured));
        setIsNewArrival(Boolean(p.isNewArrival));
        setIsAveezOriginal(Boolean(p.isAveezOriginal));
        setTags(p.tags || []);
        if (p.attributes) {
          setFabric(p.attributes.fabric || '');
          setFit(p.attributes.fit || '');
          setWashCare(p.attributes.washCare || '');
        }

        // Load images
        if (Array.isArray(p.images) && p.images.length > 0) {
          setImages(
            p.images.map((img: any, idx: number) => ({
              url: typeof img === 'string' ? img : img.url,
              alt: typeof img === 'string' ? `${p.title} view ${idx + 1}` : (img.alt || `${p.title} view ${idx + 1}`),
              color: typeof img === 'object' ? img.color : undefined,
              isPrimary: typeof img === 'object' ? Boolean(img.isPrimary) : idx === 0,
              sortOrder: typeof img === 'object' && typeof img.sortOrder === 'number' ? img.sortOrder : idx,
              fileName: (typeof img === 'string' ? img : img.url).split('/').pop() || 'image.jpg',
            }))
          );
        }

        // Load colors from variants & images
        const colorMap = new Map<string, string>();
        if (Array.isArray(p.variants)) {
          for (const v of p.variants) {
            if (v.color && v.color !== 'Default') {
              colorMap.set(v.color.trim().toLowerCase(), v.colorHex || '#0A0A0A');
            }
          }
        }
        if (Array.isArray(p.images)) {
          for (const img of p.images) {
            if (typeof img === 'object' && img.color && !colorMap.has(img.color.trim().toLowerCase())) {
              colorMap.set(img.color.trim().toLowerCase(), '#0A0A0A');
            }
          }
        }
        if (colorMap.size > 0) {
          const loadedCols: ColorVariant[] = Array.from(colorMap.entries()).map(([nameLower, hex]) => {
            const std = STANDARD_PALETTE.find((sp) => sp.name.toLowerCase() === nameLower);
            return {
              name: std ? std.name : nameLower.charAt(0).toUpperCase() + nameLower.slice(1),
              hex: std ? std.hex : hex,
            };
          });
          setColors(loadedCols);
        }

        // Load sizes
        if (Array.isArray(p.variants) && p.variants.length > 0) {
          const uniqueSizes = Array.from(
            new Set(p.variants.map((v: any) => v.size).filter((s: any) => s && s !== 'ONESIZE'))
          ) as string[];
          if (uniqueSizes.length > 0) {
            setSelectedSizes(uniqueSizes);
          }
        }
      } catch (err) {
        console.error('Failed to load existing product for edit:', err);
      } finally {
        setIsLoadingEdit(false);
      }
    }

    loadProductToEdit();
  }, [editId]);

  // Filtered categories for currently active department
  const availableCategories = useMemo(() => {
    return allCategories.filter((c) => (c.departments || []).includes(department));
  }, [allCategories, department]);

  // Grouped categories by group header (Tops, Bottoms, Hair Accessories, etc.)
  const groupedCategories = useMemo(() => {
    const map: Record<string, CategoryOption[]> = {};
    for (const cat of availableCategories) {
      const grp = cat.group || 'General';
      if (!map[grp]) map[grp] = [];
      map[grp].push(cat);
    }
    return map;
  }, [availableCategories]);

  // Selected Category Object
  const selectedCategoryObj = useMemo(() => {
    return allCategories.find((c) => c.slug === category || c.id === category);
  }, [allCategories, category]);

  // Available collections for department + category
  const availableCollections = useMemo(() => {
    if (!category || !selectedCategoryObj) return [];
    return collections.filter((col) => {
      const depts = col.departments && col.departments.length > 0
        ? col.departments
        : ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'];
      if (!depts.includes(department)) return false;

      if (col.categories && col.categories.length > 0) {
        return col.categories.includes(selectedCategoryObj.id) || col.categories.includes(selectedCategoryObj.slug);
      }
      return true;
    });
  }, [collections, department, category, selectedCategoryObj]);

  // Dynamic Department change handler
  const handleDepartmentChange = (newDept: 'MEN' | 'WOMEN' | 'UNISEX' | 'ACCESSORIES') => {
    setDepartment(newDept);

    // Sync productType and legacy gender
    if (newDept === 'ACCESSORIES') {
      setProductType('accessories');
      setGender('UNISEX');
    } else {
      setProductType('clothing');
      setGender(newDept);
    }

    // Refresh & validate categories for new department
    const newValidCategories = allCategories.filter((c) => (c.departments || []).includes(newDept));
    const isCurrentCatValid = newValidCategories.some((c) => c.slug === category || c.id === category);

    if (!isCurrentCatValid) {
      // Clear category and collection if no longer valid
      setCategory('');
      setCollectionId('');
    } else {
      // Re-verify collection validity
      const targetCatObj = newValidCategories.find((c) => c.slug === category || c.id === category);
      const isColValid = collections.some((col) => {
        if (col.id !== collectionId) return false;
        const depts = col.departments || ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'];
        if (!depts.includes(newDept)) return false;
        if (col.categories && col.categories.length > 0 && targetCatObj) {
          return col.categories.includes(targetCatObj.id) || col.categories.includes(targetCatObj.slug);
        }
        return true;
      });
      if (!isColValid) {
        setCollectionId('');
      }
    }
  };

  // Dynamic Category change handler
  const handleCategoryChange = (newCatSlug: string) => {
    setCategory(newCatSlug);
    const targetCatObj = allCategories.find((c) => c.slug === newCatSlug || c.id === newCatSlug);

    // Check if currently selected collection is still valid for this category
    if (collectionId) {
      const isColValid = collections.some((col) => {
        if (col.id !== collectionId) return false;
        const depts = col.departments || ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'];
        if (!depts.includes(department)) return false;
        if (col.categories && col.categories.length > 0 && targetCatObj) {
          return col.categories.includes(targetCatObj.id) || col.categories.includes(targetCatObj.slug);
        }
        return true;
      });
      if (!isColValid) {
        setCollectionId('');
      }
    }
  };

  // 2. Auto-generate URL Slug from Title if not manually edited
  useEffect(() => {
    if (!isSlugManuallyEdited && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  }, [title, isSlugManuallyEdited]);

  // 3. Auto-generate Master SKU when title or type changes
  useEffect(() => {
    if (title && !masterSku) {
      const prefix = productType === 'accessories' ? 'AVZ-ACC' : 'AVZ-CLO';
      const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
      setMasterSku(`${prefix}-${cleanTitle}-${Date.now().toString(36).substring(4).toUpperCase()}`);
    }
  }, [title, productType, masterSku]);

  // 4. Regenerate Variant Matrix when selectedSizes, colors, or masterSku change
  useEffect(() => {
    if (productType !== 'clothing') return;

    const baseSku = masterSku || `AVZ-CLO-${Date.now().toString(36).substring(4).toUpperCase()}`;

    setVariantMatrix((prevMatrix) => {
      const prevMap = new Map(prevMatrix.map((m) => [m.key, m]));
      const nextMatrix: MatrixVariantItem[] = [];

      for (const col of colors) {
        for (const sz of selectedSizes) {
          const key = `${col.name}__${sz}`;
          const existing = prevMap.get(key);

          const resolvedColHex = resolveColorHex(col.name, col.hex);
          if (existing) {
            nextMatrix.push({
              ...existing,
              colorHex: resolvedColHex,
            });
          } else {
            const colAbbr = col.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'DEF';
            nextMatrix.push({
              key,
              sku: `${baseSku}-${colAbbr}-${sz}`,
              size: sz,
              color: col.name,
              colorHex: resolvedColHex,
              stock: 10,
              enabled: true,
            });
          }
        }
      }

      return nextMatrix;
    });
  }, [colors, selectedSizes, masterSku, productType]);

  // 5. Total Stock Calculation
  const calculatedTotalStock = React.useMemo(() => {
    if (productType === 'accessories' && accessoryStockMode === 'SINGLE') {
      return Math.max(0, parseInt(singleStock, 10) || 0);
    }
    return variantMatrix.filter((v) => v.enabled).reduce((sum, v) => sum + (v.stock || 0), 0);
  }, [productType, accessoryStockMode, singleStock, variantMatrix]);

  // 6. Pricing & Gross Margin Calculation
  const marginMetrics = React.useMemo(() => {
    const base = parseFloat(basePrice);
    const sale = parseFloat(salePrice);
    const cost = parseFloat(costPrice);

    if (isNaN(base) || isNaN(cost) || base <= 0 || cost < 0) {
      return null;
    }

    const effectivePrice = !isNaN(sale) && sale > 0 ? sale : base;
    const profit = effectivePrice - cost;
    const marginPercent = ((profit / effectivePrice) * 100).toFixed(1);
    const markupPercent = cost > 0 ? (((effectivePrice - cost) / cost) * 100).toFixed(1) : '100';

    let tier: 'healthy' | 'moderate' | 'tight' = 'healthy';
    const numMargin = parseFloat(marginPercent);
    if (numMargin < 30) tier = 'tight';
    else if (numMargin < 50) tier = 'moderate';

    return {
      profit,
      marginPercent,
      markupPercent,
      tier,
      isSaleApplied: !isNaN(sale) && sale > 0,
    };
  }, [basePrice, salePrice, costPrice]);

  // 7. Image Upload Handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const newUploaded: UploadedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Client-side quick validation
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds 10MB limit.`);
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Upload failed for ${file.name}`);
        }

        const targetColor = activeUploadColor !== 'ALL' ? activeUploadColor : undefined;
        newUploaded.push({
          url: data.data.url,
          alt: `${title || 'Product'} ${targetColor ? `(${targetColor})` : ''} view ${images.length + newUploaded.length + 1}`.trim(),
          color: targetColor,
          isPrimary: images.length === 0 && newUploaded.length === 0,
          sortOrder: images.length + newUploaded.length,
          fileName: data.data.fileName,
        });

        // Trigger client-side color suggestion probe
        detectColorsFromImage(file);
      }

      setImages((prev) => [...prev, ...newUploaded]);
    } catch (err: any) {
      setUploadError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Client-side Canvas Color Extraction (free, 0 external APIs)
  const detectColorsFromImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);

        const imgData = ctx.getImageData(0, 0, 64, 64).data;
        const colorCounts: Record<string, number> = {};

        // Sample every 4th pixel
        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];

          // Quantize to nearest standard fashion shade
          const closest = findClosestPaletteColor(r, g, b);
          colorCounts[closest.name] = (colorCounts[closest.name] || 0) + 1;
        }

        const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
        const suggestions: ColorVariant[] = [];
        for (const [name] of sorted.slice(0, 3)) {
          const matched = STANDARD_PALETTE.find((p) => p.name === name);
          if (matched && !colors.some((c) => c.name.toLowerCase() === matched.name.toLowerCase())) {
            suggestions.push(matched);
          }
        }
        if (suggestions.length > 0) {
          setSuggestedColors(suggestions);
        }
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const findClosestPaletteColor = (r: number, g: number, b: number) => {
    let minDistance = Infinity;
    let closest = STANDARD_PALETTE[0];

    for (const p of STANDARD_PALETTE) {
      const pr = parseInt(p.hex.slice(1, 3), 16);
      const pg = parseInt(p.hex.slice(3, 5), 16);
      const pb = parseInt(p.hex.slice(5, 7), 16);

      const distance = Math.sqrt((r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closest = p;
      }
    }
    return closest;
  };

  const handleMakePrimary = (target: number | string) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: typeof target === 'number' ? idx === target : img.url === target,
      }))
    );
  };

  const handleMoveImage = (target: number | string, direction: 'left' | 'right') => {
    setImages((prev) => {
      const index = typeof target === 'number' ? target : prev.findIndex((img) => img.url === target);
      if (index === -1) return prev;
      const targetIdx = direction === 'left' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next.map((img, i) => ({ ...img, sortOrder: i }));
    });
  };

  const handleRemoveImage = (target: number | string) => {
    setImages((prev) => {
      const filtered = typeof target === 'number'
        ? prev.filter((_, i) => i !== target)
        : prev.filter((img) => img.url !== target);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered.map((img, i) => ({ ...img, sortOrder: i }));
    });
  };

  const handleImageColorChange = (targetUrl: string, newColor: string) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.url === targetUrl) {
          return {
            ...img,
            color: newColor.trim() ? newColor.trim() : undefined,
          };
        }
        return img;
      })
    );
  };

  const handleQuickAddColor = () => {
    const trimmed = quickColorName.trim();
    if (!trimmed) return;
    const resolvedHex = resolveColorHex(trimmed, quickColorHex);
    if (!colors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setColors((prev) => [...prev, { name: trimmed, hex: resolvedHex }]);
    }
    setActiveUploadColor(trimmed);
    setIsQuickAddingColor(false);
    setQuickColorName('');
  };

  // 8. Size Selector Controls
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => {
      if (prev.includes(size)) {
        if (prev.length === 1) return prev; // Keep at least one size
        return prev.filter((s) => s !== size);
      }
      return [...prev, size];
    });
  };

  const handleAddCustomSize = () => {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed || selectedSizes.includes(trimmed)) return;
    setSelectedSizes((prev) => [...prev, trimmed]);
    setCustomSizeInput('');
  };

  // 9. Colour Controls
  const handleAddColor = (name: string, hex: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (colors.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert(`Colour "${trimmed}" is already added.`);
      return;
    }
    const resolvedHex = resolveColorHex(trimmed, hex);
    setColors((prev) => [...prev, { name: trimmed, hex: resolvedHex }]);
    setNewColorName('');
    setNewColorHex('#0A0A0A');
    setSuggestedColors((prev) => prev.filter((s) => s.name.toLowerCase() !== trimmed.toLowerCase()));
  };

  const handleRemoveColor = (colorName: string) => {
    if (colors.length === 1) {
      alert('A product must have at least one colour.');
      return;
    }
    setColors((prev) => prev.filter((c) => c.name !== colorName));
  };

  // 10. Tag Management
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // 11. Product Type Switching Safety
  const handleRequestTypeChange = (newType: 'clothing' | 'accessories') => {
    const isDirty = title || basePrice || description || images.length > 0;
    if (isDirty) {
      setPendingTypeChange(newType);
      setShowTypeChangeConfirm(true);
    } else {
      setProductType(newType);
      updateDefaultCategoryForType(newType);
    }
  };

  const confirmTypeChange = () => {
    if (pendingTypeChange) {
      setProductType(pendingTypeChange);
      updateDefaultCategoryForType(pendingTypeChange);
    }
    setShowTypeChangeConfirm(false);
    setPendingTypeChange(null);
  };

  const updateDefaultCategoryForType = (type: 'clothing' | 'accessories') => {
    if (type === 'clothing' && clothingCategories.length > 0) {
      setCategory(clothingCategories[0].slug);
    } else if (type === 'accessories' && accessoryCategories.length > 0) {
      setCategory(accessoryCategories[0].slug);
    }
  };

  // 12. Submit (Save as Draft vs Publish)
  const handleSubmit = async (targetStatus: 'DRAFT' | 'PUBLISHED') => {
    setFormError(null);
    setFormSuccess(null);

    // Validation
    if (!title.trim()) {
      setFormError('Please enter a Product Title.');
      return;
    }

    if (!category) {
      setFormError('Please select a Category.');
      return;
    }

    const numBase = parseFloat(basePrice);
    if (isNaN(numBase) || numBase < 0) {
      setFormError('Please enter a valid non-negative Base Price (₹).');
      return;
    }

    const numSale = salePrice ? parseFloat(salePrice) : undefined;
    if (numSale !== undefined && (isNaN(numSale) || numSale >= numBase)) {
      setFormError('Sale Price must be lower than the Base Price.');
      return;
    }

    if (targetStatus === 'PUBLISHED') {
      if (!description.trim()) {
        setFormError('Product Description is required to publish.');
        return;
      }

      if (images.length === 0) {
        setFormError('Please upload at least one Product Image before publishing.');
        return;
      }

      if (productType === 'clothing' && variantMatrix.filter((v) => v.enabled).length === 0) {
        setFormError('At least one size-colour variant combination must be enabled with stock.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Build variants payload
      let variantsPayload: any[] = [];

      if (productType === 'clothing') {
        const enabledVariants = variantMatrix.filter((v) => v.enabled);
        variantsPayload = enabledVariants.map((v) => ({
          sku: v.sku.trim().toUpperCase(),
          size: v.size,
          color: v.color,
          colorHex: resolveColorHex(v.color, v.colorHex),
          stock: Math.max(0, v.stock || 0),
        }));
      } else {
        // Accessories
        if (accessoryStockMode === 'SINGLE') {
          variantsPayload = [
            {
              sku: (singleSku || masterSku || `AVZ-ACC-${Date.now().toString(36)}`).toUpperCase(),
              size: 'ONESIZE',
              color: 'Default',
              colorHex: '#0A0A0A',
              stock: Math.max(0, parseInt(singleStock, 10) || 0),
            },
          ];
        } else {
          variantsPayload = colors.map((col, idx) => ({
            sku: `${(masterSku || `AVZ-ACC-${Date.now().toString(36)}`).toUpperCase()}-${col.name.substring(0, 3).toUpperCase()}`,
            size: 'ONESIZE',
            color: col.name,
            colorHex: resolveColorHex(col.name, col.hex),
            stock: Math.max(0, parseInt(singleStock, 10) || 10),
          }));
        }
      }

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        sku: masterSku.trim().toUpperCase(),
        description: description.trim(),
        department,
        gender,
        category,
        collectionId: collectionId || undefined,
        basePrice: numBase,
        salePrice: numSale,
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        productType,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 5,
        bundleDetails: bundleDetails.trim() || undefined,
        images: images.map((img) => ({
          url: img.url,
          alt: img.alt || `${title} - View`,
          color: img.color ? img.color.trim() : undefined,
          isPrimary: img.isPrimary,
          sortOrder: img.sortOrder,
        })),
        variants: variantsPayload,
        attributes: {
          fabric: fabric.trim() || undefined,
          fit: fit.trim() || undefined,
          washCare: washCare.trim() || undefined,
        },
        tags,
        status: targetStatus,
        isFeatured,
        isNewArrival,
        isAveezOriginal,
        accessoryType: productType === 'accessories' ? category : undefined,
        matchingColors: colors.map((c) => c.name),
        metaTitle: metaTitle.trim() || undefined,
        metaDescription: metaDescription.trim() || undefined,
      };

      const endpoint = editId ? `/api/admin/products/${editId}` : '/api/admin/products';
      const method = editId ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save product.');
      }

      setFormSuccess(
        editId
          ? `Product "${title}" updated successfully with colourway images!`
          : targetStatus === 'PUBLISHED'
          ? `Product "${title}" has been published live to the catalog!`
          : `Product "${title}" has been saved as a draft.`
      );

      // Redirect after brief delay
      setTimeout(() => {
        router.push('/admin/products');
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // VIEW 1: PRODUCT TYPE SELECTION SCREEN
  // =========================================================================
  if (!productType) {
    return (
      <div className={styles.container}>
        <div className={styles.topHeader}>
          <Link href="/admin/products" className={styles.backBtn}>
            <ArrowLeft size={14} />
            <span>BACK TO PRODUCTS</span>
          </Link>
          <div className={styles.headerTitleStack}>
            <h1 className={styles.pageTitle}>ADD NEW PRODUCT</h1>
            <p className={styles.pageSubtitle}>Select catalog department to initialize creation flow</p>
          </div>
          <div style={{ width: 120 }} />
        </div>

        <div className={styles.selectionWrapper}>
          <div className={styles.selectionHeading}>
            <h2 className={styles.selectionTitle}>What type of product are you adding?</h2>
            <p className={styles.selectionSubtitle}>
              Aveez Fashion provides specialized workflows tailored for apparel sizing matrices and curated styling accessories.
            </p>
          </div>

          <div className={styles.typeGrid}>
            {/* Clothing Card */}
            <div
              className={styles.typeCard}
              onClick={() => {
                handleDepartmentChange('MEN');
              }}
              role="button"
              tabIndex={0}
            >
              <div className={styles.typeIconBadge}>
                <Shirt size={24} />
              </div>
              <h3 className={styles.typeCardTitle}>Clothing</h3>
              <p className={styles.typeCardDesc}>
                For T-shirts, shirts, hoodies, trousers, jackets, dresses, and other luxury streetwear apparel.
              </p>
              <div className={styles.typeFeatureList}>
                <div className={styles.typeFeatureItem}>
                  <Check size={14} color="#0A0A0A" />
                  <span>Size Matrix (XS–XXL, Waist 28–38, Custom)</span>
                </div>
                <div className={styles.typeFeatureItem}>
                  <Check size={14} color="#0A0A0A" />
                  <span>Multi-Colour Swatch & Image Assignment</span>
                </div>
                <div className={styles.typeFeatureItem}>
                  <Check size={14} color="#0A0A0A" />
                  <span>Size-Colour Variant Matrix & Stock Levels</span>
                </div>
                <div className={styles.typeFeatureItem}>
                  <Check size={14} color="#0A0A0A" />
                  <span>Garment Fabric & Wash Care Attributes</span>
                </div>
              </div>
              <div className={styles.typeSelectIndicator}>
                <span>CONFIGURE CLOTHING</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Accessories Card */}
            <div
              className={styles.typeCard}
              onClick={() => {
                handleDepartmentChange('ACCESSORIES');
              }}
              role="button"
              tabIndex={0}
            >
              <div className={styles.typeIconBadge}>
                <Sparkles size={24} />
              </div>
              <h3 className={styles.typeCardTitle}>Accessories</h3>
              <p className={styles.typeCardDesc}>
                For hairbands, hair clips, claw clips, keychains, bag charms, handmade accessories, and matching sets.
              </p>
              <div className={styles.typeFeatureList}>
                <div className={styles.typeFeatureItem}>
                  <Check size={14} color="#0A0A0A" />
                  <span>One-Size or Colour-Wise Variant Modes</span>
                </div>
                <div className={styles.typeFeatureItem}>
                  <Check size={14} color="#0A0A0A" />
                  <span>Curated Matching Sets & Bundle Breakdown</span>
                </div>
                <div className={styles.typeFeatureItem}>
                  <Check size={14} color="#0A0A0A" />
                  <span>Simplified Single Inventory Controls</span>
                </div>
                <div className={styles.typeFeatureItem}>
                  <Check size={14} color="#0A0A0A" />
                  <span>No Irrelevant Apparel Sizing Clutter</span>
                </div>
              </div>
              <div className={styles.typeSelectIndicator}>
                <span>CONFIGURE ACCESSORIES</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: PRODUCT CREATION FORM (CLOTHING OR ACCESSORIES)
  // =========================================================================
  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => handleRequestTypeChange(productType === 'clothing' ? 'accessories' : 'clothing')}
          >
            <ArrowLeft size={14} />
            <span>CHANGE TYPE ({productType.toUpperCase()})</span>
          </button>
          <Link href="/admin/products" className={styles.backBtn}>
            <span>CATALOG LIST</span>
          </Link>
        </div>

        <div className={styles.headerTitleStack}>
          <h1 className={styles.pageTitle}>
            {productType === 'clothing' ? 'NEW APPAREL PIECE' : 'NEW ACCESSORY ITEM'}
          </h1>
          <p className={styles.pageSubtitle}>
            {productType === 'clothing'
              ? 'Complete sizing matrix, colourways, and variant inventory.'
              : 'Handcrafted accessory specifications, colourways, and bundle options.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={styles.draftActionBtn}
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting}
          >
            <span>SAVE DRAFT</span>
          </button>
          <button
            type="button"
            className={styles.publishActionBtn}
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={isSubmitting}
          >
            <Check size={14} />
            <span>PUBLISH PRODUCT</span>
          </button>
        </div>
      </div>

      {/* Action Alerts */}
      {formError && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #F87171',
            borderRadius: '6px',
            color: '#991B1B',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <AlertCircle size={18} />
          <span>{formError}</span>
        </div>
      )}

      {formSuccess && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#ECFDF5',
            border: '1px solid #34D399',
            borderRadius: '6px',
            color: '#065F46',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Check size={18} />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Main Form Sections */}
      <form onSubmit={(e) => e.preventDefault()} className={styles.formContainer}>
        {/* ===================================================================
            SECTION A: BASIC INFORMATION
           =================================================================== */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <span className={styles.sectionNumber}>A</span>
              <div>
                <h2 className={styles.sectionTitle}>BASIC INFORMATION</h2>
                <p className={styles.sectionSubtitle}>Title, taxonomy, department classification, and URL slug</p>
              </div>
            </div>
          </div>

          <div className={styles.sectionBody}>
            <div>
              <label className={styles.label}>
                <span>Product Title</span>
                <span className={styles.labelRequired}>*</span>
              </label>
              <input
                type="text"
                required
                className={styles.input}
                placeholder={
                  productType === 'clothing'
                    ? 'e.g. Minimalist Relaxed Heavyweight Tee — Chalk White'
                    : 'e.g. Artisan Floral Embroidered Hairband — Noir & Pearl'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className={styles.formGridThree}>
              {/* 1. Department */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Department</span>
                  <span className={styles.labelRequired}>*</span>
                </label>
                <select
                  className={styles.select}
                  value={department}
                  onChange={(e) => handleDepartmentChange(e.target.value as any)}
                  disabled={loadingTaxonomy}
                >
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="UNISEX">Unisex</option>
                  <option value="ACCESSORIES">Accessories</option>
                </select>
                <span className={styles.helperText} style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                  Selected: {department === 'MEN' ? 'Men' : department === 'WOMEN' ? 'Women' : department === 'UNISEX' ? 'Unisex' : 'Accessories'}
                </span>
              </div>

              {/* 2. Category */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Category</span>
                  <span className={styles.labelRequired}>*</span>
                </label>
                <select
                  className={styles.select}
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={loadingTaxonomy || !department || availableCategories.length === 0}
                >
                  {loadingTaxonomy ? (
                    <option value="">Loading categories...</option>
                  ) : availableCategories.length === 0 ? (
                    <option value="">No categories available for {department}</option>
                  ) : (
                    <>
                      <option value="">Select Category...</option>
                      {(Object.entries(groupedCategories) as [string, CategoryOption[]][]).map(([groupName, cats]) => (
                        <optgroup key={groupName} label={groupName}>
                          {cats.map((c: CategoryOption) => (
                            <option key={c.id || c.slug} value={c.slug}>
                              {c.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </>
                  )}
                </select>
                <span className={styles.helperText} style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                  {loadingTaxonomy
                    ? 'Fetching taxonomy...'
                    : !department
                    ? 'Select department first'
                    : `${availableCategories.length} categories available`}
                </span>
              </div>

              {/* 3. Collection (Optional) */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Collection (Optional)</span>
                </label>
                <select
                  className={styles.select}
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  disabled={loadingTaxonomy || !category}
                >
                  <option value="">No Collection Assigned</option>
                  {availableCollections.map((col: CollectionOption) => (
                    <option key={col.id} value={col.id}>
                      {col.title}
                    </option>
                  ))}
                </select>
                <span className={styles.helperText} style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                  {!category
                    ? 'Select a category to view collections'
                    : availableCollections.length > 0
                    ? `${availableCollections.length} collections available`
                    : 'No specific collections for this category'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className={styles.label}>
                  <span>Description</span>
                  <span className={styles.labelRequired}>*</span>
                </label>
                <span className={styles.helperText}>{description.length} characters</span>
              </div>
              <textarea
                rows={4}
                required
                className={styles.textarea}
                placeholder="Architectural silhouette crafted with precision drape, premium combed natural fibers, and substantial weight..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* URL Slug */}
            <div className={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className={styles.label}>
                  <span>Storefront URL Slug</span>
                </label>
                {isSlugManuallyEdited && (
                  <button
                    type="button"
                    onClick={() => setIsSlugManuallyEdited(false)}
                    style={{ fontSize: '0.6875rem', color: '#71717A', cursor: 'pointer', background: 'none' }}
                  >
                    Reset to auto-generated
                  </button>
                )}
              </div>
              <div className={styles.slugRow}>
                <span className={styles.slugPrefix}>/products/</span>
                <input
                  type="text"
                  className={`${styles.input} ${styles.slugInput}`}
                  value={slug}
                  onChange={(e) => {
                    setIsSlugManuallyEdited(true);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                  }}
                />
              </div>
              <span className={styles.helperText}>Unique identifier used in search engine URLs and public routing.</span>
            </div>

            {/* Tags / Keywords */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <span>Keywords & Editorial Tags</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Type a tag and press Enter (e.g. heavyweight, 450gsm, floral)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#F4F4F5',
                    border: '1px solid #D4D4D8',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ADD
                </button>
              </div>

              {tags.length > 0 && (
                <div className={styles.tagList}>
                  {tags.map((t) => (
                    <span key={t} className={styles.tagPill}>
                      <span>#{t}</span>
                      <X size={12} className={styles.tagDelete} onClick={() => handleRemoveTag(t)} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Matching Set / Bundle Breakdown (Accessories Only) */}
            {productType === 'accessories' && category === 'matching-sets' && (
              <div
                style={{
                  padding: '14px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <label className={styles.label}>
                  <span>Bundle Contents Breakdown</span>
                </label>
                <textarea
                  rows={2}
                  className={styles.textarea}
                  placeholder="e.g. 1x Embroidered Noir Hairband, 1x Pair of Sculpted Brass Floral Clips, 1x Presentation Pouch"
                  value={bundleDetails}
                  onChange={(e) => setBundleDetails(e.target.value)}
                />
                <span className={styles.helperText}>Clearly states authentic items included in this coordinated bundle.</span>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            SECTION B: PRODUCT IMAGES & UPLOADER
           =================================================================== */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <span className={styles.sectionNumber}>B</span>
              <div>
                <h2 className={styles.sectionTitle}>PRODUCT IMAGES</h2>
                <p className={styles.sectionSubtitle}>
                  High-resolution fashion photography uploaded directly to Backblaze B2 private storage
                </p>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: images.length > 0 ? '#0A0A0A' : '#71717A' }}>
              {images.length} {images.length === 1 ? 'image' : 'images'} added
            </span>
          </div>

          <div className={styles.sectionBody}>
            {/* Colour Selector & Target Tabs */}
            <div className={styles.colorFilterBar}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A0A0A', marginRight: '4px' }}>
                Upload & View By Colour:
              </span>
              <button
                type="button"
                className={`${styles.colorFilterTab} ${activeUploadColor === 'ALL' ? styles.colorFilterTabActive : ''}`}
                onClick={() => setActiveUploadColor('ALL')}
              >
                <span>All Images</span>
                <span className={styles.colorTabCount}>{images.length}</span>
              </button>
              {colors.map((c) => {
                const countForColor = images.filter(
                  (img) => img.color && img.color.toLowerCase() === c.name.toLowerCase()
                ).length;
                const isActive = activeUploadColor.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.name}
                    type="button"
                    className={`${styles.colorFilterTab} ${isActive ? styles.colorFilterTabActive : ''}`}
                    onClick={() => setActiveUploadColor(c.name)}
                    title={`Filter or upload images for ${c.name}`}
                  >
                    <span className={styles.swatchDot} style={{ backgroundColor: resolveColorHex(c.name, c.hex) }} />
                    <span>{c.name}</span>
                    <span className={styles.colorTabCount}>{countForColor}</span>
                  </button>
                );
              })}

              {!isQuickAddingColor ? (
                <button
                  type="button"
                  className={styles.colorQuickAddBtn}
                  onClick={() => setIsQuickAddingColor(true)}
                  title="Add a new colourway"
                >
                  <Plus size={12} />
                  <span>Add Colour</span>
                </button>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="e.g. White, Olive, Beige"
                    value={quickColorName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuickColorName(val);
                      if (val.trim()) {
                        const autoHex = resolveColorHex(val);
                        if (autoHex && autoHex !== '#A1A1AA') {
                          setQuickColorHex(autoHex);
                        }
                      }
                    }}
                    style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '4px', width: '120px' }}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleQuickAddColor();
                      }
                    }}
                  />
                  <input
                    type="color"
                    value={quickColorHex}
                    onChange={(e) => setQuickColorHex(e.target.value)}
                    style={{ width: '24px', height: '24px', border: 'none', cursor: 'pointer', padding: 0, background: 'none' }}
                    title="Pick hex shade"
                  />
                  <button
                    type="button"
                    onClick={handleQuickAddColor}
                    style={{ padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#0A0A0A', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsQuickAddingColor(false);
                      setQuickColorName('');
                    }}
                    style={{ padding: '4px', border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {/* Dropzone with Color Target Banner */}
            <div
              className={styles.dropzone}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add(styles.dropzoneActive);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(styles.dropzoneActive);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(styles.dropzoneActive);
                handleFileUpload(e.dataTransfer.files);
              }}
            >
              {activeUploadColor !== 'ALL' && (
                <div className={styles.colorTargetNotice}>
                  <Palette size={14} />
                  <span>
                    Currently uploading photos specifically for colour:{' '}
                    <strong>{activeUploadColor}</strong>
                  </span>
                </div>
              )}

              <Upload size={28} className={styles.dropzoneIcon} />
              <div>
                <span className={styles.dropzoneText}>
                  {activeUploadColor !== 'ALL'
                    ? `Click to select photos or drag & drop for ${activeUploadColor}`
                    : 'Click to select images or drag and drop'}
                </span>
                <p className={styles.dropzoneSubtext}>
                  {activeUploadColor !== 'ALL'
                    ? `All uploaded photos will automatically be assigned to the "${activeUploadColor}" colourway.`
                    : 'JPG, PNG, WEBP, or AVIF up to 10MB each. Primary image appears first on the storefront.'}
                </p>
              </div>
              {isUploadingImage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0A0A0A', fontSize: '0.75rem', fontWeight: 600 }}>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Uploading to cloud storage...</span>
                </div>
              )}
            </div>

            {uploadError && (
              <div style={{ fontSize: '0.75rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Image Preview Grid */}
            {(() => {
              const visibleImages = activeUploadColor === 'ALL'
                ? images
                : images.filter((img) => img.color && img.color.toLowerCase() === activeUploadColor.toLowerCase());

              if (visibleImages.length === 0) {
                if (activeUploadColor !== 'ALL') {
                  return (
                    <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#F9FAFB', border: '1px dashed #D1D5DB', borderRadius: '6px', color: '#6B7280', fontSize: '0.8125rem' }}>
                      No photos uploaded for <strong>{activeUploadColor}</strong> yet. Drop files above or select a photo from another colour to reassign.
                    </div>
                  );
                }
                return null;
              }

              return (
                <div className={styles.imageGrid}>
                  {visibleImages.map((img) => {
                    const globalIdx = images.findIndex((i) => i.url === img.url);
                    const colorObj = colors.find((c) => c.name.toLowerCase() === (img.color || '').toLowerCase());

                    return (
                      <div key={img.url} className={`${styles.imageCard} ${img.isPrimary ? styles.imageCardPrimary : ''}`}>
                        {img.isPrimary && <span className={styles.primaryBadge}>PRIMARY</span>}

                        {/* Colour Badge Tag */}
                        <span className={styles.imageColorTag} title={img.color ? `Colour: ${img.color}` : 'All Colours / Common'}>
                          <span
                            className={styles.swatchDot}
                            style={{
                              backgroundColor: resolveColorHex(img.color || 'Default', colorObj?.hex),
                              width: '8px',
                              height: '8px',
                            }}
                          />
                          <span>{img.color || 'All Colours'}</span>
                        </span>

                        <div className={styles.imagePreviewWrapper}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.url} alt={img.alt} className={styles.imagePreviewImg} />
                        </div>

                        {/* Colour Selector Dropdown */}
                        <div className={styles.imageColorSelectWrap}>
                          <select
                            className={styles.imageColorSelect}
                            value={img.color || ''}
                            onChange={(e) => handleImageColorChange(img.url, e.target.value)}
                            title="Assign this photo to a specific colourway"
                          >
                            <option value="">All Colours / General</option>
                            {colors.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.imageToolbar}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              type="button"
                              disabled={globalIdx <= 0}
                              className={styles.imageToolbarBtn}
                              title="Move Left"
                              onClick={() => handleMoveImage(img.url, 'left')}
                            >
                              <MoveLeft size={12} />
                            </button>
                            <button
                              type="button"
                              disabled={globalIdx === -1 || globalIdx >= images.length - 1}
                              className={styles.imageToolbarBtn}
                              title="Move Right"
                              onClick={() => handleMoveImage(img.url, 'right')}
                            >
                              <MoveRight size={12} />
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            {!img.isPrimary && (
                              <button
                                type="button"
                                className={styles.imageToolbarBtn}
                                title="Mark as Primary"
                                onClick={() => handleMakePrimary(img.url)}
                              >
                                <Star size={12} />
                              </button>
                            )}
                            <button
                              type="button"
                              className={`${styles.imageToolbarBtn} ${styles.imageToolbarBtnDanger}`}
                              title="Remove image"
                              onClick={() => handleRemoveImage(img.url)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Smart Colour Detection Suggestions */}
            {suggestedColors.length > 0 && (
              <div className={styles.colorSuggestionBar}>
                <span className={styles.colorSuggestionTitle}>
                  <Palette size={14} />
                  <span>Detected palette from image:</span>
                </span>
                {suggestedColors.map((sc) => (
                  <button
                    key={sc.name}
                    type="button"
                    className={styles.colorSuggestionPill}
                    onClick={() => handleAddColor(sc.name, sc.hex)}
                  >
                    <span className={styles.swatchDot} style={{ backgroundColor: sc.hex }} />
                    <span>{sc.name}</span>
                    <Plus size={10} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            SECTION C: PRICING & ESTIMATED MARGINS
           =================================================================== */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <span className={styles.sectionNumber}>C</span>
              <div>
                <h2 className={styles.sectionTitle}>PRICING & REVENUE MARGINS</h2>
                <p className={styles.sectionSubtitle}>Customer retail prices and internal cost margins</p>
              </div>
            </div>
          </div>

          <div className={styles.sectionBody}>
            <div className={styles.formGridThree}>
              {/* Base Price */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Base Price (₹)</span>
                  <span className={styles.labelRequired}>*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  className={styles.input}
                  placeholder="e.g. 2999"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
                <span className={styles.helperText}>Customer listing price before discounts.</span>
              </div>

              {/* Sale Price */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Sale Price (₹, Optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={styles.input}
                  placeholder="e.g. 2499"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                />
                <span className={styles.helperText}>Promotional price. Must be lower than Base Price.</span>
              </div>

              {/* Cost Price */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Cost Price (₹, Admin Only)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={styles.input}
                  placeholder="e.g. 1100"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
                <span className={styles.helperText}>Never exposed publicly or sent to the customer storefront.</span>
              </div>
            </div>

            {/* Live Gross Margin Calculation */}
            {marginMetrics && (
              <div className={styles.marginCard}>
                <div className={styles.marginMetrics}>
                  <div className={styles.marginItem}>
                    <span className={styles.marginLabel}>
                      Gross Profit ({marginMetrics.isSaleApplied ? 'On Sale' : 'At Base'})
                    </span>
                    <span className={styles.marginValue}>₹{marginMetrics.profit.toLocaleString('en-IN')}</span>
                  </div>

                  <div className={styles.marginItem}>
                    <span className={styles.marginLabel}>Gross Margin</span>
                    <span className={styles.marginValue}>{marginMetrics.marginPercent}%</span>
                  </div>

                  <div className={styles.marginItem}>
                    <span className={styles.marginLabel}>Markup on Cost</span>
                    <span className={styles.marginValue}>{marginMetrics.markupPercent}%</span>
                  </div>
                </div>

                <div>
                  <span
                    className={`${styles.marginBadge} ${
                      marginMetrics.tier === 'healthy'
                        ? styles.marginBadgeHealthy
                        : marginMetrics.tier === 'moderate'
                        ? styles.marginBadgeModerate
                        : styles.marginBadgeTight
                    }`}
                  >
                    {marginMetrics.tier === 'healthy' && 'HEALTHY MARGIN (>50%)'}
                    {marginMetrics.tier === 'moderate' && 'MODERATE MARGIN (30-50%)'}
                    {marginMetrics.tier === 'tight' && 'TIGHT MARGIN (<30%)'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            SECTION D: SIZES (CLOTHING) OR INVENTORY MODE (ACCESSORIES)
           =================================================================== */}
        {productType === 'clothing' ? (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionHeaderLeft}>
                <span className={styles.sectionNumber}>D</span>
                <div>
                  <h2 className={styles.sectionTitle}>APPAREL SIZES</h2>
                  <p className={styles.sectionSubtitle}>Select sizes offered for this clothing silhouette</p>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0A0A0A' }}>
                {selectedSizes.length} sizes active
              </span>
            </div>

            <div className={styles.sectionBody}>
              <div>
                <label className={styles.label} style={{ marginBottom: '8px' }}>
                  <span>Standard Apparel Sizes</span>
                </label>
                <div className={styles.sizePresetGrid}>
                  {APPAREL_SIZE_PRESETS.map((sz) => {
                    const isActive = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        className={`${styles.sizePill} ${isActive ? styles.sizePillActive : ''}`}
                        onClick={() => toggleSize(sz)}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Show waist sizes if category is bottoms */}
              {category.includes('bottom') || category.includes('pant') || category.includes('trouser') ? (
                <div>
                  <label className={styles.label} style={{ marginBottom: '8px' }}>
                    <span>Numeric Waist Sizes</span>
                  </label>
                  <div className={styles.sizePresetGrid}>
                    {WAIST_SIZE_PRESETS.map((sz) => {
                      const isActive = selectedSizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          className={`${styles.sizePill} ${isActive ? styles.sizePillActive : ''}`}
                          onClick={() => toggleSize(sz)}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Add Custom Size */}
              <div className={styles.customSizeRow}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Custom size (e.g. 3XL, Free Size)..."
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSize();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#F4F4F5',
                    border: '1px solid #D4D4D8',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  ADD
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionHeaderLeft}>
                <span className={styles.sectionNumber}>D</span>
                <div>
                  <h2 className={styles.sectionTitle}>ACCESSORY INVENTORY CONFIGURATION</h2>
                  <p className={styles.sectionSubtitle}>Choose between simple one-size stock or colour-based inventory</p>
                </div>
              </div>
            </div>

            <div className={styles.sectionBody}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div
                  style={{
                    padding: '16px',
                    border: `2px solid ${accessoryStockMode === 'SINGLE' ? '#0A0A0A' : '#E4E4E7'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: accessoryStockMode === 'SINGLE' ? '#FAFAFA' : '#FFFFFF',
                  }}
                  onClick={() => setAccessoryStockMode('SINGLE')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <input
                      type="radio"
                      checked={accessoryStockMode === 'SINGLE'}
                      onChange={() => setAccessoryStockMode('SINGLE')}
                    />
                    <strong>Single Stock Item (One Size / No Variants)</strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#71717A', margin: 0, paddingLeft: '24px' }}>
                    Best for hair clips, bag charms, and items where all units share uniform inventory without separate color stock.
                  </p>
                </div>

                <div
                  style={{
                    padding: '16px',
                    border: `2px solid ${accessoryStockMode === 'COLORS' ? '#0A0A0A' : '#E4E4E7'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: accessoryStockMode === 'COLORS' ? '#FAFAFA' : '#FFFFFF',
                  }}
                  onClick={() => setAccessoryStockMode('COLORS')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <input
                      type="radio"
                      checked={accessoryStockMode === 'COLORS'}
                      onChange={() => setAccessoryStockMode('COLORS')}
                    />
                    <strong>Colour-Wise Variants (Separate Stock per Colour)</strong>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#71717A', margin: 0, paddingLeft: '24px' }}>
                    Best for claw clips, hairbands, or keychains that come in Gold, Silver, Noir, or Tortoise with distinct inventory counts.
                  </p>
                </div>
              </div>

              {accessoryStockMode === 'SINGLE' && (
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span>Total Stock Units</span>
                      <span className={styles.labelRequired}>*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={styles.input}
                      placeholder="e.g. 25"
                      value={singleStock}
                      onChange={(e) => setSingleStock(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      <span>Product SKU / Code</span>
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="e.g. AVZ-ACC-CLIP-01"
                      value={singleSku}
                      onChange={(e) => setSingleSku(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION E: COLOURS & SWATCHES
           =================================================================== */}
        {(productType === 'clothing' || (productType === 'accessories' && accessoryStockMode === 'COLORS')) && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionHeaderLeft}>
                <span className={styles.sectionNumber}>E</span>
                <div>
                  <h2 className={styles.sectionTitle}>COLOURWAYS & SWATCHES</h2>
                  <p className={styles.sectionSubtitle}>Define genuine colours available in inventory</p>
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0A0A0A' }}>
                {colors.length} {colors.length === 1 ? 'colour' : 'colours'} added
              </span>
            </div>

            <div className={styles.sectionBody}>
              {/* Color List */}
              <div className={styles.colorChipList}>
                {colors.map((c) => (
                  <div key={c.name} className={styles.colorChip}>
                    <span className={styles.swatchDot} style={{ backgroundColor: resolveColorHex(c.name, c.hex) }} />
                    <span>{c.name}</span>
                    <span style={{ fontSize: '0.625rem', color: '#71717A', fontFamily: 'monospace' }}>
                      {resolveColorHex(c.name, c.hex).toUpperCase()}
                    </span>
                    <span
                      className={styles.colorChipDelete}
                      onClick={() => handleRemoveColor(c.name)}
                      title="Remove colour"
                    >
                      <X size={14} />
                    </span>
                  </div>
                ))}
              </div>

              {/* Add Custom Colour */}
              <div className={styles.colorInputBar}>
                <div className={styles.colorPickerWrap}>
                  <input
                    type="color"
                    className={styles.colorPickerInput}
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    title="Choose colour hex"
                  />
                  <span style={{ fontSize: '0.6875rem', fontFamily: 'monospace' }}>{newColorHex.toUpperCase()}</span>
                </div>

                <input
                  type="text"
                  className={styles.input}
                  style={{ maxWidth: '240px' }}
                  placeholder="Colour name (e.g. White, Olive, Beige)..."
                  value={newColorName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewColorName(val);
                    if (val.trim()) {
                      const autoHex = resolveColorHex(val);
                      if (autoHex && autoHex !== '#A1A1AA') {
                        setNewColorHex(autoHex);
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddColor(newColorName, newColorHex);
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => handleAddColor(newColorName, newColorHex)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#0A0A0A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ADD COLOUR
                </button>
              </div>

              {/* Quick Preset Palette */}
              <div>
                <span className={styles.label} style={{ marginBottom: '6px' }}>
                  <span>Quick Add Standard Aveez Hues</span>
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {STANDARD_PALETTE.map((p) => {
                    const alreadyHas = colors.some((c) => c.name.toLowerCase() === p.name.toLowerCase());
                    if (alreadyHas) return null;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleAddColor(p.name, p.hex)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          background: '#FFFFFF',
                          border: '1px solid #E4E4E7',
                          borderRadius: '4px',
                          fontSize: '0.6875rem',
                          cursor: 'pointer',
                        }}
                      >
                        <span className={styles.swatchDot} style={{ backgroundColor: p.hex }} />
                        <span>{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION F: VARIANT MATRIX & STOCK (CRITICAL)
           =================================================================== */}
        {productType === 'clothing' && (
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionHeaderLeft}>
                <span className={styles.sectionNumber}>F</span>
                <div>
                  <h2 className={styles.sectionTitle}>VARIANT MATRIX & INVENTORY STOCK</h2>
                  <p className={styles.sectionSubtitle}>
                    Size × Colour combinations. Edit stock, adjust SKUs, and toggle unavailable combinations.
                  </p>
                </div>
              </div>
              <strong style={{ fontSize: '0.8125rem', color: '#0A0A0A' }}>
                Total Stock: {calculatedTotalStock} units
              </strong>
            </div>

            <div className={styles.sectionBody} style={{ padding: 0 }}>
              {/* Bulk Stock Setter */}
              <div className={styles.bulkSetterRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Bulk apply stock:</span>
                  <input
                    type="number"
                    min="0"
                    className={styles.input}
                    style={{ width: '80px', padding: '4px 8px' }}
                    value={bulkStockVal}
                    onChange={(e) => setBulkStockVal(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = Math.max(0, parseInt(bulkStockVal, 10) || 0);
                      setVariantMatrix((prev) =>
                        prev.map((v) => (v.enabled ? { ...v, stock: val } : v))
                      );
                    }}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Apply to all enabled
                  </button>
                </div>

                <div style={{ color: '#64748B', fontSize: '0.6875rem' }}>
                  {variantMatrix.filter((v) => v.enabled).length} of {variantMatrix.length} combinations active
                </div>
              </div>

              {/* Table */}
              <div className={styles.matrixWrapper}>
                <table className={styles.matrixTable}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px', textAlign: 'center' }}>ACTIVE</th>
                      <th>COLOUR</th>
                      <th>SIZE</th>
                      <th>VARIANT SKU</th>
                      <th>INVENTORY STOCK</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantMatrix.map((item, idx) => (
                      <tr key={item.key} className={!item.enabled ? styles.matrixRowDisabled : ''}>
                        <td style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setVariantMatrix((prev) =>
                                prev.map((v, i) => (i === idx ? { ...v, enabled: checked } : v))
                              );
                            }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={styles.swatchDot} style={{ backgroundColor: item.colorHex }} />
                            <strong>{item.color}</strong>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              background: '#F4F4F5',
                              borderRadius: '3px',
                              fontWeight: 700,
                            }}
                          >
                            {item.size}
                          </span>
                        </td>
                        <td>
                          <input
                            type="text"
                            className={`${styles.input} ${styles.skuInput}`}
                            disabled={!item.enabled}
                            value={item.sku}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setVariantMatrix((prev) =>
                                prev.map((v, i) => (i === idx ? { ...v, sku: val } : v))
                              );
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className={`${styles.input} ${styles.stockInput}`}
                            disabled={!item.enabled}
                            value={item.stock}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                              setVariantMatrix((prev) =>
                                prev.map((v, i) => (i === idx ? { ...v, stock: val } : v))
                              );
                            }}
                          />
                        </td>
                        <td>
                          {item.enabled ? (
                            item.stock > 0 ? (
                              <span style={{ color: '#059669', fontWeight: 600 }}>In Stock</span>
                            ) : (
                              <span style={{ color: '#DC2626', fontWeight: 600 }}>Out of Stock</span>
                            )
                          ) : (
                            <span style={{ color: '#71717A' }}>Omitted</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SECTION G: INVENTORY & THRESHOLD CONTROLS
           =================================================================== */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <span className={styles.sectionNumber}>G</span>
              <div>
                <h2 className={styles.sectionTitle}>INVENTORY CONTROLS & MASTER CODE</h2>
                <p className={styles.sectionSubtitle}>Stock alerts, threshold triggers, and master product identifiers</p>
              </div>
            </div>
          </div>

          <div className={styles.sectionBody}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Master Product SKU</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  style={{ fontFamily: 'monospace' }}
                  value={masterSku}
                  onChange={(e) => setMasterSku(e.target.value.toUpperCase())}
                />
                <span className={styles.helperText}>Parent SKU used in platform warehouse and fulfillment manifests.</span>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>Low Stock Alert Threshold</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className={styles.input}
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                />
                <span className={styles.helperText}>Triggers automated warning in admin console when stock falls below this number.</span>
              </div>
            </div>

            {/* Total Stock Summary Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
              }}
            >
              <div>
                <strong style={{ fontSize: '0.8125rem', color: '#0F172A' }}>Calculated Total Platform Inventory</strong>
                <p style={{ fontSize: '0.6875rem', color: '#64748B', margin: 0 }}>
                  Derived from legitimate enabled variant stock counts.
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0A0A' }}>
                  {calculatedTotalStock}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '4px' }}>units</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            SECTION H: PUBLISHING & MERCHANDISING
           =================================================================== */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionHeaderLeft}>
              <span className={styles.sectionNumber}>H</span>
              <div>
                <h2 className={styles.sectionTitle}>MERCHANDISING & SEO</h2>
                <p className={styles.sectionSubtitle}>Storefront badges, search engine metadata, and editorial highlights</p>
              </div>
            </div>
          </div>

          <div className={styles.sectionBody}>
            {/* Merchandising Toggles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  border: '1px solid #E4E4E7',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isNewArrival ? '#FAFAFA' : '#FFFFFF',
                }}
              >
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                />
                <div>
                  <strong style={{ fontSize: '0.75rem', display: 'block' }}>New Arrival</strong>
                  <span style={{ fontSize: '0.6875rem', color: '#71717A' }}>Features on New Drop shelf</span>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  border: '1px solid #E4E4E7',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isFeatured ? '#FAFAFA' : '#FFFFFF',
                }}
              >
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                <div>
                  <strong style={{ fontSize: '0.75rem', display: 'block' }}>Featured Piece</strong>
                  <span style={{ fontSize: '0.6875rem', color: '#71717A' }}>Spotlight in curated collections</span>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  border: '1px solid #E4E4E7',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: isAveezOriginal ? '#FAFAFA' : '#FFFFFF',
                }}
              >
                <input
                  type="checkbox"
                  checked={isAveezOriginal}
                  onChange={(e) => setIsAveezOriginal(e.target.checked)}
                />
                <div>
                  <strong style={{ fontSize: '0.75rem', display: 'block' }}>Aveez Original</strong>
                  <span style={{ fontSize: '0.6875rem', color: '#71717A' }}>Signature architectural collection</span>
                </div>
              </label>
            </div>

            {/* Garment Attributes (Fabric, Fit, WashCare) */}
            {productType === 'clothing' && (
              <div className={styles.formGridThree}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Fabric Composition</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. 100% Combed Heavyweight Cotton (280 GSM)"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Fit Profile</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Relaxed Boxy Silhouette, Drop Shoulders"
                    value={fit}
                    onChange={(e) => setFit(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    <span>Wash Care</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Machine wash cold, dry flat"
                    value={washCare}
                    onChange={(e) => setWashCare(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* SEO Metadata */}
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>SEO Title Tag (Optional)</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder={title || 'Custom search engine page title...'}
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  <span>SEO Meta Description (Optional)</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Appears in Google search snippets..."
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
            STICKY ACTION BAR
           =================================================================== */}
        <div className={styles.actionBar}>
          <div className={styles.actionSummary}>
            <span className={styles.actionStockSummary}>
              {calculatedTotalStock} total units
            </span>
            <span style={{ color: '#D4D4D8' }}>|</span>
            <span style={{ color: '#71717A' }}>
              {productType === 'clothing'
                ? `${variantMatrix.filter((v) => v.enabled).length} variants active`
                : `${accessoryStockMode === 'SINGLE' ? 'Single Stock' : `${colors.length} Colourways`}`}
            </span>
          </div>

          <div className={styles.actionButtons}>
            <button
              type="button"
              className={styles.cancelActionBtn}
              onClick={() => router.push('/admin/products')}
              disabled={isSubmitting}
            >
              CANCEL
            </button>
            <button
              type="button"
              className={styles.draftActionBtn}
              onClick={() => handleSubmit('DRAFT')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'SAVING...' : 'SAVE AS DRAFT'}
            </button>
            <button
              type="button"
              className={styles.publishActionBtn}
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={isSubmitting}
            >
              <Check size={14} />
              <span>{isSubmitting ? 'PUBLISHING...' : 'PUBLISH TO STORE'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Modal for Product Type Change */}
      {showTypeChangeConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalDialog}>
            <h3 className={styles.modalTitle}>Change Product Type?</h3>
            <p className={styles.modalText}>
              Switching between <strong>Clothing</strong> and <strong>Accessories</strong> changes the variant and inventory structure. Your general details will be retained where applicable.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelActionBtn}
                onClick={() => {
                  setShowTypeChangeConfirm(false);
                  setPendingTypeChange(null);
                }}
              >
                Keep Current
              </button>
              <button
                type="button"
                className={styles.publishActionBtn}
                onClick={confirmTypeChange}
              >
                Confirm Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NewProductPage() {
  return (
    <React.Suspense
      fallback={
        <div style={{ padding: '60px', textAlign: 'center', color: '#71717A', fontSize: '0.875rem' }}>
          Loading Catalog Studio...
        </div>
      }
    >
      <NewProductStudio />
    </React.Suspense>
  );
}
