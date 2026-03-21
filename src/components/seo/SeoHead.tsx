import { useEffect } from 'react';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_URL,
  SEO_CORE_KEYWORDS,
  buildProductJsonLd,
  buildProductSeoMeta,
} from '@/config/seo';
import type { Product } from '@/services/productService';

const META = {
  desc: { name: 'description' as const },
  keywords: { name: 'keywords' as const },
  ogTitle: { property: 'og:title' as const },
  ogDesc: { property: 'og:description' as const },
  ogUrl: { property: 'og:url' as const },
  ogImage: { property: 'og:image' as const },
  ogType: { property: 'og:type' as const },
  twCard: { name: 'twitter:card' as const },
  twTitle: { name: 'twitter:title' as const },
  twDesc: { name: 'twitter:description' as const },
  twImage: { name: 'twitter:image' as const },
};

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = attr === 'name' ? `meta[name="${key}"]` : `meta[property="${key}"]`;
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
}

function setJsonLd(id: string, data: Record<string, unknown> | null) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!data) return;
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export type SeoHeadProps = {
  title?: string;
  description?: string;
  keywords?: string;
  /** Path only, e.g. /shop */
  canonicalPath?: string;
  ogImage?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown> | null;
  /** Set true for pages that should not be indexed */
  noindex?: boolean;
};

/**
 * Updates document title and meta tags for the current route.
 * For product pages use `<SeoHead product={...} productPath={location.pathname} />` instead.
 */
export function SeoHead(props: SeoHeadProps) {
  const {
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    keywords = SEO_CORE_KEYWORDS,
    canonicalPath = '/',
    ogImage = DEFAULT_OG_IMAGE,
    ogType = 'website',
    jsonLd = null,
    noindex = false,
  } = props;

  useEffect(() => {
    document.title = title;
    upsertMeta('name', META.desc.name, description);
    upsertMeta('name', META.keywords.name, keywords);
    upsertMeta('property', META.ogTitle.property, title);
    upsertMeta('property', META.ogDesc.property, description);
    upsertMeta('property', META.ogUrl.property, `${SITE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`);
    upsertMeta('property', META.ogImage.property, ogImage);
    upsertMeta('property', META.ogType.property, ogType);
    upsertMeta('name', META.twCard.name, 'summary_large_image');
    upsertMeta('name', META.twTitle.name, title);
    upsertMeta('name', META.twDesc.name, description);
    upsertMeta('name', META.twImage.name, ogImage);

    if (noindex) {
      upsertMeta('name', 'robots', 'noindex, nofollow');
    } else {
      upsertMeta('name', 'robots', 'index, follow');
    }

    setCanonical(`${SITE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`);
    setJsonLd('seo-jsonld-dynamic', jsonLd);

    return () => {
      setJsonLd('seo-jsonld-dynamic', null);
    };
  }, [title, description, keywords, canonicalPath, ogImage, ogType, jsonLd, noindex]);

  return null;
}

type ProductSeoHeadProps = {
  product: Product;
  /** `location.pathname` e.g. /product/abc123 */
  pathname: string;
};

/** Product page SEO + Product JSON-LD (for Google product rich results). */
export function ProductSeoHead({ product, pathname }: ProductSeoHeadProps) {
  useEffect(() => {
    const meta = buildProductSeoMeta(product, pathname);
    const jsonLd = buildProductJsonLd(product, pathname);

    document.title = meta.title;
    upsertMeta('name', META.desc.name, meta.description);
    upsertMeta('name', META.keywords.name, meta.keywords);
    upsertMeta('property', META.ogTitle.property, meta.title);
    upsertMeta('property', META.ogDesc.property, meta.description);
    upsertMeta('property', META.ogUrl.property, meta.canonical);
    upsertMeta('property', META.ogImage.property, meta.image);
    upsertMeta('property', META.ogType.property, 'product');
    upsertMeta('name', META.twCard.name, 'summary_large_image');
    upsertMeta('name', META.twTitle.name, meta.title);
    upsertMeta('name', META.twDesc.name, meta.description);
    upsertMeta('name', META.twImage.name, meta.image);
    upsertMeta('name', 'robots', 'index, follow');
    setCanonical(meta.canonical);
    setJsonLd('seo-jsonld-product', jsonLd);

    return () => {
      setJsonLd('seo-jsonld-product', null);
    };
  }, [product, pathname]);

  return null;
}
