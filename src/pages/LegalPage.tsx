import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Shield, Cookie, ChevronRight } from 'lucide-react';
import { useSEO } from '../lib/useSEO';

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'terms',   icon: FileText, label: 'Terms of Sale',      color: 'text-blue-600 bg-blue-50'       },
  { id: 'privacy', icon: Shield,   label: 'Privacy Policy',     color: 'text-emerald-600 bg-emerald-50' },
  { id: 'cookies', icon: Cookie,   label: 'Cookie Preferences', color: 'text-amber-600 bg-amber-50'     },
];

const LAST_UPDATED = '29 April 2025';
const COMPANY = 'Al Zaydan International FZE';
const EMAIL   = 'info@alzaydan.com';

// ─── Prose helpers ────────────────────────────────────────────────────────────

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-extrabold text-slate-900 mt-8 mb-3">{children}</h2>
);
const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[15px] font-bold text-slate-800 mt-5 mb-2">{children}</h3>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-slate-600 text-sm leading-relaxed mb-3">{children}</p>
);
const BulletList = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5 mb-4 ml-2">
    {items.map(item => (
      <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

// ─── Section header component ─────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, color }: { icon: React.ElementType; title: string; color: string }) => (
  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
      <p className="text-slate-400 text-xs">Last updated: {LAST_UPDATED}</p>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LegalPage() {
  const location  = useLocation();
  const termsRef  = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLDivElement>(null);
  const cookiesRef = useRef<HTMLDivElement>(null);

  useSEO({
    title: 'Legal & Privacy Policy | Al Zaydan International UAE',
    description: 'Terms of Sale, Privacy Policy & Cookie Preferences for Al Zaydan International FZE — UAE B2B industrial materials supplier. Review our full legal terms.',
  });

  const refs: Record<string, React.RefObject<HTMLDivElement>> = {
    terms: termsRef, privacy: privacyRef, cookies: cookiesRef,
  };

  const [active, setActive] = useState('terms');

  const scrollTo = (id: string) => {
    refs[id]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  };

  // Scroll to hash on load
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && refs[hash]?.current) {
      setTimeout(() => {
        refs[hash].current!.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActive(hash);
      }, 120);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  // Active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    );
    [termsRef, privacyRef, cookiesRef].forEach(r => { if (r.current) observer.observe(r.current); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white">

      {/* ── Hero / Header ─────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-14 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
            <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-300">Legal</span>
          </div>
          <div className="text-amber-400 text-[11px] font-bold uppercase tracking-widest mb-3">Legal Information</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Legal &amp; Privacy Centre
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mb-8">
            All legal documents for {COMPANY} in one place. Last updated: {LAST_UPDATED}.
          </p>
          {/* Tab pills */}
          <div className="flex flex-wrap gap-3">
            {SECTIONS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                  active === id
                    ? 'bg-amber-400 text-slate-900 border-amber-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 flex gap-10">

        {/* Sticky sidebar TOC */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-28 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">On This Page</p>
            {SECTIONS.map(({ id, icon: Icon, label, color }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all text-left ${
                  active === id
                    ? 'bg-amber-50 text-amber-700 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-16 max-w-3xl">

          {/* ══════════════════════════════════════════════════════
              TERMS OF SALE
          ══════════════════════════════════════════════════════ */}
          <div id="terms" ref={termsRef} className="scroll-mt-28">
            <SectionHeader icon={FileText} title="Terms of Sale" color="bg-blue-50 text-blue-600" />

            <P>These Terms of Sale govern all purchases made through the {COMPANY} website and platform. By placing an order, you agree to these terms in full. Please read them carefully before completing any transaction.</P>

            <H2>1. Order Acceptance</H2>
            <P>All orders placed on our platform are subject to acceptance by {COMPANY}. We reserve the right to refuse or cancel any order at our discretion, including cases of pricing errors, product unavailability, or suspected fraudulent activity. An order confirmation email does not constitute final acceptance — acceptance occurs upon dispatch of goods.</P>

            <H2>2. Pricing &amp; Payment</H2>
            <P>All prices are displayed in UAE Dirhams (AED) and are exclusive of VAT unless otherwise stated. VAT will be applied at the prevailing rate at the time of purchase. We accept payment via bank transfer, credit card, and approved B2B trade credit accounts.</P>
            <BulletList items={[
              'Prices are subject to change without prior notice.',
              'Payment must be received in full before dispatch, unless Net-30 terms have been approved.',
              'For B2B trade accounts, payment terms are as agreed in the account application.',
              'Invoices are issued electronically to the registered email address.',
            ]} />

            <H2>3. Delivery &amp; Shipping</H2>
            <P>Delivery timelines are estimates and not guaranteed. {COMPANY} is not liable for delays caused by logistics providers, customs clearance, or circumstances beyond our control. Risk of loss passes to the buyer upon handover to the carrier.</P>
            <BulletList items={[
              'Free shipping on qualifying orders as stated at checkout.',
              'International orders may be subject to import duties and taxes payable by the buyer.',
              'Delivery timelines are provided in good faith and are not contractually binding.',
              'Large or bulk orders may require custom delivery arrangements.',
            ]} />

            <H2>4. Returns &amp; Cancellations</H2>
            <P>Due to the B2B nature of our business, returns are accepted only where goods are demonstrably defective or incorrectly supplied. All return requests must be submitted within 7 calendar days of receipt with supporting documentation.</P>
            <P>Order cancellations must be requested before dispatch. Once goods have been dispatched, cancellation is not possible. Custom-sourced or special-order items are non-cancellable and non-returnable.</P>

            <H2>5. Product Information</H2>
            <P>We endeavour to display accurate product information, specifications, and imagery. However, actual product specifications may vary from those shown. {COMPANY} is not liable for decisions made based solely on product descriptions displayed on this platform.</P>

            <H2>6. Limitation of Liability</H2>
            <P>To the maximum extent permitted by law, {COMPANY}'s liability in respect of any order shall not exceed the value of that order. We are not liable for indirect, consequential, or incidental losses arising from the use or inability to use purchased products.</P>

            <H2>7. Governing Law</H2>
            <P>These terms are governed by the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of the UAE.</P>

            <H2>8. Contact</H2>
            <P>For questions regarding these Terms of Sale, contact us at <a href={`mailto:${EMAIL}`} className="text-amber-600 hover:underline font-medium">{EMAIL}</a>.</P>
          </div>

          {/* ══════════════════════════════════════════════════════
              PRIVACY POLICY
          ══════════════════════════════════════════════════════ */}
          <div id="privacy" ref={privacyRef} className="scroll-mt-28">
            <SectionHeader icon={Shield} title="Privacy Policy" color="bg-emerald-50 text-emerald-600" />

            <P>{COMPANY} is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains what data we collect, how we use it, and your rights in relation to your information. By using our website or services, you agree to the practices described in this policy.</P>

            <H2>1. Who We Are</H2>
            <P>{COMPANY} is a UAE Free Zone entity engaged in B2B trading, sourcing, and distribution. We are the data controller for personal information collected through this platform. You can reach our data team at <a href={`mailto:${EMAIL}`} className="text-amber-600 hover:underline font-medium">{EMAIL}</a>.</P>

            <H2>2. Data We Collect</H2>
            <H3>Information you provide directly:</H3>
            <BulletList items={[
              'Name, company name, email address, and phone number (when registering or contacting us)',
              'Billing and delivery address details',
              'Order history and transaction records',
              'Messages and inquiries submitted via our contact form',
            ]} />
            <H3>Information collected automatically:</H3>
            <BulletList items={[
              'IP address, browser type, and device information',
              'Pages visited, time on site, and navigation patterns',
              'Referral source and search terms used to find our site',
              'Cookie data (see Cookie Preferences section below)',
            ]} />

            <H2>3. How We Use Your Data</H2>
            <P>We use your personal information for the following legitimate purposes:</P>
            <BulletList items={[
              'Processing and fulfilling your orders',
              'Communicating about orders, deliveries, and account matters',
              'Responding to inquiries and sourcing requests',
              'Improving our platform, products, and services',
              'Complying with legal and regulatory obligations in the UAE',
              'Sending commercial communications where you have consented',
            ]} />

            <H2>4. Data Sharing</H2>
            <P>We do not sell, rent, or trade your personal information to third parties. We may share data with trusted service providers who assist us in operating our business — such as payment processors, logistics partners, and IT service providers — under strict confidentiality obligations.</P>
            <P>We may disclose information where required by UAE law, a regulatory authority, or a valid court order.</P>

            <H2>5. Data Retention</H2>
            <P>We retain your personal data for as long as necessary to fulfil the purposes for which it was collected, including legal, accounting, and reporting obligations. Order records are retained for a minimum of 5 years in accordance with UAE commercial law.</P>

            <H2>6. Your Rights</H2>
            <P>Depending on applicable law, you may have the right to:</P>
            <BulletList items={[
              'Access the personal data we hold about you',
              'Request correction of inaccurate data',
              'Request deletion of your data where no legal retention obligation applies',
              'Object to or restrict certain processing activities',
              'Withdraw consent where processing is based on consent',
            ]} />
            <P>To exercise any of these rights, contact us at <a href={`mailto:${EMAIL}`} className="text-amber-600 hover:underline font-medium">{EMAIL}</a>. We will respond within 30 days.</P>

            <H2>7. Security</H2>
            <P>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. Sensitive data is encrypted in transit using SSL/TLS technology.</P>

            <H2>8. Third-Party Links</H2>
            <P>Our website may contain links to external websites. We are not responsible for the privacy practices of those sites and encourage you to review their respective policies.</P>

            <H2>9. Changes to This Policy</H2>
            <P>We may update this Privacy Policy from time to time. Any material changes will be notified via the website or by email. Continued use of our platform after changes constitutes acceptance of the updated policy.</P>
          </div>

          {/* ══════════════════════════════════════════════════════
              COOKIE PREFERENCES
          ══════════════════════════════════════════════════════ */}
          <div id="cookies" ref={cookiesRef} className="scroll-mt-28">
            <SectionHeader icon={Cookie} title="Cookie Preferences" color="bg-amber-50 text-amber-600" />

            <P>This page explains how {COMPANY} uses cookies and similar tracking technologies on our website, and how you can manage your preferences. We respect your right to control how your data is used.</P>

            <H2>1. What Are Cookies?</H2>
            <P>Cookies are small text files stored on your device when you visit a website. They help websites function correctly, remember your preferences, and provide insights into how users interact with the site. Cookies do not contain personally identifiable information by themselves.</P>

            <H2>2. Types of Cookies We Use</H2>

            <H3>🔒 Strictly Necessary Cookies</H3>
            <P>These cookies are essential for the website to function. They enable core features such as page navigation, secure checkout, and session management. You cannot opt out of these cookies as the site cannot function without them.</P>
            <BulletList items={[
              'Session authentication and security tokens',
              'Shopping cart and order session data',
              'Load balancing and server performance',
            ]} />

            <H3>📊 Analytics &amp; Performance Cookies</H3>
            <P>These cookies help us understand how visitors use our website — which pages are viewed most, where visitors come from, and how they interact with content. This data is used in aggregated, anonymised form.</P>
            <BulletList items={[
              'Google Analytics (page views, session duration, referral source)',
              'Performance monitoring and error tracking',
              'A/B testing to improve user experience',
            ]} />

            <H3>🎯 Functionality Cookies</H3>
            <P>These cookies remember your preferences and personalise your experience — such as language settings, region selection, and previously viewed products.</P>
            <BulletList items={[
              'Language and region preferences',
              'Recently viewed products',
              'Filter and search preferences',
            ]} />

            <H3>📣 Marketing &amp; Targeting Cookies</H3>
            <P>These cookies may be set by our advertising partners to build a profile of your interests and show relevant advertising on other sites. We do not sell this data.</P>
            <BulletList items={[
              'Retargeting and interest-based advertising',
              'Social media integration (if applicable)',
              'Conversion tracking for advertising campaigns',
            ]} />

            <H2>3. Managing Your Preferences</H2>
            <P>You can manage or withdraw cookie consent at any time using the following methods:</P>
            <BulletList items={[
              'Use your browser settings to block or delete cookies',
              'Use an opt-out tool provided by analytics providers (e.g., Google Analytics Opt-out)',
              `Contact us at ${EMAIL} to request data deletion`,
            ]} />

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-4">
              <p className="text-[13px] font-bold text-amber-900 mb-2">⚠️ Please Note</p>
              <p className="text-[13px] text-amber-800 leading-relaxed">
                Disabling non-essential cookies will not affect your ability to browse the website or place orders, but may reduce the personalisation and functionality of certain features.
              </p>
            </div>

            <H2>4. Third-Party Cookies</H2>
            <P>Some cookies on our site are placed by third-party services such as Google Analytics, Firebase, and payment processors. These are governed by the respective third-party privacy and cookie policies.</P>

            <H2>5. Cookie Duration</H2>
            <BulletList items={[
              'Session cookies: Deleted when you close your browser',
              'Persistent cookies: Retained for a defined period (typically 30 days to 2 years)',
              'Third-party cookies: Duration varies by provider',
            ]} />

            <H2>6. Contact</H2>
            <P>If you have questions about our use of cookies, please contact us at <a href={`mailto:${EMAIL}`} className="text-amber-600 hover:underline font-medium">{EMAIL}</a>.</P>
          </div>

          {/* ── Bottom jump links ──────────────────────────────────────────────── */}
          <div className="border-t border-slate-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">© {new Date().getFullYear()} {COMPANY}. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4">
              {SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-xs text-slate-400 hover:text-amber-600 font-medium transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
