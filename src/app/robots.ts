import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aveezfashion.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/account/',
          '/checkout',
          '/order/confirmation',
          '/test-payment',
          '/product/aveez-payment-test-product',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
