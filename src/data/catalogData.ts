// ─── B2B Marketplace Catalog Data ─────────────────────────────────────────────

export const MEGA_CATEGORIES = [
  {
    id: 'traffic-safety',
    label: 'Traffic Safety',
    icon: '🚦',
    sub: ['Traffic Cones', 'Road Barriers', 'Traffic Lights', 'Speed Humps', 'Water Filled Barriers', 'Delineators'],
  },
  {
    id: 'safety-gear',
    label: 'Safety Gear',
    icon: '🦺',
    sub: ['Hard Hats', 'Safety Vests', 'Safety Boots', 'Gloves', 'Eye Protection', 'Ear Protection'],
  },
  {
    id: 'lighting-beacons',
    label: 'Lighting & Beacons',
    icon: '💡',
    sub: ['LED Beacons', 'Warning Lights', 'Strobe Lights', 'Work Lights', 'Solar Lights', 'Emergency Lights'],
  },
  {
    id: 'reflectors-signage',
    label: 'Reflectors & Signage',
    icon: '⚠️',
    sub: ['Road Signs', 'Warning Boards', 'Reflective Tape', 'Cat Eyes', 'Chevron Boards', 'Site Notices'],
  },
  {
    id: 'barriers',
    label: 'Barriers & Bollards',
    icon: '🚧',
    sub: ['Jersey Barriers', 'Steel Bollards', 'Crowd Control', 'Security Barriers', 'Stanchions', 'Cable Barriers'],
  },
  {
    id: 'industrial-tools',
    label: 'Industrial Tools',
    icon: '🔧',
    sub: ['Power Tools', 'Hand Tools', 'Measuring Tools', 'Cutting Tools', 'Welding Equipment', 'Testing Devices'],
  },
  {
    id: 'road-studs',
    label: 'Road Studs & Markings',
    icon: '🔩',
    sub: ['Solar Road Studs', 'Raised Pavement Markers', 'Thermoplastic Paint', 'Road Marking Tape', 'Rumble Strips'],
  },
  {
    id: 'fire-safety',
    label: 'Fire Safety',
    icon: '🧯',
    sub: ['Fire Extinguishers', 'Fire Hoses', 'Sprinkler Systems', 'Smoke Detectors', 'Emergency Exits'],
  },
];

export const CATEGORY_PILLS = [
  'All', 'Traffic Safety', 'Safety Gear', 'Lighting & Beacons', 'Barriers',
  'Road Studs', 'Reflectors', 'Industrial Tools', 'Fire Safety', 'Bulk Deals',
];

export const TRUST_BADGES = [
  { icon: '✅', label: 'ISO 9001 Certified' },
  { icon: '🇦🇪', label: 'UAE-Based Supplier' },
  { icon: '📦', label: 'Wholesale Pricing' },
  { icon: '✈️', label: 'Export Ready' },
  { icon: '⚡', label: 'Fast Dispatch' },
  { icon: '📋', label: 'MOQ Available' },
  { icon: '🔒', label: 'Verified Supplier' },
  { icon: '🌍', label: 'GCC Distribution' },
];

export const STATIC_PRODUCTS = [
  // Traffic Safety
  {
    id: 's1', name: 'Solar LED Traffic Light 300mm - Heavy Duty', brand: 'LumiSafe',
    price: 499, mrp: 599, discount: 16, moq: '5 pcs', rating: 4.8, reviews: 425,
    image: 'https://images.unsplash.com/photo-1541888081198-a0e2dc113ea4?q=80&w=400&auto=format&fit=crop',
    category: 'Traffic Safety', inStock: true, badge: 'Bestseller',
    specs: ['300mm Lens', 'Solar Powered', 'IP65 Rated'],
  },
  {
    id: 's2', name: 'High-Vis Safety Vest 3M Reflective Tape - ANSI Class 2', brand: 'ProGuard',
    price: 18.50, mrp: 24, discount: 22, moq: '50 pcs', rating: 4.7, reviews: 1432,
    image: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=400&auto=format&fit=crop',
    category: 'Safety Gear', inStock: true, badge: 'Bulk Deal',
    specs: ['ANSI Class 2', '3M Tape', 'Polyester Mesh'],
  },
  {
    id: 's3', name: 'Traffic Cone 28" Orange Industrial Grade (Pack of 10)', brand: 'RoadSafe',
    price: 149, mrp: 189, discount: 21, moq: '10 pcs', rating: 4.9, reviews: 830,
    image: 'https://images.unsplash.com/photo-1517420875953-ad98a9d1de8e?q=80&w=400&auto=format&fit=crop',
    category: 'Traffic Safety', inStock: true, badge: 'Top Rated',
    specs: ['28" Height', 'PVC Material', 'Weighted Base'],
  },
  {
    id: 's4', name: 'Solar LED Road Stud Aluminum (Pack of 6)', brand: 'LumiSafe',
    price: 85, mrp: 110, discount: 22, moq: '12 pcs', rating: 4.6, reviews: 510,
    image: 'https://images.unsplash.com/photo-1584844308364-a690e03eaff1?q=80&w=400&auto=format&fit=crop',
    category: 'Road Studs', inStock: true, badge: 'New',
    specs: ['Aluminum Body', 'Solar Charged', 'IP68 Rated'],
  },
  {
    id: 's5', name: 'ANSI Type 1 Construction Hard Hat - Ratchet Suspension', brand: 'ProGuard',
    price: 28, mrp: 35, discount: 20, moq: '20 pcs', rating: 4.8, reviews: 3200,
    image: 'https://images.unsplash.com/photo-1582136005230-05e81d7d0a2b?q=80&w=400&auto=format&fit=crop',
    category: 'Safety Gear', inStock: true, badge: 'Hot',
    specs: ['Type 1 ANSI', 'HDPE Shell', 'Ratchet Fit'],
  },
  {
    id: 's6', name: 'Retractable Belt Stanchion - Yellow/Black 6ft', brand: 'CrowdCtrl',
    price: 115, mrp: 145, discount: 20, moq: '10 pcs', rating: 4.6, reviews: 850,
    image: 'https://images.unsplash.com/photo-1579762593175-20226054cad0?q=80&w=400&auto=format&fit=crop',
    category: 'Barriers', inStock: true, badge: 'Popular',
    specs: ['6ft Belt', 'Stainless Steel', '10kg Base'],
  },
  {
    id: 's7', name: 'DOT Warning Triangle Reflector Emergency Kit (3-Piece)', brand: 'RoadSafe',
    price: 34.99, mrp: 45.99, discount: 23, moq: '24 pcs', rating: 4.4, reviews: 1540,
    image: 'https://images.unsplash.com/photo-1536766440263-00e28c7924ef?q=80&w=400&auto=format&fit=crop',
    category: 'Reflectors', inStock: true, badge: null,
    specs: ['DOT Approved', '3-Piece Set', 'Foldable'],
  },
  {
    id: 's8', name: 'Industrial LED Rotating Beacon Warning Light Amber 12-24V', brand: 'LumiSafe',
    price: 155.50, mrp: 180, discount: 13, moq: '5 pcs', rating: 4.9, reviews: 840,
    image: 'https://picsum.photos/seed/beacon001/400/400',
    category: 'Lighting & Beacons', inStock: true, badge: 'Premium',
    specs: ['12-24V DC', '360° Rotation', 'IP55 Rating'],
  },
  {
    id: 's9', name: 'Water Filled PVC Traffic Barrier 1.2m Linkable', brand: 'BarrierPro',
    price: 210, mrp: 260, discount: 19, moq: '20 pcs', rating: 4.7, reviews: 320,
    image: 'https://picsum.photos/seed/barrier002/400/400',
    category: 'Barriers', inStock: true, badge: 'Bulk Deal',
    specs: ['1.2m Length', 'Water Fillable', 'UV Resistant'],
  },
  {
    id: 's10', name: 'Safety Anti-Cut Gloves Level D ANSI Cut Resistant', brand: 'ProGuard',
    price: 12.75, mrp: 16, discount: 20, moq: '100 pcs', rating: 4.5, reviews: 2100,
    image: 'https://picsum.photos/seed/gloves003/400/400',
    category: 'Safety Gear', inStock: true, badge: 'Bestseller',
    specs: ['Level D Cut', 'ANSI/ISEA', 'Touchscreen Compatible'],
  },
  {
    id: 's11', name: 'LED Solar Flashing Road Stud Double Sided 100mm', brand: 'LumiSafe',
    price: 22.50, mrp: 29, discount: 22, moq: '50 pcs', rating: 4.6, reviews: 695,
    image: 'https://picsum.photos/seed/roadstud004/400/400',
    category: 'Road Studs', inStock: false, badge: null,
    specs: ['100mm Dia', 'Dual Sided', 'Solar Powered'],
  },
  {
    id: 's12', name: 'Chevron Warning Board Reflective 600x600mm', brand: 'SignPro',
    price: 55, mrp: 70, discount: 21, moq: '15 pcs', rating: 4.3, reviews: 480,
    image: 'https://picsum.photos/seed/chevron005/400/400',
    category: 'Reflectors', inStock: true, badge: null,
    specs: ['600x600mm', 'Class RA2', 'Aluminum Frame'],
  },
  {
    id: 's13', name: 'Fire Extinguisher ABC Dry Powder 6kg Wall Mount', brand: 'FireShield',
    price: 89, mrp: 115, discount: 22, moq: '10 pcs', rating: 4.8, reviews: 1120,
    image: 'https://picsum.photos/seed/fireext006/400/400',
    category: 'Fire Safety', inStock: true, badge: 'Certified',
    specs: ['6kg ABC Type', 'UL Listed', 'Wall Bracket Incl.'],
  },
  {
    id: 's14', name: 'Industrial Safety Boot Steel Toe S3 SRC Rated', brand: 'ProGuard',
    price: 125, mrp: 160, discount: 21, moq: '6 pairs', rating: 4.7, reviews: 2560,
    image: 'https://picsum.photos/seed/safetyboot007/400/400',
    category: 'Safety Gear', inStock: true, badge: 'Top Rated',
    specs: ['Steel Toe', 'S3 SRC', 'Composite Midsole'],
  },
  {
    id: 's15', name: 'Strobe Emergency LED Warning Light Magnetic Mount 12V', brand: 'FlashAlert',
    price: 68, mrp: 89, discount: 23, moq: '10 pcs', rating: 4.5, reviews: 390,
    image: 'https://picsum.photos/seed/strobe008/400/400',
    category: 'Lighting & Beacons', inStock: true, badge: null,
    specs: ['12V Magnetic', '150 Flash/min', 'Weatherproof'],
  },
  {
    id: 's16', name: 'Jersey Concrete Barrier 2m Precast Road Divider', brand: 'ConcreteX',
    price: 380, mrp: 460, discount: 17, moq: '10 units', rating: 4.9, reviews: 210,
    image: 'https://picsum.photos/seed/jersey009/400/400',
    category: 'Barriers', inStock: true, badge: 'Heavy Duty',
    specs: ['2m Length', 'Precast Concrete', 'F-Shape Profile'],
  },
  {
    id: 's17', name: 'Safety Goggles Anti-Fog Scratch Resistant ANSI Z87.1', brand: 'VisionPro',
    price: 9.50, mrp: 13, discount: 26, moq: '50 pcs', rating: 4.6, reviews: 3400,
    image: 'https://picsum.photos/seed/goggles010/400/400',
    category: 'Safety Gear', inStock: true, badge: 'Hot Deal',
    specs: ['ANSI Z87.1', 'Anti-Fog Coat', 'UV Protection'],
  },
  {
    id: 's18', name: 'Reflective Road Marking Tape Thermoplastic 10cm x 30m', brand: 'MarkPro',
    price: 145, mrp: 185, discount: 21, moq: '20 rolls', rating: 4.4, reviews: 660,
    image: 'https://picsum.photos/seed/marking011/400/400',
    category: 'Reflectors', inStock: true, badge: null,
    specs: ['10cm Width', '30m Roll', 'Heat Applied'],
  },
  {
    id: 's19', name: 'Portable LED Work Light 100W Flood Light Tripod', brand: 'LumiSafe',
    price: 320, mrp: 390, discount: 17, moq: '5 pcs', rating: 4.8, reviews: 480,
    image: 'https://picsum.photos/seed/worklight012/400/400',
    category: 'Lighting & Beacons', inStock: true, badge: 'Popular',
    specs: ['100W LED', 'Adjustable Tripod', 'IP65 Waterproof'],
  },
  {
    id: 's20', name: 'Rubber Speed Hump 500mm x 300mm Modular Yellow/Black', brand: 'RoadSafe',
    price: 95, mrp: 120, discount: 20, moq: '10 pcs', rating: 4.7, reviews: 740,
    image: 'https://picsum.photos/seed/speedhump013/400/400',
    category: 'Traffic Safety', inStock: true, badge: 'Bulk Deal',
    specs: ['Rubber Material', 'Modular Design', 'Pre-Drilled'],
  },
];

export const PROMO_BANNERS = [
  {
    id: 'b1',
    title: 'Bulk Order Discounts',
    subtitle: 'Save up to 30% on orders above AED 5,000',
    cta: 'Get Quote',
    color: '#1e3a5f',
    accentColor: '#f59e0b',
    icon: '📦',
  },
  {
    id: 'b2',
    title: 'ISO Certified Products',
    subtitle: 'All items meet UAE & international safety standards',
    cta: 'View Catalog',
    color: '#1a4731',
    accentColor: '#34d399',
    icon: '✅',
  },
  {
    id: 'b3',
    title: 'Fast UAE Delivery',
    subtitle: 'Same-day dispatch for in-stock items in Dubai & Abu Dhabi',
    cta: 'Order Now',
    color: '#4c1d95',
    accentColor: '#a78bfa',
    icon: '🚚',
  },
];



export const FILTER_OPTIONS = {
  moq: ['1-9 pcs', '10-49 pcs', '50-99 pcs', '100+ pcs'],
  priceRange: ['Under AED 50', 'AED 50-200', 'AED 200-500', 'AED 500+'],
  certification: ['ISO 9001', 'ANSI', 'DOT', 'CE', 'UL Listed', 'UAE Approved'],
  material: ['PVC', 'Aluminum', 'Steel', 'Rubber', 'Polycarbonate', 'Concrete'],
  stockStatus: ['In Stock', 'Out of Stock', 'Pre-Order'],
  supplierType: ['Manufacturer', 'Authorized Distributor', 'Wholesale Dealer'],
};
