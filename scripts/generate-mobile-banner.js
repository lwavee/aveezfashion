const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateMobileBanner() {
  const width = 896;
  const height = 1200;

  const inputSrc = 'C:/Users/lohar/.gemini/antigravity-ide/brain/9f1b06e1-7869-4513-9e36-49a5c7686a35/diwali_mobile_hero_1793126226471.jpg';
  const outDir = path.resolve('public/uploads/campaigns/diwali');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Clean mobile image with just the approved Aveez logo at top center
  const logoBuf = await sharp('public/brand/primary-logo-white.png')
    .resize({ width: 140 })
    .toBuffer();

  const cleanMobileBuffer = await sharp(inputSrc)
    .resize(width, height)
    .composite([
      { input: logoBuf, top: 44, left: Math.round((width - 140) / 2) },
    ])
    .webp({ quality: 90 })
    .toBuffer();

  fs.writeFileSync(path.join(outDir, 'diwali-hero-mobile-clean.webp'), cleanMobileBuffer);
  console.log('Created diwali-hero-mobile-clean.webp');

  // 2. Full banner with Diwali Campaign Badge, Offer, Headline, and CTA
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bottomScrim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#050203" stop-opacity="0"/>
          <stop offset="20%" stop-color="#0A0406" stop-opacity="0.6"/>
          <stop offset="45%" stop-color="#080304" stop-opacity="0.92"/>
          <stop offset="100%" stop-color="#050203" stop-opacity="0.98"/>
        </linearGradient>

        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#C59B27"/>
          <stop offset="50%" stop-color="#F9E79F"/>
          <stop offset="100%" stop-color="#C59B27"/>
        </linearGradient>

        <linearGradient id="cartoucheBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#3A0812" stop-opacity="0.92"/>
          <stop offset="100%" stop-color="#1A0408" stop-opacity="0.96"/>
        </linearGradient>

        <linearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#E5D4C0"/>
          <stop offset="100%" stop-color="#F3E7DA"/>
        </linearGradient>
      </defs>

      <!-- Bottom Gradient Scrim to ensure complete legibility of bottom elements -->
      <rect x="0" y="720" width="${width}" height="480" fill="url(#bottomScrim)"/>

      <!-- Chapter / Campaign Tagline -->
      <text x="${width / 2}" y="828" 
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
            font-size="16" 
            font-weight="700" 
            letter-spacing="5" 
            fill="#E1C7AC" 
            text-anchor="middle">&#8212; WINTER COLLECTION &#8212;</text>

      <!-- Main Campaign Headline -->
      <text x="${width / 2}" y="874" 
            font-family="Georgia, 'Times New Roman', serif" 
            font-size="44" 
            font-weight="700" 
            letter-spacing="3" 
            fill="#FFFFFF" 
            text-anchor="middle">THE DIWALI EDIT</text>

      <!-- Subheadline -->
      <text x="${width / 2}" y="904" 
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
            font-size="16" 
            font-weight="400" 
            font-style="italic"
            letter-spacing="1" 
            fill="#E5D4C0" 
            text-anchor="middle">Celebrate the season in timeless style.</text>

      <!-- Cartouche / Flat 40% Off Offer Badge -->
      <g transform="translate(${(width - 450) / 2}, 924)">
        <rect x="0" y="0" width="450" height="122" rx="16" 
              fill="url(#cartoucheBg)" 
              stroke="url(#goldGrad)" 
              stroke-width="1.8"/>

        <!-- Inner delicate dashed frame -->
        <rect x="6" y="6" width="438" height="110" rx="11" 
              fill="none" 
              stroke="rgba(212, 175, 55, 0.45)" 
              stroke-width="0.8" 
              stroke-dasharray="4,3"/>

        <!-- Diya icons -->
        <circle cx="36" cy="61" r="14" fill="rgba(212, 175, 55, 0.15)"/>
        <text x="36" y="66" font-size="16" text-anchor="middle">&#129684;</text>

        <circle cx="414" cy="61" r="14" fill="rgba(212, 175, 55, 0.15)"/>
        <text x="414" y="66" font-size="16" text-anchor="middle">&#129684;</text>

        <!-- FLAT -->
        <text x="225" y="32" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
              font-size="14" 
              font-weight="700" 
              letter-spacing="5" 
              fill="#F9E79F" 
              text-anchor="middle">&#8212; FLAT &#8212;</text>

        <!-- 40% OFF -->
        <text x="225" y="78" 
              font-family="Georgia, 'Times New Roman', serif" 
              font-size="46" 
              font-weight="900" 
              letter-spacing="1" 
              fill="#FFFFFF" 
              text-anchor="middle">40% OFF</text>

        <!-- ON ENTIRE COLLECTION -->
        <text x="225" y="104" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
              font-size="13" 
              font-weight="600" 
              letter-spacing="2" 
              fill="#E1C7AC" 
              text-anchor="middle">ON ENTIRE FESTIVE COLLECTION</text>
      </g>

      <!-- CTA Button -->
      <g transform="translate(${(width - 340) / 2}, 1070)">
        <rect x="0" y="0" width="340" height="52" rx="4" 
              fill="url(#btnGrad)" 
              stroke="#FFFFFF" 
              stroke-width="1"/>
        <text x="170" y="33" 
              font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
              font-size="15" 
              font-weight="700" 
              letter-spacing="2" 
              fill="#0A0A0A" 
              text-anchor="middle">EXPLORE THE COLLECTION &#8594;</text>
      </g>

      <!-- Trust Badges -->
      <text x="${width / 2}" y="1160" 
            font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
            font-size="11" 
            font-weight="600" 
            letter-spacing="1.5" 
            fill="rgba(255, 255, 255, 0.72)" 
            text-anchor="middle">FAST &amp; SECURE DELIVERY  &#8226;  PREMIUM PACKAGING  &#8226;  SAFE PAYMENTS</text>
    </svg>
  `);

  const compositeBuffer = await sharp(inputSrc)
    .resize(width, height)
    .composite([
      { input: logoBuf, top: 44, left: Math.round((width - 140) / 2) },
      { input: svgOverlay, top: 0, left: 0 }
    ])
    .webp({ quality: 92 })
    .toBuffer();

  fs.writeFileSync(path.join(outDir, 'diwali-hero-mobile.webp'), compositeBuffer);
  console.log('Created diwali-hero-mobile.webp');
}

generateMobileBanner().catch(console.error);
