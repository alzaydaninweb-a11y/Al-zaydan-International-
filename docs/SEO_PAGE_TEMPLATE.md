# SEO Page Structure Guidelines

This document outlines the strict semantic HTML structure and SEO requirements for ALL new service and product landing pages created for Al Zaydan International.

## 1. Core Semantic Hierarchy

Google relies on proper heading hierarchy (`<h1>` through `<h6>`) and semantic HTML5 tags (`<main>`, `<nav>`, `<section>`) to understand and index page content.

```html
<!-- ✅ CORRECT STRUCTURE -->
<main>

  <!-- ONE H1 per page — exact target keyword -->
  <h1>Traffic Safety Equipment Supplier UAE</h1>

  <!-- Intro paragraph — include keyword in first 100 words -->
  <p>Al Zaydan International FZE is a leading traffic safety equipment
  supplier in UAE, serving B2B clients across the GCC from our
  Ajman Free Zone facility...</p>

  <!-- H2 = main sections of the page -->
  <h2>Our Traffic Safety Equipment Range</h2>
  <p>...content...</p>

  <h2>Why Choose Al Zaydan for Road Safety Products in UAE?</h2>
  <p>...content...</p>

  <h2>Bulk Orders & B2B Supply Across GCC</h2>
  <p>...content...</p>

  <!-- H3 = subsections under H2 -->
  <h3>Traffic Cones & Road Delineators</h3>
  <h3>Reflective Sheeting for Road Signs UAE</h3>
  <h3>Temporary Barriers & Safety Fencing</h3>

  <!-- Internal links to other service pages (Critical for SEO PageRank flow) -->
  <section>
    <h2>Related Products</h2>
    <a href="/road-safety-products-uae/">Road Safety Products UAE</a>
    <a href="/reflective-sheeting-uae/">Reflective Sheeting UAE</a>
    <a href="/packaging-materials-supplier-uae/">Packaging Materials UAE</a>
  </section>

  <!-- Breadcrumb for internal linking + rich snippet schema support -->
  <nav aria-label="breadcrumb">
    <a href="/">Home</a> >
    <a href="/products/">Products</a> >
    <span>Traffic Safety Equipment UAE</span>
  </nav>

</main>
```

## 2. Image Alt Text Rules

Every `<img>` element on service pages must feature a highly descriptive `alt` attribute that naturally includes the target keyword.

- ❌ **WRONG:** `alt="image1.jpg"`
- ❌ **WRONG:** `alt=""`
- ✅ **RIGHT:** `alt="Traffic safety cones supplier UAE - Al Zaydan International"`
- ✅ **RIGHT:** `alt="Reflective sheeting roll for road signs UAE"`

## 3. URL Slug Guidelines

Page URL slugs must strictly follow these rules to ensure maximum crawlability and keyword relevance:

1. **Lowercase:** Only use lowercase letters.
2. **Hyphen-Separated:** Use hyphens (`-`) instead of spaces or underscores (`_`).
3. **Keyword-Rich:** Must include the exact target keyword and location (e.g., `uae`).
4. **Concise:** Keep it short (maximum 5 words).
5. **No Special Characters:** Avoid query parameters (`?id=47`) or symbols.

- ✅ **CORRECT:** `/traffic-safety-equipment-uae/`
- ✅ **CORRECT:** `/road-safety-products-uae/`
- ❌ **INCORRECT:** `/Traffic_Safety_Equipment_In_UAE_Page1/`
- ❌ **INCORRECT:** `/page?id=47`

By adhering to these rules, every new page built will be perfectly structured for Google to identify, crawl, and rank for its designated target keyword.
