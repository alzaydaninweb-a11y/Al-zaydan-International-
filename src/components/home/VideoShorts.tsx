import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight, Volume2, VolumeX, Play, ShoppingCart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';

// ─── Extract YouTube video ID ─────────────────────────────────────────────────

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ─── Single video card ────────────────────────────────────────────────────────

function VideoCard({ title, youtubeUrl, productId }: {
  title: string;
  youtubeUrl: string;
  description?: string;
  productId?: string;
}) {
  const { products } = useStore();
  const { addToCart } = useCart();
  const videoId = getYouTubeId(youtubeUrl);
  const [muted, setMuted]     = useState(true);
  const [started, setStarted] = useState(false);
  const [added, setAdded]     = useState(false);
  const cardRef               = useRef<HTMLDivElement>(null);
  const iframeRef             = useRef<HTMLIFrameElement>(null);
  const addedTimer            = useRef<ReturnType<typeof setTimeout>>();

  const linkedProduct = productId ? products.find(p => p.id === productId) : undefined;

  // ── Auto-play when card scrolls into view ──────────────────────────────────
  useEffect(() => {
    const el = cardRef.current;
    if (!el || !videoId) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          setStarted(true);
        } else if (!entry.isIntersecting) {
          setStarted(false);
          setMuted(true);
        }
      },
      { threshold: [0, 0.4] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [videoId]);

  // Cleanup timer on unmount
  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(m => !m);
  }, []);

  const handlePlay = () => setStarted(true);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!linkedProduct || added) return;
    addToCart(linkedProduct, 1);
    setAdded(true);
    addedTimer.current = setTimeout(() => setAdded(false), 2000);
  };

  if (!videoId) return null;

  const embedUrl =
    `https://www.youtube.com/embed/${videoId}?` +
    `mute=${muted ? 1 : 0}` +
    `&autoplay=1` +
    `&loop=1&playlist=${videoId}` +
    `&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

  const thumb = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  return (
    /* ── Reel-sized card — product card is INSIDE at the bottom ── */
    <div
      ref={cardRef}
      className="shrink-0 snap-start"
      style={{ width: '240px', height: '427px', minWidth: '240px' }}
    >
      {/* ── Single reel block (full height) ─────────────────────────── */}
      <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden relative group">

        {!started ? (
          /* Thumbnail state */
          <>
            <img src={thumb} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-90" />
            {/* Gradient scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlay}
                aria-label="Play video"
                className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform"
              >
                <Play className="w-6 h-6 text-white fill-white ml-1" />
              </button>
            </div>

            {/* Scroll-to-play hint */}
            <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-[10px] font-bold">Scroll to play</span>
            </div>

            {/* Muted icon indicator */}
            <div className="absolute top-3 right-3 w-9 h-9 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
              <VolumeX className="w-4 h-4 text-white/60" />
            </div>
          </>
        ) : (
          /* Playing state */
          <>
            <iframe
              ref={iframeRef}
              key={`${videoId}-${muted}`}
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title={title}
            />

            {/* Mute / Unmute button */}
            <button
              onClick={toggleMute}
              className="absolute top-3 right-3 w-9 h-9 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/80 transition-colors z-20"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted
                ? <VolumeX className="w-4 h-4 text-white" />
                : <Volume2 className="w-4 h-4 text-white" />
              }
            </button>
          </>
        )}

        {/* ── Product card — INSIDE the reel, pinned to bottom ──────── */}
        {linkedProduct && (
          <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
            {/* Frosted glass card */}
            <div
              className="flex items-center gap-2.5 rounded-2xl p-2.5"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
              }}
            >
              {/* Product image */}
              <div
                className="w-10 h-10 rounded-lg shrink-0 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.9)' }}
              >
                <img
                  src={linkedProduct.image}
                  alt={linkedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name + price */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-white line-clamp-2 leading-snug drop-shadow">
                  {linkedProduct.name}
                </p>
                <p className="text-[11px] font-extrabold text-amber-300 mt-0.5 drop-shadow">
                  AED {linkedProduct.price}
                </p>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all duration-200 ${
                  added
                    ? 'bg-green-400 text-white scale-95 shadow-lg'
                    : 'bg-white text-slate-900 hover:bg-amber-400 hover:text-white shadow-md'
                }`}
              >
                {added ? (
                  <>✓ Added</>
                ) : (
                  <><ShoppingCart className="w-3 h-3" /> Add</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Auto-scroll hook ─────────────────────────────────────────────────────────

function useAutoScroll(ref: React.RefObject<HTMLDivElement>, active: boolean, speed = 0.6) {
  const rafId = useRef<number>(0);
  const paused = useRef(false);

  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;

    const step = () => {
      if (!paused.current && el) {
        el.scrollLeft += speed;
        // Loop: when we've scrolled to the end, jump back to start
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
          el.scrollLeft = 0;
        }
      }
      rafId.current = requestAnimationFrame(step);
    };

    rafId.current = requestAnimationFrame(step);

    // Pause on hover / touch
    const pause  = () => { paused.current = true; };
    const resume = () => { paused.current = false; };
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume);

    return () => {
      cancelAnimationFrame(rafId.current);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
    };
  }, [active, speed, ref]);
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function VideoShorts() {
  const { videos, videoSectionVisible } = useStore();
  const scrollRef  = useRef<HTMLDivElement>(null);

  // Only show active videos
  const activeVideos = videos.filter(v => v.active !== false);

  // Only duplicate for seamless loop scroll when there are enough cards (4+)
  const displayVideos = activeVideos.length >= 4
    ? [...activeVideos, ...activeVideos]
    : activeVideos;

  // Auto-scroll only when duplicated (enough cards)
  useAutoScroll(scrollRef, activeVideos.length >= 4, 0.5);

  // Section hidden by admin toggle
  if (!videoSectionVisible) return null;
  if (activeVideos.length === 0) return null;

  return (
    <section className="py-14 bg-slate-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="text-amber-500 text-[11px] font-bold uppercase tracking-widest mb-1">Watch &amp; Learn</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">See It In Action</h2>
            <p className="text-slate-500 text-sm mt-1.5 max-w-xl">
              Watch real-world demonstrations of our top products. Tap to play, click the speaker to unmute.
            </p>
          </div>
          <a
            href="https://www.youtube.com/@alzaydan"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex text-blue-600 hover:text-blue-700 text-[13px] font-bold items-center gap-1"
          >
            View All Shorts <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Scrolling track */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Only duplicate when 4+ videos for seamless loop scroll */}
          {displayVideos.map((v, idx) => (
            <div key={`${v.id}-${idx}`} className="contents">
              <VideoCard
                title={v.title}
                youtubeUrl={v.youtubeUrl}
                description={v.description}
                productId={v.productId}
              />
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
