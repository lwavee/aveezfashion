/**
 * Comprehensive fashion and apparel color mapping.
 * Maps common fashion shade names and CSS color names to their high-aesthetic hex codes.
 */
export const FASHION_COLOR_PALETTE: Record<string, string> = {
  // Whites & Off-Whites
  white: '#FFFFFF',
  'pure white': '#FFFFFF',
  'chalk white': '#F9FAFB',
  'off white': '#FAF9F6',
  'off-white': '#FAF9F6',
  snow: '#FFFAFA',
  ivory: '#FFFFF0',
  pearl: '#F8F6F0',
  cream: '#FFFDD0',
  ecru: '#F5F5DC',
  'raw ecru': '#F5F5DC',
  bone: '#E7E5E4',
  'vintage bone': '#E7E5E4',
  eggshell: '#F0EAD6',
  vanilla: '#F3E5AB',

  // Blacks & Darks
  black: '#0A0A0A',
  'onyx black': '#0A0A0A',
  onyx: '#0F0F0F',
  noir: '#0A0A0A',
  'jet black': '#050505',
  charcoal: '#334155',
  anthracite: '#293133',
  slate: '#475569',
  'slate gray': '#64748B',
  'slate grey': '#64748B',
  graphite: '#383E42',

  // Earth tones, Olives & Greens
  olive: '#708238',
  'olive green': '#556B2F',
  'dark olive': '#3B4424',
  'military green': '#4B5320',
  'army green': '#4B5320',
  sage: '#9CA986',
  'sage green': '#879777',
  moss: '#8A9A5B',
  khaki: '#C3B091',
  green: '#16A34A',
  'forest green': '#14532D',
  pine: '#01796F',
  emerald: '#10B981',
  mint: '#A7F3D0',
  'mint green': '#6EE7B7',
  pistachio: '#93C572',
  seafoam: '#9FE2BF',
  hunter: '#355E3B',
  'hunter green': '#355E3B',

  // Beiges, Browns & Tans
  beige: '#E8DCC4',
  'light beige': '#F5F2EB',
  sand: '#D8CBB5',
  nude: '#E3BC9A',
  tan: '#D2B48C',
  camel: '#C19A6B',
  caramel: '#C68B59',
  taupe: '#B38B6D',
  brown: '#78350F',
  mocha: '#6F4E37',
  coffee: '#4A2E18',
  chocolate: '#3D2314',
  chestnut: '#954535',
  cognac: '#9A463D',
  terracotta: '#E07A5F',
  rust: '#C2410C',

  // Blues
  navy: '#1E293B',
  'navy blue': '#0F172A',
  midnight: '#191970',
  'midnight blue': '#191970',
  blue: '#2563EB',
  'royal blue': '#1D4ED8',
  'sky blue': '#38BDF8',
  'baby blue': '#BAE6FD',
  denim: '#3B82F6',
  indigo: '#4338CA',
  cyan: '#06B6D4',
  teal: '#0D9488',
  turquoise: '#14B8A6',
  aqua: '#00FFFF',
  cobalt: '#0047AB',

  // Grays
  gray: '#6B7280',
  grey: '#6B7280',
  'light gray': '#E5E7EB',
  'light grey': '#E5E7EB',
  'dark gray': '#374151',
  'dark grey': '#374151',
  silver: '#C0C0C0',
  ash: '#B2BEB5',
  heather: '#9CA3AF',
  'heather grey': '#9CA3AF',
  'heather gray': '#9CA3AF',

  // Pinks & Purples
  pink: '#EC4899',
  'dusty rose': '#FDA4AF',
  rose: '#FB7185',
  blush: '#FBCFE8',
  magenta: '#D946EF',
  fuchsia: '#C026D3',
  lavender: '#C4B5FD',
  lilac: '#C8A2C8',
  purple: '#9333EA',
  violet: '#7C3AED',
  plum: '#8E4585',
  mauve: '#E0B0FF',

  // Reds & Maroons
  red: '#DC2626',
  crimson: '#991B1B',
  ruby: '#E0115F',
  scarlet: '#FF2400',
  maroon: '#800000',
  burgundy: '#800020',
  wine: '#722F37',
  cherry: '#DE3163',

  // Yellows & Oranges
  yellow: '#EAB308',
  mustard: '#E1AD01',
  ochre: '#CC7722',
  gold: '#D4AF37',
  amber: '#D97706',
  orange: '#EA580C',
  peach: '#FDBA74',
  coral: '#FB7185',
  salmon: '#FA8072',
  apricot: '#FBCEB1',
};

// Check if a color name represents a dark/black shade
const IS_BLACK_SHADE = /^(black|onyx|noir|jet\s*black|charcoal|pitch)$/i;

/**
 * Resolves any color name to its correct display hex code.
 * If existingHex is provided and is NOT the default accidental black (#0A0A0A / #000000),
 * or if the color is genuinely black, existingHex is preserved.
 * Otherwise, the color name is parsed to return the proper aesthetic color hex.
 */
export function resolveColorHex(colorName?: string, existingHex?: string): string {
  const cleanName = (colorName || '').trim().toLowerCase();
  const cleanHex = (existingHex || '').trim();

  // If colorName genuinely means black, return existingHex or default black
  if (IS_BLACK_SHADE.test(cleanName)) {
    return cleanHex || '#0A0A0A';
  }

  // If existingHex is present and is NOT an accidental default black, trust existingHex
  const isDefaultBlack =
    !cleanHex ||
    cleanHex.toLowerCase() === '#0a0a0a' ||
    cleanHex.toLowerCase() === '#000000' ||
    cleanHex.toLowerCase() === '#000' ||
    cleanHex.toLowerCase() === 'black';

  if (!isDefaultBlack && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cleanHex)) {
    return cleanHex;
  }

  // 1. Direct match in fashion palette
  if (FASHION_COLOR_PALETTE[cleanName]) {
    return FASHION_COLOR_PALETTE[cleanName];
  }

  // 2. Partial / word boundary match in fashion palette
  // Check multi-word keys first (longer matches take priority)
  const sortedPaletteKeys = Object.keys(FASHION_COLOR_PALETTE).sort((a, b) => b.length - a.length);
  for (const key of sortedPaletteKeys) {
    if (cleanName.includes(key)) {
      return FASHION_COLOR_PALETTE[key];
    }
  }

  // If cleanHex is a valid hex other than empty, return cleanHex
  if (cleanHex && cleanHex.startsWith('#')) {
    return cleanHex;
  }

  // Fallback to #A1A1AA (a neutral light-mid gray) instead of a black dot
  return '#A1A1AA';
}
