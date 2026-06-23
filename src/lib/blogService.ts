import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Blog Post Type ─────────────────────────────────────────────────────────────
export interface BlogPost {
  id: string;
  title: string;
  slug: string;           // SEO URL: /blog/osha-fall-protection-2024
  excerpt: string;        // Short description for listing cards
  htmlContent: string;    // Full HTML content (pasted from AI tool)
  coverImage: string;     // URL
  category: string;       // Compliance, Buying Guide, Maintenance, etc.
  tags: string[];         // SEO tags
  metaTitle: string;      // <title> tag override
  metaDescription: string; // <meta name="description">
  author: string;
  published: boolean;
  readTime: number;       // estimated minutes
  publishedAt: string;    // ISO date
  createdAt: string;
  updatedAt: string;
  relatedProductIds?: string[]; // IDs of products to cross-sell
  youtubeVideoUrl?: string;     // URL for embedded YouTube ad
  // New customizable ad fields
  topBarText?: string;
  topBarBgColor?: string;
  topBarTextColor?: string;
  topBarLink?: string;
  adImageUrl?: string;
  adImageLink?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  schemaSelection?: string;
}

const COL = 'blogs';

// ── Helpers ────────────────────────────────────────────────────────────────────
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

export function estimateReadTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// ── CRUD ───────────────────────────────────────────────────────────────────────
export async function getAllBlogs(): Promise<BlogPost[]> {
  const snap = await getDocs(
    query(collection(db, COL), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as BlogPost));
}

// ── In-memory Cache for Published Blogs ──
let cachedPublishedBlogs: BlogPost[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export function clearBlogCache() {
  cachedPublishedBlogs = null;
  lastFetchTime = 0;
}

export async function getPublishedBlogs(limitParam?: number): Promise<BlogPost[]> {
  try {
    const now = Date.now();
    if (cachedPublishedBlogs && (now - lastFetchTime) < CACHE_DURATION_MS) {
      return limitParam ? cachedPublishedBlogs.slice(0, limitParam) : cachedPublishedBlogs;
    }

    const snap = await getDocs(
      query(collection(db, COL), where('published', '==', true))
    );
    let all = snap.docs.map(d => ({ ...d.data(), id: d.id } as BlogPost));
    
    // Sort in memory to avoid needing a composite index
    all.sort((a, b) => {
      const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return timeB - timeA;
    });

    cachedPublishedBlogs = all;
    lastFetchTime = Date.now();

    return limitParam ? all.slice(0, limitParam) : all;
  } catch (err) {
    console.error('Error fetching published blogs:', err);
    return cachedPublishedBlogs ? (limitParam ? cachedPublishedBlogs.slice(0, limitParam) : cachedPublishedBlogs) : [];
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const snap = await getDocs(
    query(collection(db, COL), where('slug', '==', slug))
  );
  if (snap.empty) return null;
  return { ...snap.docs[0].data(), id: snap.docs[0].id } as BlogPost;
}

export async function createBlog(
  data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, COL), { ...data, createdAt: now, updatedAt: now });
  return ref.id;
}

export async function updateBlog(id: string, data: Partial<Omit<BlogPost, 'id'>>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: new Date().toISOString() });
  clearBlogCache();
}

export async function deleteBlog(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
  clearBlogCache();
}

export async function togglePublish(blog: BlogPost): Promise<void> {
  const now = new Date().toISOString();
  await updateDoc(doc(db, COL, blog.id), {
    published: !blog.published,
    publishedAt: !blog.published ? now : blog.publishedAt,
    updatedAt: now,
  });
  clearBlogCache();
}
