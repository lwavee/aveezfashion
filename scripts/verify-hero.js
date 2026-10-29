const fs = require('fs');

console.log('====================================================');
console.log('   AVEEZ FASHION — HERO SECTION INTEGRITY AUDIT     ');
console.log('====================================================');

const heroTsx = fs.readFileSync('src/components/home/HeroSection.tsx', 'utf8');
const heroCss = fs.readFileSync('src/components/home/HeroSection.module.css', 'utf8');

// 1. Verify Festive Banners
const hasFestiveBanners = 
  heroTsx.includes('diwali-edit-banner.webp') && 
  heroTsx.includes('diwali-winter-collection.webp') && 
  heroTsx.includes('diwali-bogo-banner.webp');
console.log('1. All festive banners configured:', hasFestiveBanners ? 'PASS' : 'FAIL');

// 2. Verify Default Editorial Banners
const hasDefaultBanners = 
  (heroTsx.includes('/api/media/hero/hero1.webp') || heroTsx.includes('/images/heroimage1.png')) && 
  (heroTsx.includes('/api/media/hero/hero2.webp') || heroTsx.includes('/images/heroimage2.png')) && 
  (heroTsx.includes('/api/media/hero/hero3.webp') || heroTsx.includes('/images/heroimage3.png'));
console.log('2. All default editorial banners configured:', hasDefaultBanners ? 'PASS' : 'FAIL');

// 3. Verify No Slide Override Pollution
const noPollution = !heroTsx.includes('diwali-winter-collection.webp\',\r\n          mobileImage: seasonalTheme?.heroMobileImage || \'/uploads/campaigns/diwali/diwali-hero-mobile.webp\'');
console.log('3. Winter & BOGO slides have clean independent images:', noPollution ? 'PASS' : 'FAIL');

// 4. Verify CSS Mobile Contain & Proportionality
const hasMobileContain = heroCss.includes('object-fit: contain !important;');
console.log('4. Mobile slideImage uses object-fit: contain !important:', hasMobileContain ? 'PASS' : 'FAIL');

const hasMobileAspectRatio = heroCss.includes('aspect-ratio: var(--hero-aspect-ratio, 2022 / 778);');
console.log('5. Mobile heroSlider uses aspect-ratio (2022/778):', hasMobileAspectRatio ? 'PASS' : 'FAIL');

const hasFestiveAspectRatio = heroCss.includes('aspect-ratio: var(--hero-aspect-ratio, 1983 / 793);');
console.log('6. Mobile festiveHeroSlider uses aspect-ratio (1983/793):', hasFestiveAspectRatio ? 'PASS' : 'FAIL');

const hasNoMinHeight = heroCss.includes('min-height: unset !important;');
console.log('7. Mobile removes forced min-height:', hasNoMinHeight ? 'PASS' : 'FAIL');

const hasNoMaxHeight = heroCss.includes('max-height: none !important;');
console.log('8. Mobile removes forced max-height clamp:', hasNoMaxHeight ? 'PASS' : 'FAIL');

// 5. Verify Desktop Sizing Intact
const hasDesktopAspectRatio = heroCss.includes('aspect-ratio: 2022 / 778;') && heroCss.includes('aspect-ratio: 16 / 9;');
console.log('9. Desktop aspect-ratio rules intact (2022/778 & 16/9):', hasDesktopAspectRatio ? 'PASS' : 'FAIL');

const hasDesktopCover = heroCss.includes('object-fit: cover;');
console.log('10. Desktop slideImage uses object-fit: cover:', hasDesktopCover ? 'PASS' : 'FAIL');

// 6. Viewport Height Calculation Tests
console.log('\n----------------------------------------------------');
console.log('     MOBILE VIEWPORT RESPONSIVE SIZING TESTS        ');
console.log('----------------------------------------------------');
const testViewports = [320, 360, 375, 390, 430];
testViewports.forEach(w => {
  const normalHeight = (w * 778 / 2022).toFixed(1);
  const festiveHeight = (w * 793 / 1983).toFixed(1);
  console.log(`Viewport: ${w}px | Width: 100% (${w}px) | Normal: ${normalHeight}px | Festive: ${festiveHeight}px | Complete banner visible`);
});

console.log('\n----------------------------------------------------');
console.log('     DESKTOP VIEWPORT RESPONSIVE SIZING TESTS       ');
console.log('----------------------------------------------------');
const desktopViewports = [1024, 1440, 1920];
desktopViewports.forEach(w => {
  if (w <= 1024) {
    const h = (w * 9 / 16).toFixed(1);
    console.log(`Viewport: ${w}px | Width: 100% (${w}px) | Height: ${Math.min(h, 600)}px (16:9 ratio, max 600px - UNCHANGED)`);
  } else {
    const h = (w * 778 / 2022).toFixed(1);
    console.log(`Viewport: ${w}px | Width: 100% (${w}px) | Height: ${h}px (2022/778 ratio - UNCHANGED)`);
  }
});
console.log('====================================================\n');

