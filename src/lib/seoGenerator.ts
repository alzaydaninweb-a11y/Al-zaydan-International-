import { Product } from '../context/StoreContext';
import { generateSlug } from './blogService';

export interface GeneratedSEO {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  focusKeyword: string;
  noIndex: boolean;
  noFollow: boolean;
}

const BASE_URL = 'https://www.alzaydaninternational.com';
const FALLBACK_IMAGE = `${BASE_URL}/images/og-banner.jpg`;

/**
 * Truncate text to a maximum length without cutting off mid-word.
 */
function truncateToLength(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

/**
 * Phase 1 & 2: Centralized Product SEO Generator
 * Implements priority logic: Custom > Generated > Safe Fallback
 */
export function generateProductSEO(product: Partial<Product>): GeneratedSEO {
  const name = product.name || 'Product';
  const brand = product.brand || 'Al Zaydan';
  const category = product.category || 'Industrial Supplies';
  const slug = product.slug || generateSlug(name) || 'product';

  const canonicalUrl = `${BASE_URL}/product/${slug}`;
  const primaryImage = product.image || (product.images && product.images[0]) || FALLBACK_IMAGE;

  // 1. Title Generation (Target: 50-60 chars)
  let generatedTitle = `${name} Supplier UAE | ${brand}`;
  if (generatedTitle.length > 60) {
    generatedTitle = `${name} | Al Zaydan International`;
  }
  const title = product.seoTitle || generatedTitle;

  // 2. Meta Description Generation (Target: 140-160 chars)
  const generatedDesc = `Buy premium ${name} from Al Zaydan International. UAE supplier for ${category} and safety solutions. Request a bulk quote today.`;
  const description = product.metaDescription || (product.description ? truncateToLength(product.description, 155) : generatedDesc);

  // 3. Keywords Generation
  const generatedKeyword = `${name} supplier uae`;
  const focusKeyword = product.focusKeyword || generatedKeyword;

  // 4. Open Graph Generation
  const ogTitle = product.ogTitle || title;
  const ogDescription = product.ogDescription || description;
  const ogImage = product.ogImage || primaryImage;

  // 5. Twitter Generation
  const twitterTitle = product.twitterTitle || ogTitle;
  const twitterDescription = product.twitterDescription || ogDescription;
  const twitterImage = product.twitterImage || ogImage;

  return {
    title,
    description,
    canonical: product.canonicalUrl || canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    focusKeyword,
    noIndex: product.noIndex || false,
    noFollow: product.noFollow || false,
  };
}

/**
 * Phase 7: Centralized Category SEO Generator
 */
export function generateCategorySEO(
  categoryName: string, 
  categorySlug: string, 
  customDetails?: { seoTitle?: string; metaDescription?: string; }
): GeneratedSEO {
  const canonicalUrl = `${BASE_URL}/category/${categorySlug}`;
  
  const generatedTitle = `${categoryName} Supplier UAE | Bulk Procurement`;
  const title = customDetails?.seoTitle || generatedTitle;

  const generatedDesc = `Browse all ${categoryName} products from Al Zaydan International. Wholesale pricing and bulk supply across the UAE and GCC.`;
  const description = customDetails?.metaDescription || generatedDesc;

  return {
    title,
    description,
    canonical: canonicalUrl,
    ogTitle: title,
    ogDescription: description,
    ogImage: FALLBACK_IMAGE,
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: FALLBACK_IMAGE,
    focusKeyword: `${categoryName} uae`,
    noIndex: false,
    noFollow: false,
  };
}
