import { Product } from '../types'; // I need to verify if types exists, let me just assume standard any/Product for now, I'll define a local interface

export interface SchemaProduct {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  image?: string;
  images?: string[];
  brand?: string;
  category?: string;
  price?: number;
  priceType?: string;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
  sku?: string;
  faqs?: { question: string; answer: string }[];
  [key: string]: any;
}

const ORG_NAME = 'Al Zaydan International FZE';
const BASE_URL = 'https://www.alzaydaninternational.com';

/**
 * Generates Organization Schema
 */
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: ORG_NAME,
  url: BASE_URL,
  logo: `${BASE_URL}/images/logo.png`,
});

/**
 * Generates BreadcrumbList Schema
 */
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
  })),
});

/**
 * Generates Product, Offer, and AggregateRating Schema
 */
export const generateProductSchema = (product: SchemaProduct, url: string) => {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} — available at Al Zaydan International`,
    url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
  };

  // Images
  if (product.images && product.images.length > 0) {
    schema.image = product.images;
  } else if (product.image) {
    schema.image = [product.image];
  }

  // SKU / Identifiers
  if (product.sku) {
    schema.sku = product.sku;
  } else if (product.id) {
    schema.sku = product.id; // Fallback to ID as SKU
  }

  // Brand
  if (product.brand) {
    schema.brand = {
      '@type': 'Brand',
      name: product.brand,
    };
  }

  // Category
  if (product.category) {
    schema.category = product.category;
  }

  // Aggregate Rating
  if (product.rating && product.reviews && product.reviews > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      reviewCount: product.reviews.toString(),
    };
  }

  // Offer
  const offer: any = {
    '@type': 'Offer',
    url: schema.url,
    availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    priceCurrency: 'AED',
    seller: {
      '@type': 'Organization',
      name: ORG_NAME,
    },
  };

  // If price is public, add it. If hidden (B2B), DO NOT add fake prices.
  if (product.priceType !== 'hidden' && product.price != null && product.price > 0) {
    offer.price = product.price.toString();
  }

  schema.offers = offer;

  return schema;
};

/**
 * Generates ItemList Schema for Category/Search pages
 */
export const generateItemListSchema = (listName: string, products: SchemaProduct[], url: string) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => {
      const pUrl = `${BASE_URL}/product/${product.slug || product.id}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: pUrl,
        // Optionally embed minimal product data inside ListItem, but Google often just follows the URL
      };
    }),
  };
};

/**
 * Generates FAQPage Schema
 */
export const generateFaqSchema = (faqs: { question: string; answer: string }[]) => {
  if (!faqs || faqs.length === 0) return null;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
};
