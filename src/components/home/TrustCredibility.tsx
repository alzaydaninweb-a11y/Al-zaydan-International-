import React, { useRef, useEffect, useCallback } from 'react';
import { ShieldCheck, CheckCircle, Lock, Package, Globe } from 'lucide-react';
import WhatsAppIcon from '../icons/WhatsAppIcon';

const SLIDE_EVERY       = 2000;
const PAUSE_AFTER_TOUCH = 4000;
const CARD_WIDTH        = 130; // px
const CARD_GAP          = 12;  // gap-3

const items = [
  { icon: ShieldCheck, title: 'OSHA Compliant',   desc: 'Certified safety gear'    },
  { icon: CheckCircle, title: 'ISO 9001',         desc: 'Quality management'       },
  { icon: Package,     title: 'Bulk Pricing',     desc: 'B2B wholesale rates'      },
  { icon: WhatsAppIcon, title: 'WhatsApp Ordering',  desc: 'Direct ordering & chat'   },
  { icon: Globe,       title: 'Global Shipping',  desc: 'Fast industrial delivery' },
];

export default function TrustCredibility() {
  const scrollRef   = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseRef    = useRef(false);
  const indexRef    = useRef(0);

  const slide = useCallback(() => {
    const el = scrollRef.current;
    if (!el || pauseRef.current) return;
    const next = (indexRef.current + 1) % items.length;
    if (next === 0) {
      el.scrollTo({ left: 0, behavior: 'instant' });
    } else {
      el.scrollTo({ left: next * (CARD_WIDTH + CARD_GAP), behavior: 'smooth' });
    }
    indexRef.current = next;
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(slide, SLIDE_EVERY);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [slide]);

  const handleUserInteraction = useCallback(() => {
    pauseRef.current = true;
    setTimeout(() => { pauseRef.current = false; }, PAUSE_AFTER_TOUCH);
    const el = scrollRef.current;
    if (el) indexRef.current = Math.round(el.scrollLeft / (CARD_WIDTH + CARD_GAP));
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── MOBILE: auto-sliding horizontal carousel ───────────────────── */}
        <div className="lg:hidden">
          <div
            ref={scrollRef}
            onTouchStart={handleUserInteraction}
            onMouseDown={handleUserInteraction}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="snap-start shrink-0 flex flex-col items-center justify-center gap-2 bg-blue-50 rounded-2xl p-4 text-center"
                  style={{ width: `${CARD_WIDTH}px` }}
                >
                  <div className="bg-white text-blue-600 w-11 h-11 rounded-xl flex items-center justify-center shadow-sm">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <span className="text-[12px] font-bold text-slate-900 leading-tight">{item.title}</span>
                  <span className="text-[10px] text-slate-500 leading-tight">{item.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── DESKTOP: 5-column row ──────────────────────────────────────── */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="text-blue-600 bg-blue-50 p-3 rounded-full shrink-0">
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{item.title}</span>
                  <span className="text-xs text-slate-500">{item.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
