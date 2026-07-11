/**
 * netlify/functions/sitemap.js
 *
 * Dynamic XML Sitemap index and sub-sitemaps for alzaydaninternational.com
 * ─────────────────────────────────────────────────────────────────────────────
 * Routes:
 *   GET /sitemap.xml              → Sitemap Index (references all sub-sitemaps)
 *   GET /sitemap-products.xml     → All product URLs (from Firestore + filesystem fallback)
 *   GET /sitemap-categories.xml   → Category landing page URLs
 *   GET /sitemap-pages.xml        → Static pages
 *   GET /sitemap-blogs.xml        → Published blog posts
 *
 * IMPORTANT: All sitemaps return proper application/xml Content-Type.
 * Firestore timeouts fall back to reading pre-rendered folder slugs from
 * the deployed filesystem (dist/product/*) so products are always included.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL   = 'https://www.alzaydaninternational.com';
const PROJECT_ID = 'al-zaydan-international';
const TODAY      = new Date().toISOString().split('T')[0];

// ── Static Pages ─────────────────────────────────────────────────────────────

const STATIC_PAGES = [
  { path: '/',                              changefreq: 'daily',   priority: '1.0' },
  { path: '/about',                         changefreq: 'monthly', priority: '0.8' },
  { path: '/solutions',                     changefreq: 'monthly', priority: '0.8' },
  { path: '/contact',                       changefreq: 'monthly', priority: '0.8' },
  { path: '/rfq',                           changefreq: 'monthly', priority: '0.8' },
  { path: '/categories',                    changefreq: 'weekly',  priority: '0.8' },
  { path: '/blog',                          changefreq: 'weekly',  priority: '0.7' },
  { path: '/search',                        changefreq: 'weekly',  priority: '0.6' },
  { path: '/legal',                         changefreq: 'yearly',  priority: '0.3' },
  { path: '/traffic-safety-equipment-uae',  changefreq: 'monthly', priority: '0.8' },
  { path: '/road-safety-products-uae',      changefreq: 'monthly', priority: '0.8' },
  { path: '/reflective-sheeting-uae',       changefreq: 'monthly', priority: '0.8' },
  { path: '/packaging-materials-supplier-uae', changefreq: 'monthly', priority: '0.8' },
];

// ── Filesystem Fallback: read pre-rendered product slugs ──────────────────────

function getProductSlugsFromFilesystem() {
  // Netlify deploys the dist/ folder. During function execution the working
  // directory is the site root, so "product" folder lives at /var/task/product
  // or relative to the function file at ../../product (dist layout).
  const candidates = [
    path.join(__dirname, '..', '..', 'product'),   // dist/product (most likely)
    path.join(process.cwd(), 'product'),
    '/opt/buildhome/repo/dist/product',
  ];

  for (const dir of candidates) {
    try {
      if (fs.existsSync(dir)) {
        const slugs = fs.readdirSync(dir).filter(name => {
          try {
            return fs.statSync(path.join(dir, name)).isDirectory();
          } catch {
            return false;
          }
        });
        if (slugs.length > 0) {
          console.log(`[sitemap] Filesystem fallback: found ${slugs.length} product slugs in ${dir}`);
          return slugs;
        }
      }
    } catch (_) { /* try next */ }
  }
  return [];
}

// ── Firestore Helpers ─────────────────────────────────────────────────────────

function firestoreUrl(path, query = '') {
  const apiKey = process.env.FIREBASE_API_KEY;
  const base = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/${path}`;
  const qs = [query, apiKey ? `key=${apiKey}` : ''].filter(Boolean).join('&');
  return qs ? `${base}?${qs}` : base;
}

async function fetchProducts() {
  const url = firestoreUrl('documents:runQuery');
  const body = JSON.stringify({
    structuredQuery: {
      from: [{ collectionId: 'products' }],
      select: {
        fields: [
          { fieldPath: 'slug' },
          { fieldPath: 'name' },
          { fieldPath: 'updatedAt' },
        ],
      },
    },
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) throw new Error(`Firestore ${res.status}`);
    const data = await res.json();

    const products = data
      .filter(item => item.document?.fields)
      .map(item => {
        const f = item.document.fields;
        const name = f.name?.stringValue || '';
        const slugVal = f.slug?.stringValue || '';
        const updatedAt = (f.updatedAt?.stringValue || item.document?.updateTime || TODAY).split('T')[0];
        return { slug: slugVal, name, updatedAt };
      })
      .filter(p => p.slug || p.name);

    if (products.length > 0) {
      console.log(`[sitemap] Fetched ${products.length} products from Firestore`);
      return products;
    }
    throw new Error('Firestore returned 0 products');
  } catch (err) {
    console.warn(`[sitemap] Firestore products unavailable (${err.message}), falling back to filesystem`);
    // Fallback: read slugs from pre-rendered directories
    const slugs = getProductSlugsFromFilesystem();
    return slugs.map(s => ({ slug: s, name: '', updatedAt: TODAY }));
  }
}

async function fetchCategoryDetails() {
  const url = firestoreUrl('documents/settings/categories');
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Firestore ${res.status}`);
    const data = await res.json();

    const list = [];
    const details = {};

    if (data.fields?.list?.arrayValue?.values) {
      for (const v of data.fields.list.arrayValue.values) {
        if (v.stringValue) list.push(v.stringValue);
      }
    }

    if (data.fields?.details?.mapValue?.fields) {
      const fields = data.fields.details.mapValue.fields;
      for (const key of Object.keys(fields)) {
        const f = fields[key]?.mapValue?.fields;
        if (f) details[key] = { slug: f.slug?.stringValue || '', name: f.name?.stringValue || key };
      }
    }

    if (list.length === 0) throw new Error('empty categories');
    return { list, details };
  } catch (err) {
    console.warn(`[sitemap] Firestore categories unavailable (${err.message}), using hardcoded fallback`);
    return {
      list: [
        'traffic-safety', 'safety-gear', 'reflectors-signage', 'industrial-tools',
        'road-studs', 'printing-supplies', 'flexible-packaging-raw-materials',
        'industrial-adhesive-tapes', 'industrial-sealants-adhesives',
        'industrial-diamond-tools', 'lights-lighting',
        'home-improvement-solutions', 'security-packaging-solutions', 'plastic-sheet-materials',
      ],
      details: {},
    };
  }
}

async function fetchPublishedBlogSlugs() {
  const url = firestoreUrl('documents:runQuery');
  const body = JSON.stringify({
    structuredQuery: {
      from: [{ collectionId: 'blogs' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'published' },
          op: 'EQUAL',
          value: { booleanValue: true },
        },
      },
      select: {
        fields: [
          { fieldPath: 'slug' },
          { fieldPath: 'updatedAt' },
          { fieldPath: 'publishedAt' },
        ],
      },
    },
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`Firestore ${res.status}`);
    const data = await res.json();

    return data
      .filter(item => item.document?.fields?.slug?.stringValue)
      .map(item => {
        const f = item.document.fields;
        const slug = f.slug.stringValue;
        const rawDate = f.updatedAt?.stringValue || f.publishedAt?.stringValue || TODAY;
        return { slug, lastmod: rawDate.split('T')[0] };
      });
  } catch (err) {
    console.warn(`[sitemap] Firestore blogs unavailable: ${err.message}`);
    return [];
  }
}

// ── XML Builders ─────────────────────────────────────────────────────────────

function slugify(title) {
  return String(title || '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `\n  <url>\n    <loc>${loc}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function buildSitemapIndex() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Sitemap Index -->
<!-- Generated: ${new Date().toISOString()} -->
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-categories.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-products.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-blogs.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>`;
}

function buildPagesSitemap() {
  const entries = STATIC_PAGES
    .map(p => urlEntry({
      loc: `${BASE_URL}${p.path === '/' ? '' : p.path}`,
      lastmod: TODAY,
      changefreq: p.changefreq,
      priority: p.priority,
    }))
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Pages Sitemap -->
<!-- Generated: ${new Date().toISOString()} — ${STATIC_PAGES.length} pages -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

function buildCategoriesSitemap(list, details) {
  const entries = list.map(c => {
    const det = details[c] || {};
    const cSlug = det.slug || slugify(c);
    return urlEntry({
      loc: `${BASE_URL}/category/${encodeURIComponent(cSlug)}`,
      lastmod: TODAY,
      changefreq: 'weekly',
      priority: '0.8',
    });
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Categories Sitemap -->
<!-- Generated: ${new Date().toISOString()} — ${list.length} categories -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

function buildBlogsSitemap(blogs) {
  const entries = blogs.map(b => urlEntry({
    loc: `${BASE_URL}/blog/${b.slug}`,
    lastmod: b.lastmod,
    changefreq: 'monthly',
    priority: '0.6',
  })).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Blogs Sitemap -->
<!-- Generated: ${new Date().toISOString()} — ${blogs.length} posts -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

function buildProductsSitemap(products) {
  const entries = products.map(p => {
    const pSlug = p.slug || slugify(p.name);
    return urlEntry({
      loc: `${BASE_URL}/product/${encodeURIComponent(pSlug)}`,
      lastmod: p.updatedAt || TODAY,
      changefreq: 'weekly',
      priority: '0.9',
    });
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Products Sitemap -->
<!-- Generated: ${new Date().toISOString()} — ${products.length} products -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

// ── Handler ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  const params = event.queryStringParameters || {};
  const type   = params.type || 'index';

  let body = '';

  try {
    if (type === 'index') {
      body = buildSitemapIndex();

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
      body = buildProductsSitemap(products);

    } else {
      return { statusCode: 404, body: 'Not Found' };
    }

  } catch (err) {
    console.error(`[sitemap] Unhandled error for type=${type}:`, err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Sitemap generation failed. Please try again.',
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type':  'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Robots-Tag':  'noindex', // sitemaps themselves shouldn't be indexed
      'X-Sitemap-Type': type,
    },
    body: body.trim(),
  };
};
