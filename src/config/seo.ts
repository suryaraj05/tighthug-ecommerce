/**
 * TightHug Store — central SEO configuration
 *
 * Used by index.html (static) and SeoHead (dynamic routes + product pages).
 * Set VITE_SITE_URL in .env to your production URL (e.g. https://www.tighthug.in).
 */

import type { Product } from '@/services/productService';

export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.tighthug.in').replace(/\/$/, '');

export const SEO_BRAND = 'TightHug';
export const SEO_BRAND_VARIANTS = 'TightHug, Tight Hug, TightHug Store, Tight Hug Store';

/** Primary local + intent keywords (Adilabad Telangana + India online fashion). */
export const SEO_CORE_KEYWORDS = [
  SEO_BRAND,
  'Tight Hug',
  'TightHug store',
  'Tight Hug store',
  'tighthug online',
  'Adilabad clothing store',
  'Adilabad clothes',
  'Adilabad dresses',
  "Adilabad men's wear",
  'Adilabad mens wear',
  'men wear Adilabad',
  "men's wear India",
  'mens wear online India',
  'streetwear India',
  'premium streetwear',
  'online dresses India',
  'modern dresses',
  'casual dresses men',
  'hoodies online India',
  't-shirts online India',
  'buy clothes online India',
  'Telangana fashion',
].join(', ');

export const DEFAULT_TITLE =
  'TightHug Store | Premium Streetwear & Dresses — Adilabad & India Online';

export const DEFAULT_DESCRIPTION =
  'TightHug (Tight Hug) — premium streetwear and modern dresses. Shop hoodies, t-shirts, jackets, pants & more. ' +
  'Adilabad clothing store with India-wide delivery. Search TightHug or Tight Hug to find our official store.';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const SHOP_TITLE = 'Shop All | TightHug Store — Streetwear, Dresses & Men’s Wear Online';

export const SHOP_DESCRIPTION =
  'Browse TightHug’s full catalog: hoodies, t-shirts, jackets, pants, shorts & modern dresses. ' +
  'Adilabad clothing brand with delivery across India. Search TightHug or Tight Hug for our official store.';

export function toAbsoluteUrl(pathOrUrl: string | undefined): string {
  if (!pathOrUrl) return DEFAULT_OG_IMAGE;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

/** Homepage / site-wide JSON-LD (Organization + WebSite + local ClothingStore). */
export function buildSiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SEO_BRAND,
        alternateName: ['Tight Hug', 'TightHug Store'],
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.svg`,
        description:
          'TightHug is a premium streetwear and clothing brand. Find us by searching TightHug or Tight Hug.',
        sameAs: [] as string[],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: `${SEO_BRAND} Store`,
        publisher: { '@id': `${SITE_URL}/#organization` },
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'ClothingStore',
        '@id': `${SITE_URL}/#local`,
        name: `${SEO_BRAND} — Adilabad`,
        image: DEFAULT_OG_IMAGE,
        url: SITE_URL,
        description:
          'Clothing and streetwear: dresses, men’s wear, hoodies, and modern fashion. Serving Adilabad and all of India online.',
        priceRange: '₹₹',
        areaServed: [
          { '@type': 'City', name: 'Adilabad', containedInPlace: { '@type': 'State', name: 'Telangana' } },
          { '@type': 'Country', name: 'India' },
        ],
      },
    ],
  };
}

function truncate(text: string, max: number): string {
  const t = text.trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

/**
 * Meta title / description / keywords for a product page.
 * Optional product.seoTitle, seoDescription, seoKeywords override auto templates.
 */
export function buildProductSeoMeta(product: Product, productPath: string) {
  const baseKeywords = [
    product.name,
    product.category,
    product.season,
    SEO_BRAND,
    'Tight Hug',
    'buy online India',
    'Adilabad',
    'streetwear',
  ];

  const title =
    product.seoTitle?.trim() ||
    `${product.name} | ${SEO_BRAND} — ${product.category} | Shop Online`;

  const description =
    product.seoDescription?.trim() ||
    truncate(
      `${product.name} — ${product.description} ${SEO_BRAND} Store. ${product.category}, ${product.season}. ` +
        'Men’s wear & modern fashion. Ships across India.',
      160
    );

  const keywords =
    product.seoKeywords?.trim() || [...baseKeywords, SEO_CORE_KEYWORDS.split(', ').slice(0, 8).join(', ')].join(', ');

  const canonical = `${SITE_URL}${productPath}`;
  const image = product.images?.[0] ? toAbsoluteUrl(String(product.images[0])) : DEFAULT_OG_IMAGE;

  return { title, description, keywords, canonical, image };
}

export function buildProductJsonLd(product: Product, productPath: string): Record<string, unknown> {
  const { canonical, image } = buildProductSeoMeta(product, productPath);
  const hasMainStock = Object.values(product.stock || {}).some((n) => n > 0);
  const hasVariantStock =
    product.variants?.some((v) => v.stock && Object.values(v.stock).some((n) => n > 0)) ?? false;
  const availability =
    hasMainStock || hasVariantStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: truncate(product.description, 5000),
    image: product.images?.length ? product.images.map((img) => toAbsoluteUrl(String(img))) : [image],
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: SEO_BRAND,
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'INR',
      price: product.price,
      availability,
      seller: {
        '@type': 'Organization',
        name: SEO_BRAND,
        url: SITE_URL,
      },
    },
  };
}
