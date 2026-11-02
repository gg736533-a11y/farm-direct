// Static Mock Data for FarmDirect Farmer Portal
// Fictional farmer: Ravi Farms, Salem, Tamil Nadu

export const FARMER_PROFILE = {
  id: 'ravi-farms',
  farmName: 'Ravi Farms',
  ownerName: 'Ravi Kumar',
  verified: true,
  verifiedDate: '12 March 2024',
  location: 'Salem, Tamil Nadu',
  district: 'Salem',
  state: 'Tamil Nadu',
  phone: '+91 98421 67890',
  email: 'ravi@ravifarms.in',
  avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
  coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80',
  tagline: 'Growing fresh vegetables with transparent farm-to-consumer practices.',
  about: 'Nestled at the foothills of Yercaud, Ravi Farms spans 12 acres of rich red soil. We cultivate native Indian vegetables using natural compost, neem-oil pest repellants, and solar-powered micro-drip irrigation. We believe consumers have the right to know the exact day their produce leaves our soil.',
  acreage: '12 Acres',
  established: '2014',
  deliveryRadius: 'Up to 90 km & direct express transport',
  certifications: [
    'Tamil Nadu Organic Farming Certified',
    'Zero Synthetic Residue Inspected',
    'Soil Health Card Grade A'
  ],
  farmingPractices: [
    '100% Pesticide-Free',
    'Solar Micro-Drip Irrigation',
    'Native Desi Seeds',
    'Same-Day Harvest Dispatch',
    'Bio-compost enriched soil'
  ]
};

export const FARMER_STATS = {
  totalProducts: {
    value: 24,
    change: '+3 this month',
    trend: 'up'
  },
  activeListings: {
    value: 18,
    change: '+2 this week',
    trend: 'up'
  },
  pendingOrders: {
    value: 7,
    change: 'Requires dispatch today',
    trend: 'neutral'
  },
  monthSales: {
    value: '₹24,850',
    numericValue: 24850,
    change: '+18.4% vs last month',
    trend: 'up'
  }
};

export const SALES_CHART_DATA = {
  '7d': {
    title: 'Last 7 Days',
    total: '₹24,850',
    growth: '+14.2%',
    points: [
      { label: 'Mon', value: 2400, formatted: '₹2,400', orders: 8 },
      { label: 'Tue', value: 3100, formatted: '₹3,100', orders: 11 },
      { label: 'Wed', value: 1800, formatted: '₹1,800', orders: 6 },
      { label: 'Thu', value: 4200, formatted: '₹4,200', orders: 15 },
      { label: 'Fri', value: 3700, formatted: '₹3,700', orders: 13 },
      { label: 'Sat', value: 5100, formatted: '₹5,100', orders: 19 },
      { label: 'Sun', value: 4550, formatted: '₹4,550', orders: 16 }
    ]
  },
  '30d': {
    title: 'Last 30 Days',
    total: '₹94,200',
    growth: '+22.5%',
    points: [
      { label: 'Week 1', value: 18200, formatted: '₹18,200', orders: 64 },
      { label: 'Week 2', value: 22400, formatted: '₹22,400', orders: 78 },
      { label: 'Week 3', value: 28750, formatted: '₹28,750', orders: 95 },
      { label: 'Week 4', value: 24850, formatted: '₹24,850', orders: 88 }
    ]
  },
  '3m': {
    title: 'Last 3 Months',
    total: '₹2,68,400',
    growth: '+31.8%',
    points: [
      { label: 'July', value: 78200, formatted: '₹78,200', orders: 280 },
      { label: 'August', value: 96000, formatted: '₹96,000', orders: 342 },
      { label: 'September', value: 94200, formatted: '₹94,200', orders: 325 }
    ]
  }
};

export const FARMER_PRODUCTS = [
  {
    id: 'organic-tomatoes',
    name: 'Organic Country Tomatoes',
    category: 'vegetables',
    price: 60,
    unit: 'kg',
    stock: 45,
    harvestDate: '17 Sep 2026',
    packingDate: '17 Sep 2026',
    expiryDate: '21 Sep 2026',
    status: 'Active',
    origin: 'Salem, Tamil Nadu',
    ingredients: '100% Heirloom Country Tomato',
    description: 'Vine-ripened indigenous country tomatoes harvested at peak flavor. Known for their balanced tanginess and rich antioxidant lycopene content. Grown without synthetic sprays and dispatched within 24 hours of harvest.',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    views: 1420,
    orders: 84,
    rating: 4.9,
    isExpiringSoon: true,
    expiryDays: 2,
    lowStockThreshold: 15
  },
  {
    id: 'fresh-spinach',
    name: 'Fresh Spinach (Palak)',
    category: 'vegetables',
    price: 40,
    unit: 'bunch',
    stock: 12,
    harvestDate: '18 Sep 2026',
    packingDate: '18 Sep 2026',
    expiryDate: '20 Sep 2026',
    status: 'Active',
    origin: 'Salem, Tamil Nadu',
    ingredients: '100% Organically Grown Tender Palak Leaves',
    description: 'Crisp, tender spinach hand-cut at morning dew. Washed in clean spring water and tied with natural jute fiber. High in natural iron and dietary fiber.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
    views: 980,
    orders: 62,
    rating: 4.8,
    isExpiringSoon: true,
    expiryDays: 1,
    isLowStock: true,
    lowStockThreshold: 20
  },
  {
    id: 'country-eggs',
    name: 'Country Eggs (Desi Hen)',
    category: 'eggs',
    price: 8,
    unit: 'piece',
    stock: 0,
    harvestDate: '16 Sep 2026',
    packingDate: '16 Sep 2026',
    expiryDate: '25 Sep 2026',
    status: 'Out of Stock',
    origin: 'Salem, Tamil Nadu',
    ingredients: '100% Free-Range Desi Country Hen Eggs',
    description: 'Free-range pasture raised country eggs gathered daily from naturally fed desi hens. Deep golden yolks rich in Omega-3 and natural protein.',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
    views: 1680,
    orders: 110,
    rating: 4.9,
    isExpiringSoon: false,
    expiryDays: 7,
    lowStockThreshold: 30
  },
  {
    id: 'desi-cow-milk',
    name: 'Raw A2 Desi Cow Milk',
    category: 'dairy',
    price: 75,
    unit: 'litre',
    stock: 18,
    harvestDate: '18 Sep 2026',
    packingDate: '18 Sep 2026',
    expiryDate: '19 Sep 2026',
    status: 'Active',
    origin: 'Salem, Tamil Nadu',
    ingredients: '100% Pure Raw Hallikar & Kangayam Cow Milk',
    description: 'Freshly milked every morning from indigenous Kangayam cows grazing on organic green fodder. Unpasteurized and chilled immediately for maximum bioavailability.',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    views: 890,
    orders: 54,
    rating: 5.0,
    isExpiringSoon: true,
    expiryDays: 1,
    lowStockThreshold: 10
  },
  {
    id: 'small-onions',
    name: 'Salem Small Onions (Shallots)',
    category: 'vegetables',
    price: 85,
    unit: 'kg',
    stock: 80,
    harvestDate: '14 Sep 2026',
    packingDate: '15 Sep 2026',
    expiryDate: '15 Oct 2026',
    status: 'Active',
    origin: 'Salem, Tamil Nadu',
    ingredients: '100% Native Chinna Vengayam',
    description: 'Authentic pungent Salem shallots sun-cured for lasting freshness. Traditional staple for South Indian sambar, packed with immune-boosting flavonoids.',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
    views: 740,
    orders: 46,
    rating: 4.8,
    isExpiringSoon: false,
    expiryDays: 27,
    lowStockThreshold: 25
  },
  {
    id: 'curry-leaves',
    name: 'Fresh Curry Leaves (Kariveppilai)',
    category: 'vegetables',
    price: 20,
    unit: 'bunch',
    stock: 4,
    harvestDate: '18 Sep 2026',
    packingDate: '18 Sep 2026',
    expiryDate: '23 Sep 2026',
    status: 'Low Stock',
    origin: 'Salem, Tamil Nadu',
    ingredients: '100% Aromatic Native Curry Leaves',
    description: 'Intensely fragrant native curry leaves freshly harvested from mature trees. Packed with antioxidants and essential oils.',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
    views: 430,
    orders: 38,
    rating: 4.9,
    isExpiringSoon: false,
    expiryDays: 5,
    isLowStock: true,
    lowStockThreshold: 10
  },
  {
    id: 'moringa-leaves',
    name: 'Organic Moringa (Drumstick) Leaves',
    category: 'vegetables',
    price: 30,
    unit: 'bunch',
    stock: 35,
    harvestDate: '18 Sep 2026',
    packingDate: '18 Sep 2026',
    expiryDate: '21 Sep 2026',
    status: 'Active',
    origin: 'Salem, Tamil Nadu',
    ingredients: '100% Fresh Moringa Oleifera Leaves',
    description: 'Nutrient-dense superfood leaves harvested at dawn. Exceptional source of plant iron, calcium, and vitamins A & C.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    views: 520,
    orders: 31,
    rating: 4.7,
    isExpiringSoon: false,
    expiryDays: 3,
    lowStockThreshold: 15
  },
  {
    id: 'sesame-oil',
    name: 'Wood-Pressed Sesame Oil (Nallennai)',
    category: 'other',
    price: 340,
    unit: 'litre',
    stock: 22,
    harvestDate: '10 Sep 2026',
    packingDate: '12 Sep 2026',
    expiryDate: '12 Mar 2027',
    status: 'Active',
    origin: 'Salem, Tamil Nadu',
    ingredients: '100% First-Cold-Pressed Black Sesame & Palm Jaggery',
    description: 'Traditional Vaagai wood marachekku cold pressed oil. Slowly churned at low temperature using farm-grown black sesame seeds and natural palm jaggery.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    views: 1120,
    orders: 72,
    rating: 5.0,
    isExpiringSoon: false,
    expiryDays: 175,
    lowStockThreshold: 10
  }
];

export const FARMER_ORDERS = [
  {
    id: '#FD1024',
    customer: 'Arun',
    phone: '+91 98840 12345',
    address: 'Flat 402, Green Meadows, Fairlands, Salem - 636016',
    productsSummary: 'Organic Tomatoes (3 kg)',
    items: [
      { name: 'Organic Tomatoes', quantity: '3 kg', pricePerUnit: 60, total: 180 }
    ],
    amount: '₹180',
    numericAmount: 180,
    date: '18 Sep 2026',
    time: '10:15 AM',
    status: 'Pending',
    timeline: [
      { title: 'Order Placed', time: '18 Sep 2026, 10:15 AM', completed: true },
      { title: 'Confirmed', time: 'Pending confirmation', completed: false },
      { title: 'Packed', time: 'Waiting at farm hub', completed: false },
      { title: 'Out for Delivery', time: 'Assigned runner', completed: false },
      { title: 'Delivered', time: 'Expected by 4:00 PM', completed: false }
    ]
  },
  {
    id: '#FD1023',
    customer: 'Priya',
    phone: '+91 97911 23456',
    address: '14/B, Gandhi Road, Hasthampatti, Salem - 636007',
    productsSummary: 'Fresh Spinach (3 bunches)',
    items: [
      { name: 'Fresh Spinach', quantity: '3 bunches', pricePerUnit: 40, total: 120 }
    ],
    amount: '₹120',
    numericAmount: 120,
    date: '18 Sep 2026',
    time: '08:45 AM',
    status: 'Confirmed',
    timeline: [
      { title: 'Order Placed', time: '18 Sep 2026, 08:45 AM', completed: true },
      { title: 'Confirmed', time: '18 Sep 2026, 09:00 AM', completed: true },
      { title: 'Packed', time: 'In farm packing facility', completed: false },
      { title: 'Out for Delivery', time: 'Scheduled afternoon', completed: false },
      { title: 'Delivered', time: 'Expected by 3:30 PM', completed: false }
    ]
  },
  {
    id: '#FD1022',
    customer: 'Karthik',
    phone: '+91 94432 34567',
    address: '89, Cherry Road, Maravaneri, Salem - 636007',
    productsSummary: 'Robusta Bananas (2 doz), Milk (1L)',
    items: [
      { name: 'Fresh Bananas', quantity: '2 dozen', pricePerUnit: 48, total: 96 },
      { name: 'Desi Cow Milk', quantity: '2 litres', pricePerUnit: 75, total: 150 },
      { name: 'Curry Leaves', quantity: '1 bunch', pricePerUnit: 4, total: 4 }
    ],
    amount: '₹250',
    numericAmount: 250,
    date: '17 Sep 2026',
    time: '04:20 PM',
    status: 'Delivered',
    timeline: [
      { title: 'Order Placed', time: '17 Sep 2026, 04:20 PM', completed: true },
      { title: 'Confirmed', time: '17 Sep 2026, 04:45 PM', completed: true },
      { title: 'Packed', time: '17 Sep 2026, 05:30 PM', completed: true },
      { title: 'Out for Delivery', time: '18 Sep 2026, 07:00 AM', completed: true },
      { title: 'Delivered', time: '18 Sep 2026, 08:30 AM', completed: true }
    ]
  },
  {
    id: '#FD1021',
    customer: 'Ananya',
    phone: '+91 98402 98765',
    address: 'Villa 12, Palm Groves, Alagapuram, Salem - 636004',
    productsSummary: 'Organic Tomatoes (2 kg), Shallots (1 kg)',
    items: [
      { name: 'Organic Tomatoes', quantity: '2 kg', pricePerUnit: 60, total: 120 },
      { name: 'Salem Small Onions', quantity: '1 kg', pricePerUnit: 85, total: 85 }
    ],
    amount: '₹205',
    numericAmount: 205,
    date: '17 Sep 2026',
    time: '02:10 PM',
    status: 'Packed',
    timeline: [
      { title: 'Order Placed', time: '17 Sep 2026, 02:10 PM', completed: true },
      { title: 'Confirmed', time: '17 Sep 2026, 02:30 PM', completed: true },
      { title: 'Packed', time: '17 Sep 2026, 05:00 PM', completed: true },
      { title: 'Out for Delivery', time: 'Ready for morning dispatch', completed: false },
      { title: 'Delivered', time: 'Pending', completed: false }
    ]
  },
  {
    id: '#FD1020',
    customer: 'Suresh Babu',
    phone: '+91 99520 44321',
    address: '55, Meyyanur Main Road, Salem - 636009',
    productsSummary: 'Wood-Pressed Sesame Oil (1L)',
    items: [
      { name: 'Wood-Pressed Sesame Oil', quantity: '1 litre', pricePerUnit: 340, total: 340 }
    ],
    amount: '₹340',
    numericAmount: 340,
    date: '17 Sep 2026',
    time: '11:15 AM',
    status: 'Out for Delivery',
    timeline: [
      { title: 'Order Placed', time: '17 Sep 2026, 11:15 AM', completed: true },
      { title: 'Confirmed', time: '17 Sep 2026, 11:30 AM', completed: true },
      { title: 'Packed', time: '17 Sep 2026, 01:00 PM', completed: true },
      { title: 'Out for Delivery', time: '18 Sep 2026, 09:30 AM', completed: true },
      { title: 'Delivered', time: 'Runner nearby (within 30 mins)', completed: false }
    ]
  },
  {
    id: '#FD1019',
    customer: 'Meenakshi',
    phone: '+91 93601 55678',
    address: '22, Shankar Nagar, Salem - 636007',
    productsSummary: 'Organic Tomatoes (5 kg), Spinach (2 bunches)',
    items: [
      { name: 'Organic Tomatoes', quantity: '5 kg', pricePerUnit: 60, total: 300 },
      { name: 'Fresh Spinach', quantity: '2 bunches', pricePerUnit: 40, total: 80 }
    ],
    amount: '₹380',
    numericAmount: 380,
    date: '16 Sep 2026',
    time: '06:40 PM',
    status: 'Delivered',
    timeline: [
      { title: 'Order Placed', time: '16 Sep 2026, 06:40 PM', completed: true },
      { title: 'Confirmed', time: '16 Sep 2026, 07:00 PM', completed: true },
      { title: 'Packed', time: '17 Sep 2026, 06:00 AM', completed: true },
      { title: 'Out for Delivery', time: '17 Sep 2026, 08:00 AM', completed: true },
      { title: 'Delivered', time: '17 Sep 2026, 10:15 AM', completed: true }
    ]
  },
  {
    id: '#FD1018',
    customer: 'Venkatesh',
    phone: '+91 98845 67890',
    address: '7, Bretts Road, Salem - 636001',
    productsSummary: 'Moringa Leaves (3 bunches), Desi Milk (1L)',
    items: [
      { name: 'Organic Moringa Leaves', quantity: '3 bunches', pricePerUnit: 30, total: 90 },
      { name: 'Desi Cow Milk', quantity: '1 litre', pricePerUnit: 75, total: 75 }
    ],
    amount: '₹165',
    numericAmount: 165,
    date: '16 Sep 2026',
    time: '03:15 PM',
    status: 'Cancelled',
    timeline: [
      { title: 'Order Placed', time: '16 Sep 2026, 03:15 PM', completed: true },
      { title: 'Cancelled', time: '16 Sep 2026, 03:45 PM (Customer changed schedule)', completed: true }
    ]
  }
];

export const FRESHNESS_ALERTS = [
  {
    id: 'alert-tomatoes',
    productId: 'organic-tomatoes',
    productName: 'Organic Country Tomatoes',
    expiryDays: 2,
    expiryDate: '21 Sep 2026',
    urgency: 'medium',
    message: 'Expires in 2 days. Consider updating stock or offering a bundle discount.',
    currentStock: '45 kg remaining'
  },
  {
    id: 'alert-spinach',
    productId: 'fresh-spinach',
    productName: 'Fresh Spinach (Palak)',
    expiryDays: 1,
    expiryDate: '20 Sep 2026',
    urgency: 'high',
    message: 'Expires tomorrow! 12 units remaining. Prioritize local morning dispatch.',
    currentStock: '12 bunches remaining'
  }
];

export const NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'expiry',
    title: 'Freshness Alert',
    message: 'Organic Tomatoes are expiring in 2 days.',
    time: '10 mins ago',
    read: false,
    link: '/farmer/products'
  },
  {
    id: 'notif-2',
    type: 'order',
    title: 'New Order Received',
    message: 'New order #FD1024 from Arun (₹180).',
    time: '45 mins ago',
    read: false,
    link: '/farmer/orders'
  },
  {
    id: 'notif-3',
    type: 'stock',
    title: 'Low Stock Warning',
    message: 'Fresh Spinach is running low on stock (12 bunches left).',
    time: '2 hours ago',
    read: false,
    link: '/farmer/products'
  },
  {
    id: 'notif-4',
    type: 'verification',
    title: 'Verification Renewal',
    message: 'Your Zero-Residue Certification is up to date until Dec 2026.',
    time: '1 day ago',
    read: true,
    link: '/farmer/verification'
  }
];

export const VERIFICATION_DATA = {
  status: 'Verified',
  farmName: 'Ravi Farms',
  location: 'Salem, Tamil Nadu',
  verifiedDate: '12 March 2024',
  renewalDate: '12 March 2027',
  badgeText: '✓ Verified Farmer',
  certifyingBody: 'Tamil Nadu Organic Certification Department (TNOCD)',
  documents: [
    {
      id: 'doc-reg',
      title: 'Farm Land & Registration Record',
      description: 'Revenue Patta / Chitta & Registered Farm Survey Document #SLM-2014-9912.',
      status: 'Submitted',
      statusText: '✓ Submitted & Verified',
      isApproved: true,
      submittedDate: '10 March 2024'
    },
    {
      id: 'doc-id',
      title: 'Farmer Identity Verification (KYC)',
      description: 'Government Aadhaar & Farmer Card linked with direct DBT identity.',
      status: 'Verified',
      statusText: '✓ Aadhaar KYC Verified',
      isApproved: true,
      submittedDate: '11 March 2024'
    },
    {
      id: 'doc-bank',
      title: 'Direct Farmer Bank Account',
      description: 'State Bank of India (Salem Branch) IFSC: SBIN0001234 linked for direct consumer settlements.',
      status: 'Pending',
      statusText: '⏳ Action Required - Update Bank Verification',
      isApproved: false,
      submittedDate: 'Pending Verification'
    }
  ],
  consumerTransparencyPoints: [
    'Direct farm geotagged harvest origins shown to every consumer.',
    'Tamper-evident batch packaging with verifiable QR labels.',
    'Zero synthetic pesticide declaration with random periodic residue tests.',
    'Guaranteed fair farmer remuneration without intermediate commission deductions.'
  ]
};

export const AI_FEATURES = [
  {
    id: 'ai-desc',
    title: 'AI Product Description',
    tagline: 'Generate rich, transparent product descriptions from simple harvest details.',
    status: 'COMING SOON',
    icon: 'Sparkles',
    color: 'from-emerald-500/10 to-emerald-600/5 text-emerald-700'
  },
  {
    id: 'ai-stock',
    title: 'Smart Stock Insights',
    tagline: 'Understand consumer demand velocity and which crops may need rapid restocking.',
    status: 'COMING SOON',
    icon: 'TrendingUp',
    color: 'from-blue-500/10 to-blue-600/5 text-blue-700'
  },
  {
    id: 'ai-freshness',
    title: 'Freshness Monitor',
    tagline: 'Get proactive alerts for produce approaching expiry with suggested discounted bundles.',
    status: 'COMING SOON',
    icon: 'ShieldAlert',
    color: 'from-amber-500/10 to-amber-600/5 text-amber-700'
  }
];
