async function testProd() {
  const t0 = Date.now();
  try {
    const res = await fetch('https://aveezfashion.vercel.app/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    });
    const ttfb = Date.now() - t0;
    const html = await res.text();
    console.log('Production URL: https://aveezfashion.vercel.app/');
    console.log('Status:', res.status, res.statusText);
    console.log('TTFB:', ttfb + 'ms');
    console.log('HTML Size:', (html.length / 1024).toFixed(1) + ' KB');
    console.log('Cache-Control:', res.headers.get('cache-control'));
    console.log('Vercel Edge ID:', res.headers.get('x-vercel-id'));

    // Count script tags, link tags, images in HTML
    const scripts = (html.match(/<script/gi) || []).length;
    const styles = (html.match(/<link[^>]+rel=["']stylesheet/gi) || []).length;
    const images = (html.match(/<img/gi) || []).length;
    console.log('Script tags count in HTML:', scripts);
    console.log('Stylesheet links:', styles);
    console.log('img tags count in initial HTML:', images);

    // Check title and meta description
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    console.log('Title:', titleMatch ? titleMatch[1] : 'NONE');
    console.log('Description:', descMatch ? descMatch[1] : 'NONE');

    // Check JSON-LD structured data
    const jsonLdMatches = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    console.log('JSON-LD scripts found:', jsonLdMatches ? jsonLdMatches.length : 0);

    // Check active theme content
    console.log('Contains Diwali text:', html.includes('DIWALI') || html.includes('Diwali') || html.includes('दिवाली'));
    console.log('Contains Wear Different:', html.includes('WEAR DIFFERENT'));
    console.log('Contains Categories:', html.includes('Shop By Category') || html.includes('SHOP BY CATEGORY') || html.includes('CATEGORIES'));

    // Extract all image URLs from initial HTML
    const imgUrls = [];
    const srcMatches = html.matchAll(/src=["']([^"']+)["']/gi);
    for (const match of srcMatches) {
      if (match[1].match(/\.(png|jpg|jpeg|webp|svg|avif)/i) || match[1].includes('/_next/image')) {
        imgUrls.push(match[1]);
      }
    }
    console.log('Image URLs found in HTML (' + imgUrls.length + '):');
    imgUrls.slice(0, 15).forEach(u => console.log('  -', u));

  } catch (err) {
    console.error('Fetch prod failed:', err);
  }
}

testProd().catch(console.error);

