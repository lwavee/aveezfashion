import React from 'react';
import { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: {
    absolute: 'Contact Aveez Fashion | Customer Support',
  },
  description:
    'Contact Aveez Fashion for help with orders, shipping, returns, refunds, sizing and product questions. Email support@aveezfashion.com.',
  alternates: {
    canonical: 'https://aveezfashion.com/contact',
  },
  openGraph: {
    title: 'Contact Aveez Fashion | Customer Support',
    description:
      'Contact Aveez Fashion for help with orders, shipping, returns, refunds, sizing and product questions. Email support@aveezfashion.com.',
    url: 'https://aveezfashion.com/contact',
    siteName: 'AVEEZ FASHION',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Contact Aveez Fashion | Customer Support',
    description:
      'Contact Aveez Fashion for help with orders, shipping, returns, refunds, sizing and product questions. Email support@aveezfashion.com.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Aveez Fashion',
  description:
    'Contact Aveez Fashion for help with orders, shipping, returns, refunds, sizing and product questions.',
  url: 'https://aveezfashion.com/contact',
  mainEntity: {
    '@type': 'ClothingStore',
    name: 'AVEEZ FASHION',
    url: 'https://aveezfashion.com',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@aveezfashion.com',
      contactType: 'customer support',
      availableLanguage: ['English', 'Hindi'],
    },
  },
};

export default function ContactPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactClient />
    </>
  );
}
