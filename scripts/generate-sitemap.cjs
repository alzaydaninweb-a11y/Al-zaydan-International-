#!/usr/bin/env node
/**
 * scripts/generate-sitemap.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Build-time sitemap generator for alzaydaninternational.com
 *
 * Run:  node scripts/generate-sitemap.cjs
 *       (automatically called by `npm run build` via postbuild hook)
 *
 * Fetches published blog slugs from Firestore REST API and writes
 * public/sitemap.xml — this acts as a static fallback that is deployed
 * to the CDN. The Netlify Function at /sitemap.xml provides real-time
 * updates on top of this.
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

const STATIC_URLS = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/about', changefreq: 'monthly', priority: '0.8' },
  { path: '/solutions', changefreq: 'monthly', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  { path: '/rfq', changefreq: 'monthly', priority: '0.8' },
  { path: '/categories', changefreq: 'weekly', priority: '0.8' },
  { path: '/blog', changefreq: 'weekly', priority: '0.7' },
  { path: '/search', changefreq: 'weekly', priority: '0.6' },
  { path: '/legal', changefreq: 'yearly', priority: '0.3' },
];

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function fetchBlogSlugs() {
  const endpoint = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const url = API_KEY ? `${endpoint}?key=${API_KEY}` : endpoint;

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
      // No orderBy — sort in memory below to avoid composite index requirement
    },
  });

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    throw new Error(`Firestore responded ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const entries = data
    .filter(item => item.document?.fields?.slug?.stringValue)
    .map(item => {
      const f = item.document.fields;
      const slug = f.slug.stringValue;
      const rawDate = f.updatedAt?.stringValue || f.publishedAt?.stringValue || TODAY;
      return { slug, lastmod: rawDate.split('T')[0] };
    });

  // Sort by lastmod descending (in memory, no composite index needed)
  entries.sort((a, b) => b.lastmod.localeCompare(a.lastmod));
  return entries;
}

async function main() {
  console.log('\n🗺  Generating sitemap.xml …\n');

  let blogEntries = [];
  try {
    blogEntries = await fetchBlogSlugs();
    console.log(`  ✅  Fetched ${blogEntries.length} published blog post(s) from Firestore`);
  } catch (err) {
    console.warn(`  ⚠️   Could not fetch blog slugs (${err.message})`);
    console.warn('       Sitemap will be generated with static pages only.\n');
  }

  const staticSection = STATIC_URLS
    .map(u => urlEntry({ loc: `${BASE_URL}${u.path}`, lastmod: TODAY, changefreq: u.changefreq, priority: u.priority }))
    .join('');

  const blogSection = blogEntries.length
    ? blogEntries.map(b => urlEntry({ loc: `${BASE_URL}/blog/${b.slug}`, lastmod: b.lastmod, changefreq: 'monthly', priority: '0.6' })).join('')
    : '\n  <!-- No published blog posts at build time -->';

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — XML Sitemap -->
<!-- Build-time generated: ${new Date().toISOString()} -->
<!-- Total URLs: ${STATIC_URLS.length + blogEntries.length} -->
<!-- NOTE: Real-time version served by Netlify Function at /sitemap.xml -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- ── Static Pages ──────────────────────────────────────── -->${staticSection}

  <!-- ── Blog Posts (Firestore-dynamic, priority 0.6) ──────── -->${blogSection}

</urlset>`;

  // Write to public/ so it's available as a static file at build time
  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`  ✅  Written → ${path.relative(process.cwd(), outPath)}`);
  console.log(`\n  📄  Static pages : ${STATIC_URLS.length}`);
  console.log(`  📝  Blog posts   : ${blogEntries.length}`);
  console.log(`  🔗  Total URLs   : ${STATIC_URLS.length + blogEntries.length}\n`);
}

main().catch(err => {
  console.error('❌  Sitemap generation failed:', err);
  process.exit(0); // Non-fatal — don't break the build
});
