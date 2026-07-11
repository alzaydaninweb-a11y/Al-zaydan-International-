/**
 * scripts/patch-deployed-seo.cjs
 * Patches the deployed dist/ folder to fix SEO issues without a full rebuild.
 *
 * Fixes:
 *   1. Fix og:url (was always pointing to homepage)
 *   2. Un-hide prerender-content div (remove cloaking style)
 *   3. Un-hide seo-shell div (remove cloaking, make it a visible footer)
 *   4. Write new sitemaps to dist/ directory
 */

'use strict';

const fs   = require('fs');
const path = require('path');


const DIST     = path.join(__dirname, '..', 'dist');
const BASE_URL = 'https://www.alzaydaninternational.com';
const TODAY    = new Date().toISOString().split('T')[0];

let patchedPages  = 0;
let patchedSeoShell = 0;
let patchedOgUrl  = 0;
let patchedPrerender = 0;

// ── Patch a single HTML file ─────────────────────────────────────────────────

function patchHtmlFile(filePath, canonicalUrl) {
  let html = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // 1. Fix og:url — replace any og:url pointing to homepage or wrong URL
  const ogUrlMatch = html.match(/<meta property="og:url" content="([^"]*)"[^>]*\/>/);
  if (ogUrlMatch && ogUrlMatch[1] !== canonicalUrl) {
    html = html.replace(
      /<meta property="og:url" content="[^"]*"[^>]*\/>/,
      `<meta property="og:url" content="${canonicalUrl}" />`
    );
    patchedOgUrl++;
    changed = true;
  }

  // 2. Un-hide prerender-content (remove clip/overflow hidden cloaking style)
  if (html.includes('id="prerender-content"') && html.includes('clip:rect(0,0,0,0)')) {
    html = html.replace(
      /<div id="prerender-content" style="[^"]*clip:rect\(0,0,0,0\)[^"]*"(\s+aria-hidden="true")?>/g,
      '<noscript>\n    <section id="prerender-content" style="background:#fff;border-top:1px solid #e2e8f0;padding:2rem 1rem;max-width:1200px;margin:0 auto;font-family:system-ui,sans-serif;font-size:0.9rem;color:#334155;">'
    );
    // Close tag: div → section + noscript
    html = html.replace(
      /<\/div>\s*\n<\/body>/,
      '</section>\n  </noscript>\n</body>'
    );
    patchedPrerender++;
    changed = true;
  }

  // 3. Un-hide seo-shell (remove cloaking, make it a visible footer)
  if (html.includes('id="seo-shell"') && html.includes('clip:rect(0,0,0,0)')) {
    html = html.replace(
      /<div id="seo-shell" style="[^"]*clip:rect\(0,0,0,0\)[^"]*"(\s+aria-hidden="true")?>/g,
      '<noscript>\n  <footer id="seo-footer" style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:2rem 1rem;font-size:0.85rem;color:#64748b;font-family:system-ui,sans-serif;">'
    );
    // Replace closing tag for the seo-shell
    html = html.replace(
      /<\/div>\s*\n\s*<!-- ═══ END SEO STATIC CONTENT SHELL ═══ -->/,
      '</footer>\n  </noscript>\n  <!-- END SEO FOOTER -->'
    );
    patchedSeoShell++;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf-8');
    patchedPages++;
  }
}

// ── Write sitemaps to dist/ ──────────────────────────────────────────────────

const STATIC_URLS = [
  { path: '/',                                  changefreq: 'daily',   priority: '1.0' },
  { path: '/about',                             changefreq: 'monthly', priority: '0.8' },
  { path: '/solutions',                         changefreq: 'monthly', priority: '0.8' },
  { path: '/contact',                           changefreq: 'monthly', priority: '0.8' },
  { path: '/rfq',                               changefreq: 'monthly', priority: '0.8' },
  { path: '/categories',                        changefreq: 'weekly',  priority: '0.8' },
  { path: '/blog',                              changefreq: 'weekly',  priority: '0.7' },
  { path: '/search',                            changefreq: 'weekly',  priority: '0.6' },
  { path: '/legal',                             changefreq: 'yearly',  priority: '0.3' },
  { path: '/traffic-safety-equipment-uae',      changefreq: 'monthly', priority: '0.8' },
  { path: '/road-safety-products-uae',          changefreq: 'monthly', priority: '0.8' },
  { path: '/reflective-sheeting-uae',           changefreq: 'monthly', priority: '0.8' },
  { path: '/packaging-materials-supplier-uae',  changefreq: 'monthly', priority: '0.8' },
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

function writeSitemap(filename, xml) {
  fs.writeFileSync(path.join(DIST, filename), xml, 'utf8');
  console.log(`  ✅  Wrote dist/${filename}`);
}

function writeSitemaps() {
  console.log('\n📦  Writing sitemaps to dist/…');

  // Sitemap index
  writeSitemap('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
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
</sitemapindex>`);

  // Pages sitemap
  const pagesEntries = STATIC_URLS
    .map(u => urlEntry({ loc: `${BASE_URL}${u.path === '/' ? '' : u.path}`, lastmod: TODAY, changefreq: u.changefreq, priority: u.priority }))
    .join('');
  writeSitemap('sitemap-pages.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Pages Sitemap -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pagesEntries}
</urlset>`);

  // Categories sitemap
  const catEntries = CATEGORY_SLUGS
    .map(s => urlEntry({ loc: `${BASE_URL}/category/${s}`, lastmod: TODAY, changefreq: 'weekly', priority: '0.8' }))
    .join('');
  writeSitemap('sitemap-categories.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Categories Sitemap -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${catEntries}
</urlset>`);

  // Products sitemap (from pre-rendered directories)
  const productDir = path.join(DIST, 'product');
  const productSlugs = fs.existsSync(productDir)
    ? fs.readdirSync(productDir).filter(name => {
        try { return fs.statSync(path.join(productDir, name)).isDirectory(); } catch { return false; }
      })
    : [];

  const productEntries = productSlugs
    .map(s => urlEntry({ loc: `${BASE_URL}/product/${encodeURIComponent(s)}`, lastmod: TODAY, changefreq: 'weekly', priority: '0.9' }))
    .join('');
  writeSitemap('sitemap-products.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Products Sitemap — ${productSlugs.length} products -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${productEntries}
</urlset>`);
  console.log(`       → ${productSlugs.length} product URLs included`);

  // Blogs sitemap (empty for now — Netlify function will serve real-time version)
  writeSitemap('sitemap-blogs.xml', `<?xml version="1.0" encoding="UTF-8"?>
<!-- Al Zaydan International FZE — Blogs Sitemap -->
<!-- Real-time blog sitemap served by Netlify Function -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Blogs are served dynamically by Netlify Function -->
</urlset>`);

  console.log(`\n  Total product URLs in sitemap: ${productSlugs.length}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('\n🔧  Patching deployed dist/ files for SEO fixes…\n');

  // 1. Patch index.html (homepage)
  const indexHtmlPath = path.join(DIST, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    patchHtmlFile(indexHtmlPath, `${BASE_URL}/`);
    console.log('  ✅  Patched dist/index.html');
  }

  // 2. Patch all product pages
  const productDir = path.join(DIST, 'product');
  if (!fs.existsSync(productDir)) {
    console.warn('  ⚠️  dist/product/ not found — skipping product patches');
  } else {
    const slugs = fs.readdirSync(productDir).filter(name => {
      try { return fs.statSync(path.join(productDir, name)).isDirectory(); } catch { return false; }
    });

    console.log(`\n  Patching ${slugs.length} product pages…`);
    for (const slug of slugs) {
      const htmlPath = path.join(productDir, slug, 'index.html');
      if (fs.existsSync(htmlPath)) {
        const canonicalUrl = `${BASE_URL}/product/${encodeURIComponent(slug)}`;
        patchHtmlFile(htmlPath, canonicalUrl);
      }
    }
    console.log(`  ✅  Patched ${patchedPages} pages`);
    console.log(`     • og:url fixed:           ${patchedOgUrl}`);
    console.log(`     • prerender-content shown: ${patchedPrerender}`);
    console.log(`     • seo-shell shown:         ${patchedSeoShell}`);
  }

  // 3. Patch category and static pages
  const staticDirs = ['about', 'contact', 'rfq', 'blog', 'search', 'solutions',
    'traffic-safety-equipment-uae', 'road-safety-products-uae',
    'reflective-sheeting-uae', 'packaging-materials-supplier-uae'];

  for (const dir of staticDirs) {
    const htmlPath = path.join(DIST, dir, 'index.html');
    if (fs.existsSync(htmlPath)) {
      patchHtmlFile(htmlPath, `${BASE_URL}/${dir}`);
    }
  }

  const categoryDir = path.join(DIST, 'category');
  if (fs.existsSync(categoryDir)) {
    const cats = fs.readdirSync(categoryDir).filter(name => {
      try { return fs.statSync(path.join(categoryDir, name)).isDirectory(); } catch { return false; }
    });
    for (const cat of cats) {
      const htmlPath = path.join(categoryDir, cat, 'index.html');
      if (fs.existsSync(htmlPath)) {
        patchHtmlFile(htmlPath, `${BASE_URL}/category/${cat}`);
      }
    }
  }

  // 4. Write all sitemaps
  writeSitemaps();

  console.log('\n✅  All SEO patches applied successfully!\n');
  console.log('📋  Next steps:');
  console.log('   1. Deploy this dist/ folder to Netlify (git push or drag-drop)');
  console.log('   2. In Google Search Console → Sitemaps, submit:');
  console.log('      • https://www.alzaydaninternational.com/sitemap.xml');
  console.log('      • https://www.alzaydaninternational.com/sitemap-products.xml');
  console.log('      • https://www.alzaydaninternational.com/sitemap-categories.xml');
  console.log('      • https://www.alzaydaninternational.com/sitemap-pages.xml');
  console.log('   3. Use URL Inspection tool to request indexing for top product pages\n');
}

main();
