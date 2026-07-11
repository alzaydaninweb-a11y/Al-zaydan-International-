#!/usr/bin/env node
/**
 * scripts/generate-sitemap.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Build-time sitemap generator for alzaydaninternational.com
 *
 * Run:  node scripts/generate-sitemap.cjs
 *       (automatically called by `npm run build` via postbuild hook)
 *
 * Writes:
 *   public/sitemap.xml              → <sitemapindex> linking all sub-sitemaps
 *   public/sitemap-products.xml     → all pre-rendered product URLs
 *   public/sitemap-pages.xml        → static pages
 *   public/sitemap-categories.xml   → category pages
 *   public/sitemap-blogs.xml        → published blog posts (fetched from Firestore)
 *
 * The Netlify Function at /sitemap.xml provides identical real-time output.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs = require('fs');
const path = require('path');

// Load .env.local if present (local development)
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
} catch (_) {
  // dotenv not available in some environments — env vars already set by CI/CD
}

const BASE_URL = 'https://www.alzaydaninternational.com';
const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'al-zaydan-international';
const API_KEY = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
const TODAY = new Date().toISOString().split('T')[0];

const DIST = path.join(__dirname, '..', 'dist');
const PUBLIC = path.join(__dirname, '..', 'public');

const STATIC_URLS = [
  { path: '/',                                   changefreq: 'daily',   priority: '1.0' },
  { path: '/about',                              changefreq: 'monthly', priority: '0.8' },
  { path: '/solutions',                          changefreq: 'monthly', priority: '0.8' },
  { path: '/contact',                            changefreq: 'monthly', priority: '0.8' },
  { path: '/rfq',                                changefreq: 'monthly', priority: '0.8' },
  { path: '/categories',                         changefreq: 'weekly',  priority: '0.8' },
  { path: '/blog',                               changefreq: 'weekly',  priority: '0.7' },
  { path: '/search',                             changefreq: 'weekly',  priority: '0.6' },
  { path: '/legal',                              changefreq: 'yearly',  priority: '0.3' },
  { path: '/traffic-safety-equipment-uae',       changefreq: 'monthly', priority: '0.8' },
  { path: '/road-safety-products-uae',           changefreq: 'monthly', priority: '0.8' },
  { path: '/reflective-sheeting-uae',            changefreq: 'monthly', priority: '0.8' },
  { path: '/packaging-materials-supplier-uae',   changefreq: 'monthly', priority: '0.8' },
];

const CATEGORY_SLUGS = [
  'traffic-safety','safety-gear','reflectors-signage','industrial-tools',
  'road-studs','printing-supplies','flexible-packaging-raw-materials',
  'industrial-adhesive-tapes','industrial-sealants-adhesives',
  'industrial-diamond-tools','lights-lighting','home-improvement-solutions',
  'security-packaging-solutions','plastic-sheet-materials',
];

function urlEntry({ loc, lastmod, changefreq, priority }) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `\n  <url>\n    <loc>${loc}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

function writePublic(filename, xml) {
  fs.mkdirSync(PUBLIC, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC, filename), xml, 'utf8');
  console.log(`  ✅  Written → public/${filename}`);
}

async function fetchBlogSlugs() {
  const endpoint = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const url = API_KEY ? `${endpoint}?key=${API_KEY}` : endpoint;
  const body = JSON.stringify({
    structuredQuery: {
      from: [{ collectionId: 'blogs' }],
      where: { fieldFilter: { field: { fieldPath: 'published' }, op: 'EQUAL', value: { booleanValue: true } } },
      select: { fields: [{ fieldPath: 'slug' }, { fieldPath: 'updatedAt' }, { fieldPath: 'publishedAt' }] },
    },
  });

  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  if (!res.ok) throw new Error(`Firestore responded ${res.status}: ${await res.text()}`);
  const data = await res.json();

  return data
    .filter(item => item.document?.fields?.slug?.stringValue)
    .map(item => {
      const f = item.document.fields;
      const rawDate = f.updatedAt?.stringValue || f.publishedAt?.stringValue || TODAY;
      return { slug: f.slug.stringValue, lastmod: rawDate.split('T')[0] };
    })
    .sort((a, b) => b.lastmod.localeCompare(a.lastmod));
}

function getProductSlugsFromDist() {
  const productDir = path.join(DIST, 'product');
  if (!fs.existsSync(productDir)) return [];
  return fs.readdirSync(productDir).filter(name => {
    try { return fs.statSync(path.join(productDir, name)).isDirectory(); } catch { return false; }
  });
}

async function main() {
  console.log('\n🗺  Generating all sitemap files…\n');

  // ── 1. Sitemap Index (the master file) ────────────────────────────────────
  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Sitemap Index -->
<!-- Build-time generated: ${new Date().toISOString()} -->
<!-- Real-time version served by Netlify Function at /sitemap.xml -->
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
  writePublic('sitemap.xml', sitemapIndexXml);

  // ── 2. Pages sitemap ─────────────────────────────────────────────────────
  const pagesEntries = STATIC_URLS
    .map(u => urlEntry({ loc: `${BASE_URL}${u.path === '/' ? '' : u.path}`, lastmod: TODAY, changefreq: u.changefreq, priority: u.priority }))
    .join('');
  writePublic('sitemap-pages.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Pages Sitemap — ${STATIC_URLS.length} pages -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pagesEntries}
</urlset>`);

  // ── 3. Categories sitemap ─────────────────────────────────────────────────
  const catEntries = CATEGORY_SLUGS
    .map(s => urlEntry({ loc: `${BASE_URL}/category/${s}`, lastmod: TODAY, changefreq: 'weekly', priority: '0.8' }))
    .join('');
  writePublic('sitemap-categories.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Categories Sitemap — ${CATEGORY_SLUGS.length} categories -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${catEntries}
</urlset>`);
  console.log(`  📁  Categories: ${CATEGORY_SLUGS.length}`);

  // ── 4. Products sitemap (from pre-rendered dist/product/* directories) ────
  const productSlugs = getProductSlugsFromDist();
  const productEntries = productSlugs
    .map(s => urlEntry({ loc: `${BASE_URL}/product/${encodeURIComponent(s)}`, lastmod: TODAY, changefreq: 'weekly', priority: '0.9' }))
    .join('');
  writePublic('sitemap-products.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Products Sitemap — ${productSlugs.length} products -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${productEntries}
</urlset>`);
  console.log(`  📦  Products: ${productSlugs.length}`);

  // ── 5. Blogs sitemap (fetched from Firestore) ────────────────────────────
  let blogEntries = [];
  try {
    blogEntries = await fetchBlogSlugs();
    console.log(`  ✅  Fetched ${blogEntries.length} published blog post(s) from Firestore`);
  } catch (err) {
    console.warn(`  ⚠️  Could not fetch blog slugs (${err.message}) — blogs sitemap will be empty`);
  }

  const blogsXmlEntries = blogEntries
    .map(b => urlEntry({ loc: `${BASE_URL}/blog/${b.slug}`, lastmod: b.lastmod, changefreq: 'monthly', priority: '0.6' }))
    .join('') || '\n  <!-- No published blog posts at build time -->';
  writePublic('sitemap-blogs.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Blogs Sitemap — ${blogEntries.length} posts -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogsXmlEntries}
</urlset>`);

  // ── Summary ───────────────────────────────────────────────────────────────
  const totalUrls = STATIC_URLS.length + CATEGORY_SLUGS.length + productSlugs.length + blogEntries.length;
  console.log(`\n  ✅  Sitemap generation complete!`);
  console.log(`  📄  Static pages : ${STATIC_URLS.length}`);
  console.log(`  📁  Categories  : ${CATEGORY_SLUGS.length}`);
  console.log(`  📦  Products    : ${productSlugs.length}`);
  console.log(`  📝  Blog posts  : ${blogEntries.length}`);
  console.log(`  🔗  Total URLs  : ${totalUrls}\n`);
}

main().catch(err => {
  console.error('❌  Sitemap generation failed:', err);
  process.exit(0); // Non-fatal — don't break the build
});
