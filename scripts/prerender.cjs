#!/usr/bin/env node
/**
 * prerender.cjs  — Build-time Static Pre-render for Al Zaydan International
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs AFTER `vite build` (in the `postbuild` script).
 * Reads `src/data/initialState.json` and generates a static `.html` file for
 * every product page and every key static page inside `dist/`.
 *
 * When Netlify serves these files, Googlebot and Screaming Frog see full HTML
 * content directly — without executing any JavaScript.
 *
 * Generated files:
 *   dist/product/[id]/index.html   — one per product
 *   dist/about/index.html
 *   dist/contact/index.html
 *   dist/rfq/index.html
 *   dist/blog/index.html
 *   dist/search/index.html
 *   dist/solutions/index.html
 *   dist/traffic-safety-equipment-uae/index.html
 *   dist/road-safety-products-uae/index.html
 *   dist/reflective-sheeting-uae/index.html
 *   dist/packaging-materials-supplier-uae/index.html
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Paths ────────────────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const INITIAL_DATA = path.join(ROOT, 'src', 'data', 'initialState.json');

// Load environment variables from .env.local / .env
require('dotenv').config({ path: path.join(ROOT, '.env.local') });
require('dotenv').config({ path: path.join(ROOT, '.env') });

// ── Load data ─────────────────────────────────────────────────────────────────
const data = JSON.parse(fs.readFileSync(INITIAL_DATA, 'utf-8'));
const products = (data.products || []);
const categories = (data.categories && data.categories.list) ? data.categories.list : [];
const settings = data.settings || {};

// ── Read the Vite-built index.html template ───────────────────────────────────
const templateHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf-8');

// ── Helpers ───────────────────────────────────────────────────────────────────
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slug(title) {
  return String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
}

/**
 * Patch the built index.html template with page-specific SEO fields
 * and inject a static content block visible to crawlers inside <body>.
 */
function buildPage({ title, description, canonical, ogTitle, ogDesc, bodyHtml, schemaJson }) {
  let html = templateHtml;

  // 1. Title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${esc(title)}</title>`
  );

  // 2. Meta description (first occurrence)
  html = html.replace(
    /<meta name="description"[^>]*\/>/,
    `<meta name="description" content="${esc(description)}" />`
  );

  // 3. Canonical
  html = html.replace(
    /<link rel="canonical"[^>]*\/>/,
    `<link rel="canonical" href="${esc(canonical)}" />`
  );

  // 4. OG title / description
  if (ogTitle) {
    html = html.replace(
      /<meta property="og:title"[^>]*\/>/,
      `<meta property="og:title" content="${esc(ogTitle)}" />`
    );
  }
  if (ogDesc) {
    html = html.replace(
      /<meta property="og:description"[^>]*\/>/,
      `<meta property="og:description" content="${esc(ogDesc)}" />`
    );
  }

  // 5. Inject page-specific JSON-LD schema (if any)
  if (schemaJson) {
    html = html.replace(
      '</head>',
      `<script type="application/ld+json">${JSON.stringify(schemaJson)}</script>\n</head>`
    );
  }

  // 6. Inject static crawlable content immediately before </body>
  //    (outside #root so React never touches it, but crawlers read it)
  const crawlBlock = `
  <!-- PRE-RENDERED SEO CONTENT — visible to crawlers, hidden from users -->
  <div id="prerender-content" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;" aria-hidden="true">
${bodyHtml}
  </div>`;

  html = html.replace('</body>', crawlBlock + '\n</body>');

  return html;
}

// ── Category navigation snippet (reused on every page) ───────────────────────
const categoryNavHtml = `
    <nav aria-label="Product categories">
      <h3>Browse by Category</h3>
      <ul>
${categories.map(c => `        <li><a href="/category/${encodeURIComponent(slug(c))}">${esc(c)} — Industrial Supplies UAE</a></li>`).join('\n')}
      </ul>
    </nav>
    <nav aria-label="Site pages">
      <a href="/">Home</a> |
      <a href="/about">About Us</a> |
      <a href="/solutions">Solutions</a> |
      <a href="/contact">Contact</a> |
      <a href="/rfq">Request a Quote</a> |
      <a href="/blog">Blog</a> |
      <a href="/search">All Products</a>
    </nav>`;

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT PAGES  — dist/product/[slug]/index.html
// ═══════════════════════════════════════════════════════════════════════════════
console.log(`\n🏗  Pre-rendering ${products.length} product pages…`);
let productCount = 0;

for (const p of products) {
  if (!p.id) continue;

  const pSlug = p.slug || slug(p.name);
  const pBrand = p.brand || 'Al Zaydan';
  const pCat = p.category || 'Industrial Supplies';

  // 1. Title
  let generatedTitle = `${esc(p.name)} Supplier UAE | ${esc(pBrand)}`;
  if (generatedTitle.length > 60) {
    generatedTitle = `${esc(p.name)} | Al Zaydan International`;
  }
  const productTitle = p.seoTitle || generatedTitle;

  // 2. Meta Description
  const generatedDesc = `Buy premium ${esc(p.name)} from Al Zaydan International. UAE supplier for ${esc(pCat)} and safety solutions. Request a bulk quote today.`;
  const truncate = (str, max) => str.length <= max ? str : str.substring(0, max).replace(/\\s+\\S*$/, '') + '...';
  const productDesc = p.metaDescription || (p.description ? truncate(esc(p.description), 155) : generatedDesc);

  const canonicalUrl = p.canonicalUrl || `https://www.alzaydaninternational.com/product/${encodeURIComponent(pSlug)}`;

  // Specification rows
  const specsHtml = (p.specifications && p.specifications.length > 0)
    ? `<table>
        <thead><tr><th>Specification</th><th>Value</th></tr></thead>
        <tbody>
          ${p.specifications.map(s => `<tr><td>${esc(s.key)}</td><td>${esc(s.value)}</td></tr>`).join('\n          ')}
        </tbody>
      </table>`
    : '';

  // Related products in same category (up to 5)
  const related = products
    .filter(r => r.id !== p.id && r.category === p.category)
    .slice(0, 5);

  const relatedHtml = related.length > 0
    ? `<h3>Related Products in ${esc(p.category)}</h3>
      <ul>
        ${related.map(r => `<li><a href="/product/${encodeURIComponent(r.slug || slug(r.name))}">${esc(r.name)}</a></li>`).join('\n        ')}
      </ul>`
    : '';

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Al Zaydan International FZE',
    url: 'https://www.alzaydaninternational.com',
    logo: 'https://www.alzaydaninternational.com/images/logo.png',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.alzaydaninternational.com/' },
      { '@type': 'ListItem', position: 2, name: p.category || 'Products', item: `https://www.alzaydaninternational.com/category/${encodeURIComponent(slug(p.category || ''))}` },
      { '@type': 'ListItem', position: 3, name: p.name, item: canonicalUrl }
    ]
  };

  const pSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description || `${p.name} — industrial supply available in UAE`,
    url: canonicalUrl,
  };

  if (p.images && p.images.length > 0) pSchema.image = p.images;
  else if (p.image) pSchema.image = [p.image];

  if (p.sku) pSchema.sku = p.sku;
  else if (p.id) pSchema.sku = p.id;

  if (p.brand) pSchema.brand = { '@type': 'Brand', name: p.brand };
  if (p.category) pSchema.category = p.category;

  if (p.rating && p.reviews && p.reviews > 0) {
    pSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: p.rating.toString(),
      reviewCount: p.reviews.toString(),
    };
  }

  const offer = {
    '@type': 'Offer',
    url: canonicalUrl,
    availability: p.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    priceCurrency: 'AED',
    seller: { '@type': 'Organization', name: 'Al Zaydan International FZE' },
  };

  if (p.priceType !== 'hidden' && p.price != null && p.price > 0) {
    offer.price = p.price.toString();
  }

  pSchema.offers = offer;

  const productSchemaArray = [orgSchema, breadcrumbSchema, pSchema];

  const bodyHtml = `
    <h1>${esc(p.name)}</h1>
    <p>Category: <a href="/category/${encodeURIComponent(slug(p.category || ''))}">${esc(p.category)}</a></p>
    ${p.description ? `<p>${esc(p.description)}</p>` : ''}
    ${p.brand ? `<p>Brand: ${esc(p.brand)}</p>` : ''}
    <p>Availability: ${p.inStock ? 'In Stock' : 'Out of Stock'}</p>
    ${specsHtml}
    ${relatedHtml}
    ${categoryNavHtml}
    <p><a href="/rfq">Request a Quote for ${esc(p.name)}</a></p>
    <p><a href="/contact">Contact Al Zaydan International UAE</a></p>`;

  const html = buildPage({
    title: productTitle,
    description: productDesc,
    canonical: canonicalUrl,
    ogTitle: p.ogTitle || productTitle,
    ogDesc: p.ogDescription || productDesc,
    bodyHtml,
    schemaJson: productSchemaArray,
  });

  const outPath = path.join(DIST, 'product', pSlug, 'index.html');
  writeFile(outPath, html);
  productCount++;
}
console.log(`  ✅  Written ${productCount} product HTML files → dist/product/`);


// ═══════════════════════════════════════════════════════════════════════════════
// STATIC PAGES
// ═══════════════════════════════════════════════════════════════════════════════

const STATIC_PAGES = [
  {
    route: 'about',
    title: 'About Al Zaydan International | UAE B2B Industrial Materials Company',
    description: 'Al Zaydan International FZE — Ajman-based B2B industrial materials sourcing and distribution company serving the UAE and GCC. Learn about our mission and expertise.',
    canonical: 'https://www.alzaydaninternational.com/about',
    bodyHtml: `
    <h1>About Al Zaydan International</h1>
    <p>
      Al Zaydan International FZE is a UAE-based B2B industrial materials trading and distribution
      company licensed in the Ajman Free Zone. We source, trade, and distribute industrial
      materials to businesses across the UAE and GCC region, including traffic safety equipment,
      road safety products, reflective sheeting, packaging materials, and industrial tools.
    </p>
    <h2>Our Mission</h2>
    <p>
      To connect UAE and GCC businesses with verified global suppliers of quality industrial
      materials at competitive wholesale prices — simplifying the procurement process for
      businesses of all sizes.
    </p>
    <h2>Products We Supply</h2>
    <ul>
      <li>Traffic Safety Equipment (Cones, Barriers, Delineators, Speed Bumps)</li>
      <li>Road Safety Products (Road Studs, Warning Signs, Retro-reflective Plates)</li>
      <li>Reflective Sheeting (Diamond Grade, High Intensity, DOT-C2, ECE-104, SOLAS)</li>
      <li>Packaging Materials (BOPP Tape, Hot Melt Adhesive, PE Foam, Security Tape)</li>
      <li>Industrial Adhesive Tapes (Double-sided, Aluminium Foil, PTFE, Masking)</li>
      <li>Industrial Sealants and Adhesives</li>
      <li>Industrial Diamond Tools</li>
      <li>Printing Supplies and Consumables</li>
    </ul>
    <h2>Contact</h2>
    <address>
      <p>Ajman Free Zone, C1 Building, Ajman, UAE</p>
      <p>Email: <a href="mailto:info@alzaydanintl.com">info@alzaydanintl.com</a></p>
      <p>Phone: <a href="tel:+971551551329">+971 55 155 1329</a></p>
    </address>
    ${categoryNavHtml}`,
  },
  {
    route: 'contact',
    title: 'Contact Al Zaydan International | UAE Industrial Supplies Supplier',
    description: 'Get in touch with Al Zaydan International FZE for B2B industrial materials, bulk orders, and procurement inquiries. Based in Ajman Free Zone, serving UAE and GCC.',
    canonical: 'https://www.alzaydaninternational.com/contact',
    bodyHtml: `
    <h1>Contact Al Zaydan International</h1>
    <p>Contact our team for B2B industrial materials sourcing, wholesale pricing, and bulk procurement inquiries.</p>
    <address>
      <p><strong>Al Zaydan International FZE</strong></p>
      <p>Ajman Free Zone, C1 Building, Ajman, United Arab Emirates</p>
      <p>Email: <a href="mailto:info@alzaydanintl.com">info@alzaydanintl.com</a></p>
      <p>Phone: <a href="tel:+971551551329">+971 55 155 1329</a></p>
      <p>Hours: Monday–Friday, 9:00 AM – 6:00 PM GST</p>
    </address>
    <h2>We Supply To</h2>
    <p>UAE (Dubai, Abu Dhabi, Sharjah, Ajman), Saudi Arabia, Qatar, Kuwait, Oman, Bahrain</p>
    ${categoryNavHtml}`,
  },
  {
    route: 'rfq',
    title: 'Request for Quote (RFQ) | Bulk Industrial Materials UAE — Al Zaydan International',
    description: 'Submit an RFQ for bulk industrial materials, traffic safety equipment, reflective sheeting, and packaging supplies. Al Zaydan International FZE responds within 24 hours.',
    canonical: 'https://www.alzaydaninternational.com/rfq',
    bodyHtml: `
    <h1>Request for Quote — Bulk Industrial Materials UAE</h1>
    <p>
      Submit a Request for Quote (RFQ) for bulk industrial materials from Al Zaydan International FZE.
      We supply traffic safety equipment, road safety products, reflective sheeting, packaging materials,
      adhesive tapes, and more to businesses across the UAE and GCC.
    </p>
    <h2>What You Can Request</h2>
    <ul>
      <li>Traffic safety cones, barriers, and delineators</li>
      <li>Reflective sheeting (Diamond Grade, DOT-C2, ECE-104, SOLAS)</li>
      <li>Road studs and cat eyes</li>
      <li>Packaging tape (BOPP, hot melt, double-sided, foam tape)</li>
      <li>Industrial adhesive tapes</li>
      <li>Safety gear and PPE</li>
      <li>Printing supplies and consumables</li>
    </ul>
    <p>Our sales team will respond with a customised quote within 24 hours.</p>
    ${categoryNavHtml}`,
  },
  {
    route: 'blog',
    title: 'Blog — Industrial Supplies & Safety Equipment UAE | Al Zaydan International',
    description: 'Read articles about traffic safety equipment, road safety products, industrial materials, reflective sheeting, and procurement best practices in UAE and GCC.',
    canonical: 'https://www.alzaydaninternational.com/blog',
    bodyHtml: `
    <h1>Industrial Supplies &amp; Safety Equipment Blog — UAE</h1>
    <p>
      Stay informed with articles from Al Zaydan International covering traffic safety equipment,
      road safety products, reflective sheeting standards, packaging materials, industrial supplies
      procurement, and B2B sourcing best practices in the UAE and GCC.
    </p>
    ${categoryNavHtml}`,
  },
  {
    route: 'search',
    title: 'All Industrial Products — Traffic Safety, Reflective Materials, Packaging UAE | Al Zaydan',
    description: 'Browse all industrial products from Al Zaydan International: traffic safety equipment, reflective sheeting, road safety products, packaging materials, adhesive tapes in UAE.',
    canonical: 'https://www.alzaydaninternational.com/search',
    bodyHtml: `
    <h1>Industrial Products Catalogue — UAE B2B Supplier</h1>
    <p>Browse all industrial products from Al Zaydan International FZE. We supply traffic safety
    equipment, road safety products, reflective sheeting, packaging materials, adhesive tapes,
    industrial tools, and more to businesses across the UAE and GCC.</p>
    <h2>Browse by Category</h2>
    <ul>
${categories.map(c => `      <li><a href="/category/${encodeURIComponent(slug(c))}">${esc(c)} Products UAE</a> — ${products.filter(p => p.category === c).length} products available</li>`).join('\n')}
    </ul>
    <h2>All Products</h2>
    <ul>
${products.slice(0, 100).map(p => `      <li><a href="/product/${encodeURIComponent(p.slug || slug(p.name))}">${esc(p.name)}</a> (${esc(p.category)})</li>`).join('\n')}
    </ul>
    ${categoryNavHtml}`,
  },
  {
    route: 'solutions',
    title: 'B2B Industrial Procurement Solutions UAE | Al Zaydan International',
    description: 'Al Zaydan International provides complete B2B industrial procurement solutions in UAE — from sourcing verified suppliers to bulk delivery across the GCC.',
    canonical: 'https://www.alzaydaninternational.com/solutions',
    bodyHtml: `
    <h1>B2B Industrial Procurement Solutions — UAE</h1>
    <p>
      Al Zaydan International FZE provides end-to-end B2B industrial procurement solutions for
      businesses in the UAE and across the GCC. From sourcing verified global suppliers to
      managing bulk deliveries, we simplify industrial procurement.
    </p>
    <h2>Our Solutions</h2>
    <ul>
      <li>Traffic Safety Equipment Supply</li>
      <li>Road Safety Products Procurement</li>
      <li>Reflective Sheeting and Signage</li>
      <li>Packaging Materials Wholesale</li>
      <li>Industrial Adhesive Tape Supply</li>
      <li>Custom RFQ and Bulk Ordering</li>
    </ul>
    ${categoryNavHtml}`,
  },
  // ── SEO Landing Pages ────────────────────────────────────────────────────────
  {
    route: 'traffic-safety-equipment-uae',
    title: 'Traffic Safety Equipment UAE | Cones, Barriers, Signs — Al Zaydan International',
    description: 'Buy traffic safety equipment in UAE — cones, barriers, delineators, speed bumps, warning signs. B2B wholesale supply from Al Zaydan International. Request a quote today.',
    canonical: 'https://www.alzaydaninternational.com/traffic-safety-equipment-uae',
    bodyHtml: `
    <h1>Traffic Safety Equipment Supplier UAE</h1>
    <p>
      Al Zaydan International FZE is a leading B2B supplier of traffic safety equipment in the
      UAE. We supply traffic cones, road barriers, delineators, speed bumps, warning signs,
      reflective plates, and road safety accessories to businesses, contractors, municipalities,
      and construction companies across the UAE and GCC.
    </p>
    <h2>Traffic Safety Products We Supply</h2>
    <ul>
      <li>Traffic Cones (standard, heavy-duty, LED)</li>
      <li>Road Barriers and Water-filled Barriers</li>
      <li>Flexible Delineators and Channel Markers</li>
      <li>Speed Humps and Speed Cushions</li>
      <li>Road Signs and Warning Boards</li>
      <li>Reflective Tape (DOT-C2, ECE-104)</li>
      <li>Traffic Paddles and Safety Flags</li>
      <li>Crash Cushions and Attenuators</li>
    </ul>
    <p>
      All products meet international road safety standards. We offer competitive B2B wholesale
      pricing and fast delivery across the UAE — Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah
      — and GCC countries.
    </p>
    <h2>Products in This Category</h2>
    <ul>
${products.filter(p => p.category === 'Traffic Safety').map(p => `      <li><a href="/product/${encodeURIComponent(p.slug || slug(p.name))}">${esc(p.name)}</a></li>`).join('\n')}
    </ul>
    <p><a href="/rfq">Request a Quote for Traffic Safety Equipment</a></p>
    <p><a href="/contact">Contact Our Sales Team</a></p>
    ${categoryNavHtml}`,
  },
  {
    route: 'road-safety-products-uae',
    title: 'Road Safety Products UAE | Road Studs, Delineators, Barriers — Al Zaydan International',
    description: 'Road safety products supplier in UAE — road studs, cat eyes, delineators, barriers, speed humps. Wholesale B2B supply from Al Zaydan International FZE.',
    canonical: 'https://www.alzaydaninternational.com/road-safety-products-uae',
    bodyHtml: `
    <h1>Road Safety Products Supplier UAE</h1>
    <p>
      Al Zaydan International FZE supplies road safety products to contractors, municipalities,
      and infrastructure companies across the UAE and GCC. Our road safety product range includes
      road studs, raised pavement markers, delineators, guardrails, safety barriers, and more.
    </p>
    <h2>Road Safety Products We Supply</h2>
    <ul>
      <li>Road Studs and Raised Pavement Markers</li>
      <li>Cat Eyes and Retroreflective Markers</li>
      <li>Flexible Delineators and Post Markers</li>
      <li>Guardrails and Crash Barriers</li>
      <li>Safety Cones and Channelizing Devices</li>
      <li>Speed Humps, Bumps, and Cushions</li>
      <li>Road Marking Materials</li>
    </ul>
    <p><a href="/rfq">Request a Quote for Road Safety Products</a></p>
    ${categoryNavHtml}`,
  },
  {
    route: 'reflective-sheeting-uae',
    title: 'Reflective Sheeting UAE | Diamond Grade, DOT-C2, ECE-104, SOLAS — Al Zaydan',
    description: 'Buy reflective sheeting in UAE — Diamond Grade, High Intensity Prismatic, DOT-C2, ECE-104, SOLAS retroreflective tape. B2B wholesale from Al Zaydan International.',
    canonical: 'https://www.alzaydaninternational.com/reflective-sheeting-uae',
    bodyHtml: `
    <h1>Reflective Sheeting Supplier UAE</h1>
    <p>
      Al Zaydan International FZE is a UAE-based B2B supplier of high-quality reflective
      sheeting and retroreflective materials. We supply reflective sheeting for traffic signs,
      vehicle marking, safety vests, construction equipment, and road safety applications.
    </p>
    <h2>Reflective Sheeting Types</h2>
    <ul>
      <li>Diamond Grade Reflective Sheeting</li>
      <li>High Intensity Prismatic (HIP) Sheeting</li>
      <li>Engineer Grade Reflective Sheeting</li>
      <li>DOT-C2 Reflective Tape (truck conspicuity)</li>
      <li>ECE-104 Reflective Tape (vehicle rear marking)</li>
      <li>SOLAS Retroreflective Tape (marine safety)</li>
      <li>Type II Retroreflective Sheeting</li>
      <li>Electronic Cut Reflective Film</li>
    </ul>
    <h2>Products in This Category</h2>
    <ul>
${products.filter(p => p.category === 'Reflectors & Signage' || p.category === 'Traffic Safety').slice(0, 20).map(p => `      <li><a href="/product/${encodeURIComponent(p.slug || slug(p.name))}">${esc(p.name)}</a></li>`).join('\n')}
    </ul>
    <p><a href="/rfq">Request a Quote for Reflective Sheeting</a></p>
    ${categoryNavHtml}`,
  },
  {
    route: 'packaging-materials-supplier-uae',
    title: 'Packaging Materials Supplier UAE | BOPP Tape, Hot Melt Adhesive — Al Zaydan International',
    description: 'Industrial packaging materials supplier UAE — BOPP packaging tape, hot melt adhesive, double-sided tape, PE foam tape, acrylic foam tape. B2B wholesale from Al Zaydan.',
    canonical: 'https://www.alzaydaninternational.com/packaging-materials-supplier-uae',
    bodyHtml: `
    <h1>Packaging Materials Supplier UAE</h1>
    <p>
      Al Zaydan International FZE supplies industrial packaging materials to manufacturers,
      distributors, and businesses across the UAE and GCC. We stock a comprehensive range of
      packaging tapes, hot melt adhesives, foam tapes, and flexible packaging raw materials.
    </p>
    <h2>Packaging Materials We Supply</h2>
    <ul>
      <li>BOPP Packaging Tape (clear, brown, custom-printed)</li>
      <li>Hot Melt Adhesive for Cartons and Boxes</li>
      <li>Double-sided Tissue Tape</li>
      <li>PE Foam Tape (single and double-sided)</li>
      <li>Acrylic Foam Tape (VHB-type)</li>
      <li>Masking Tape (crepe paper, washi)</li>
      <li>Aluminium Foil Tape</li>
      <li>PTFE Tape and Coated Fabrics</li>
      <li>Security Void Tape</li>
      <li>Kraft Paper Tape</li>
    </ul>
    <h2>Products in This Category</h2>
    <ul>
${products.filter(p => p.category === 'Flexible packaging raw materials' || p.category === 'Industrial Adhesive Tapes').map(p => `      <li><a href="/product/${encodeURIComponent(p.slug || slug(p.name))}">${esc(p.name)}</a></li>`).join('\n')}
    </ul>
    <p><a href="/rfq">Request a Quote for Packaging Materials</a></p>
    ${categoryNavHtml}`,
  },
];

console.log(`\n🏗  Pre-rendering ${STATIC_PAGES.length} static pages…`);
let staticCount = 0;

for (const page of STATIC_PAGES) {
  const html = buildPage({
    title: page.title,
    description: page.description,
    canonical: page.canonical,
    ogTitle: page.title,
    ogDesc: page.description,
    bodyHtml: page.bodyHtml,
    schemaJson: null,
  });

  const outPath = path.join(DIST, page.route, 'index.html');
  writeFile(outPath, html);
  staticCount++;
  console.log(`  ✅  ${page.route}/index.html`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY PAGES & REDIRECTS (ASYNC)
// ═══════════════════════════════════════════════════════════════════════════════

function fetchFirestoreCategoriesDetails() {
  return new Promise((resolve) => {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'alzaydaninternational';
    const apiKey = process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/settings/categories${apiKey ? '?key='+apiKey : ''}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) return resolve({});
          const parsed = JSON.parse(data);
          const details = {};
          if (parsed.fields?.details?.mapValue?.fields) {
            const rawDetails = parsed.fields.details.mapValue.fields;
            for (const key of Object.keys(rawDetails)) {
               const catFields = rawDetails[key].mapValue?.fields || {};
               details[key] = {
                 seoTitle: catFields.seoTitle?.stringValue || '',
                 metaDescription: catFields.metaDescription?.stringValue || ''
               };
            }
          }
          resolve(details);
        } catch (err) {
          resolve({});
        }
      });
    }).on('error', () => resolve({}));
  });
}

function fetchFirestoreRedirects() {
  return new Promise((resolve) => {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'alzaydaninternational';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/redirects`;

    console.log(`📡 Fetching redirects from Firestore: ${url}`);

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.log(`⚠️ Firestore returned status ${res.statusCode}.`);
            resolve([]);
            return;
          }
          const parsed = JSON.parse(data);
          if (parsed && parsed.documents) {
            const redirects = parsed.documents.map(doc => {
              const fields = doc.fields || {};
              const oldUrl = fields.oldUrl?.stringValue || '';
              const newUrl = fields.newUrl?.stringValue || '';
              const type = fields.type?.stringValue || '301';
              const active = fields.active?.booleanValue !== false;
              return { oldUrl, newUrl, type, active };
            });
            resolve(redirects.filter(r => r.active && r.oldUrl && r.newUrl));
          } else {
            console.log('⚠️ No custom redirects found in Firestore response.');
            resolve([]);
          }
        } catch (err) {
          console.error('❌ Failed to parse Firestore redirects JSON:', err);
          resolve([]);
        }
      });
    }).on('error', (err) => {
      console.error('❌ Failed to fetch Firestore redirects:', err.message);
      resolve([]);
    });
  });
}

async function generateCategoriesAndRedirects() {
  console.log(`\n🏗  Fetching latest Category SEO details from Firestore...`);
  const activeDetails = await fetchFirestoreCategoriesDetails();

  console.log(`\n🏗  Pre-rendering ${categories.length} category pages…`);
  let categoryCount = 0;

  for (const c of categories) {
    const cSlug = slug(c);
    const seo = activeDetails[c] || {};
    
    // Inject Custom SEO from Admin CMS if present
    const catTitle = seo.seoTitle || `${esc(c)} Products UAE | Al Zaydan International`;
    const catDesc = seo.metaDescription || `Browse all ${esc(c)} products from Al Zaydan International FZE. Sourced from top manufacturers, wholesale pricing, fast shipping across UAE and GCC.`;
    const canonicalUrl = `https://www.alzaydaninternational.com/category/${encodeURIComponent(cSlug)}`;

    const catProducts = products.filter(p => p.category === c);
    const prodListHtml = catProducts.length > 0
      ? `<ul>
          ${catProducts.map(p => `<li><a href="/product/${encodeURIComponent(p.slug || slug(p.name))}">${esc(p.name)}</a></li>`).join('\n        ')}
        </ul>`
      : '<p>No products available in this category.</p>';

    const bodyHtml = `
      <h1>${esc(c)} Products UAE</h1>
      <p>We supply high-quality ${esc(c)} products to businesses across the UAE and GCC. Sourced from verified global manufacturers with competitive wholesale pricing.</p>
      <h2>Available Products</h2>
      ${prodListHtml}
      ${categoryNavHtml}
      <p><a href="/rfq">Request a Quote for ${esc(c)} Products</a></p>
      <p><a href="/contact">Contact Our Sourcing Team</a></p>`;

    const orgSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Al Zaydan International FZE',
      url: 'https://www.alzaydaninternational.com',
      logo: 'https://www.alzaydaninternational.com/images/logo.png',
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.alzaydaninternational.com/' },
        { '@type': 'ListItem', position: 2, name: c, item: canonicalUrl }
      ]
    };

    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: c,
      url: canonicalUrl,
      numberOfItems: catProducts.length,
      itemListElement: catProducts.map((p, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `https://www.alzaydaninternational.com/product/${encodeURIComponent(p.slug || slug(p.name))}`,
      })),
    };

    const html = buildPage({
      title: catTitle,
      description: catDesc,
      canonical: canonicalUrl,
      ogTitle: catTitle,
      ogDesc: catDesc,
      bodyHtml,
      schemaJson: [orgSchema, breadcrumbSchema, itemListSchema],
    });

    const outPath = path.join(DIST, 'category', cSlug, 'index.html');
    writeFile(outPath, html);
    categoryCount++;
    console.log(`  ✅  category/${cSlug}/index.html`);
  }

  // ── REDIRECTS ──
  console.log(`\n🏗  Generating Netlify _redirects file…`);
  const redirectLines = [
    '# Auto-generated redirects for URL SEO overhaul',
  ];

  try {
    const customRedirects = await fetchFirestoreRedirects();
    if (customRedirects.length > 0) {
      redirectLines.push('# Custom redirects defined in Admin CMS');
      customRedirects.forEach(r => {
        let fromUrl = r.oldUrl.trim();
        let toUrl = r.newUrl.trim();
        if (!fromUrl.startsWith('/') && !fromUrl.startsWith('http')) fromUrl = '/' + fromUrl;
        if (!toUrl.startsWith('/') && !toUrl.startsWith('http')) toUrl = '/' + toUrl;
        redirectLines.push(`${fromUrl}  ${toUrl}  ${r.type || '301'}`);
      });
      redirectLines.push('');
    }
  } catch (err) {
    console.error('⚠️ Error fetching firestore redirects:', err);
  }

  redirectLines.push('# Redirect legacy product ID URLs to SEO-friendly product slug URLs');
  for (const p of products) {
    if (!p.id) continue;
    const pSlug = p.slug || slug(p.name);
    redirectLines.push(`/product/${p.id}  /product/${pSlug}  301`);
  }

  redirectLines.push('', '# Redirect legacy search category query parameter URLs to category slug URLs');
  for (const c of categories) {
    const cSlug = slug(c);
    const encodedPlus = encodeURIComponent(c).replace(/%20/g, '+');
    const spaceForm = c.replace(/ /g, '+');

    redirectLines.push(`/search category=${encodeURIComponent(c)}  /category/${cSlug}  301`);
    if (encodedPlus !== encodeURIComponent(c)) {
      redirectLines.push(`/search category=${encodedPlus}  /category/${cSlug}  301`);
    }
    redirectLines.push(`/search category=${spaceForm}  /category/${cSlug}  301`);
  }

  // Add explicit redirect rules for pre-rendered category directories so Netlify prioritizes them
  redirectLines.push('', '# Redirect SEO friendly category slug URLs to static pre-rendered HTML');
  for (const c of categories) {
    const cSlug = slug(c);
    redirectLines.push(`/category/${cSlug}  /category/${cSlug}/index.html  200`);
  }

  redirectLines.push('', '# SPA catch-all fallback for React Router', '/*  /index.html  200');

  fs.writeFileSync(path.join(DIST, '_redirects'), redirectLines.join('\n'), 'utf-8');
  console.log(`  ✅  Written dist/_redirects`);

  const totalPages = productCount + staticCount + categoryCount;
  console.log(`\n🎉  Pre-render complete!`);
  console.log(`    📄  Product pages  : ${productCount}`);
  console.log(`    📝  Static pages   : ${staticCount}`);
  console.log(`    📁  Category pages : ${categoryCount}`);
  console.log(`    🔗  Total pages    : ${totalPages}`);
  console.log(`\n    Google and Screaming Frog can now discover all ${totalPages} pages from HTML source.\n`);
}

generateCategoriesAndRedirects();
