/**
 * netlify/functions/sitemap.js
 *
 * Dynamic XML Sitemap index and sub-sitemaps generator for alzaydaninternational.com
 * ─────────────────────────────────────────────────────────────────────────────
 * • GET /sitemap.xml                  → Returns Master Sitemap Index
 * • GET /sitemap-products.xml         → Returns all product URLs (split support)
 * • GET /sitemap-categories.xml       → Returns active category landing page URLs
 * • GET /sitemap-pages.xml            → Returns static pages list
 * • GET /sitemap-blogs.xml            → Returns published blogs
 *
 * Sitemaps are served dynamically in real-time with 1-hour CDN caching.
 */

const BASE_URL = 'https://www.alzaydaninternational.com';
const PROJECT_ID = 'al-zaydan-international';
const TODAY = new Date().toISOString().split('T')[0];

const STATIC_PAGES = [
  '/',
  '/about',
  '/solutions',
  '/contact',
  '/rfq',
  '/categories',
  '/blog',
  '/search',
  '/legal',
  '/traffic-safety-equipment-uae',
  '/road-safety-products-uae',
  '/reflective-sheeting-uae',
  '/packaging-materials-supplier-uae'
];

function slugify(title) {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

// ── Firestore REST API Queries ───────────────────────────────────────────────

async function fetchSitemapMetadata() {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/settings/sitemap`;
  const apiKey = process.env.FIREBASE_API_KEY;
  const endpoint = apiKey ? `${url}?key=${apiKey}` : url;

  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { totalProducts: 0 };
    const data = await res.json();
    return {
      totalProducts: Number(data.fields?.totalProducts?.integerValue || 0)
    };
  } catch (err) {
    console.error('[sitemap] Failed to fetch sitemap metadata doc:', err.message);
    return { totalProducts: 0 };
  }
}

async function fetchCategoryDetails() {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/settings/categories`;
  const apiKey = process.env.FIREBASE_API_KEY;
  const endpoint = apiKey ? `${url}?key=${apiKey}` : url;

  try {
    const res = await fetch(endpoint, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return { list: [], details: {} };
    const data = await res.json();

    const list = [];
    if (data.fields?.list?.arrayValue?.values) {
      for (const v of data.fields.list.arrayValue.values) {
        if (v.stringValue) list.push(v.stringValue);
      }
    }

    const details = {};
    if (data.fields?.details?.mapValue?.fields) {
      const fields = data.fields.details.mapValue.fields;
      for (const key of Object.keys(fields)) {
        const fieldsObj = fields[key]?.mapValue?.fields;
        if (fieldsObj) {
          details[key] = {
            name: fieldsObj.name?.stringValue || key,
            slug: fieldsObj.slug?.stringValue || '',
            seoTitle: fieldsObj.seoTitle?.stringValue || '',
            metaDescription: fieldsObj.metaDescription?.stringValue || ''
          };
        }
      }
    }

    return { list, details };
  } catch (err) {
    console.error('[sitemap] Failed to fetch categories from Firestore:', err.message);
    return { list: [], details: {} };
  }
}

async function fetchPublishedBlogSlugs() {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const body = JSON.stringify({
    structuredQuery: {
      from: [{ collectionId: 'blogs' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'published' },
          op: 'EQUAL',
          value: { booleanValue: true }
        }
      },
      select: {
        fields: [
          { fieldPath: 'slug' },
          { fieldPath: 'updatedAt' },
          { fieldPath: 'publishedAt' }
        ]
      }
    }
  });

  const apiKey = process.env.FIREBASE_API_KEY;
  const endpoint = apiKey ? `${url}?key=${apiKey}` : url;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(8000)
    });

    if (!res.ok) throw new Error(`Firestore REST query error ${res.status}`);
    const data = await res.json();

    return data
      .filter(item => item.document?.fields?.slug?.stringValue)
      .map(item => {
        const fields = item.document.fields;
        const slug = fields.slug.stringValue;
        const rawDate = fields.updatedAt?.stringValue || fields.publishedAt?.stringValue || TODAY;
        return { slug, lastmod: rawDate.split('T')[0] };
      });
  } catch (err) {
    console.error('[sitemap] Failed to fetch blogs from Firestore:', err.message);
    return [];
  }
}

async function fetchProducts() {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const body = JSON.stringify({
    structuredQuery: {
      from: [{ collectionId: 'products' }],
      select: {
        fields: [
          { fieldPath: 'slug' },
          { fieldPath: 'name' },
          { fieldPath: 'updatedAt' }
        ]
      }
    }
  });

  const apiKey = process.env.FIREBASE_API_KEY;
  const endpoint = apiKey ? `${url}?key=${apiKey}` : url;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(12000)
    });

    if (!res.ok) throw new Error(`Firestore REST query error ${res.status}`);
    const data = await res.json();

    return data
      .filter(item => item.document?.fields)
      .map(item => {
        const fields = item.document.fields;
        const name = fields.name?.stringValue || '';
        const slugVal = fields.slug?.stringValue || '';
        const updatedAt = fields.updatedAt?.stringValue || item.document.updateTime || TODAY;
        return {
          name,
          slug: slugVal,
          updatedAt: updatedAt.split('T')[0]
        };
      });
  } catch (err) {
    console.error('[sitemap] Failed to fetch products from Firestore:', err.message);
    return [];
  }
}

// ── XML Builders ─────────────────────────────────────────────────────────────

function buildSitemapIndex(totalProducts) {
  const productSitemapsCount = Math.max(1, Math.ceil(totalProducts / 50000));
  let productSitemapTags = '';

  if (productSitemapsCount === 1) {
    productSitemapTags = `  <sitemap>\n    <loc>${BASE_URL}/sitemap-products.xml</loc>\n  </sitemap>`;
  } else {
    for (let i = 1; i <= productSitemapsCount; i++) {
      productSitemapTags += `\n  <sitemap>\n    <loc>${BASE_URL}/sitemap-products-${i}.xml</loc>\n  </sitemap>`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-categories.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-blogs.xml</loc>
  </sitemap>${productSitemapTags}
</sitemapindex>`;
}

function buildPagesSitemap() {
  const entries = STATIC_PAGES.map(p => `
  <url>
    <loc>${BASE_URL}${p === '/' ? '' : p}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

function buildCategoriesSitemap(list, details) {
  const entries = list.map(c => {
    const detailsObj = details[c] || {};
    const cSlug = detailsObj.slug || slugify(c);
    return `
  <url>
    <loc>${BASE_URL}/category/${encodeURIComponent(cSlug)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

function buildBlogsSitemap(blogs) {
  const entries = blogs.map(b => `
  <url>
    <loc>${BASE_URL}/blog/${b.slug}</loc>
    <lastmod>${b.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

function buildProductsSitemap(products, pageNum) {
  let selected = products;
  if (pageNum) {
    selected = products.slice((pageNum - 1) * 50000, pageNum * 50000);
  }

  const entries = selected.map(p => {
    const pSlug = p.slug || slugify(p.name);
    return `
  <url>
    <loc>${BASE_URL}/product/${encodeURIComponent(pSlug)}</loc>
    <lastmod>${p.updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  const params = event.queryStringParameters || {};
  const type = params.type || 'index';
  const num = params.num ? parseInt(params.num, 10) : null;

  let body = '';
  let cacheKey = type;

  try {
    if (type === 'index') {
      const { totalProducts } = await fetchSitemapMetadata();
      body = buildSitemapIndex(totalProducts);
    } else if (type === 'pages') {
      body = buildPagesSitemap();
    } else if (type === 'categories') {
      const { list, details } = await fetchCategoryDetails();
      body = buildCategoriesSitemap(list, details);
    } else if (type === 'blogs') {
      const blogs = await fetchPublishedBlogSlugs();
      body = buildBlogsSitemap(blogs);
    } else if (type === 'products') {
      const products = await fetchProducts();
      body = buildProductsSitemap(products, num);
      if (num) cacheKey += `-${num}`;
    } else {
      // Fallback
      return { statusCode: 404, body: 'Not Found' };
    }
  } catch (err) {
    console.error('[sitemap] Handler error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Failed to generate sitemap'
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Sitemap-Type': cacheKey
    },
    body: body.trim()
  };
};
