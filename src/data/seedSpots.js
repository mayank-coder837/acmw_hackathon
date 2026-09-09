// Initial seed spots dataset for local offline discovery & instant hydration
export const SEED_SPOTS = [
  {
    id: 'spot-1',
    name: 'Arabica Roastery & Lab',
    category: 'coffee',
    emoji: '☕',
    description: 'Minimalist specialty cafe serving Kyoto-style cold drip and single origin pour-overs.',
    lat: 25.1972,
    lng: 55.2744,
    address: 'Downtown Boulevard, Block 4',
    addedBy: 'Elena R.',
    createdAt: Date.now() - 1000 * 60 * 45,
    saveCount: 14,
    tags: ['Specialty Coffee', 'Quiet Work', 'Pastries'],
    rating: 4.8
  },
  {
    id: 'spot-2',
    name: 'Neon Ramen & Gyoza Bar',
    category: 'food',
    emoji: '🍜',
    description: 'Cyberpunk-themed underground ramen joint with 18-hour tonkotsu broth and crisp chili oil.',
    lat: 25.2048,
    lng: 55.2708,
    address: 'Financial Center Alleyway 2',
    addedBy: 'Marcus K.',
    createdAt: Date.now() - 1000 * 60 * 120,
    saveCount: 29,
    tags: ['Ramen', 'Late Night', 'Casual'],
    rating: 4.9
  },
  {
    id: 'spot-3',
    name: 'Rooftop Sunset Vinyl Sessions',
    category: 'events',
    emoji: '🎵',
    description: 'Open-air vinyl DJ set playing soul, funk, and lo-fi house as the sun sets over the skyline.',
    lat: 25.1915,
    lng: 55.2810,
    address: 'The View Terrace, 14th Floor',
    addedBy: 'Sara T.',
    createdAt: Date.now() - 1000 * 60 * 18,
    saveCount: 42,
    tags: ['Music', 'Skyline View', 'Free Entry'],
    rating: 4.9
  },
  {
    id: 'spot-4',
    name: 'Alserkal Indie Cinema & Gallery',
    category: 'culture',
    emoji: '🎨',
    description: 'Warehouse art space showing experimental short films, local photography, and zines.',
    lat: 25.1412,
    lng: 55.2285,
    address: 'Avenue 17, Warehouse 5',
    addedBy: 'Tariq H.',
    createdAt: Date.now() - 1000 * 60 * 300,
    saveCount: 18,
    tags: ['Art Gallery', 'Indie Films', 'Creative'],
    rating: 4.7
  },
  {
    id: 'spot-5',
    name: 'Retro Arcade & Board Game Den',
    category: 'fun',
    emoji: '🕹️',
    description: 'Over 60 original 90s arcade cabinets, pinball machines, and artisanal milkshakes.',
    lat: 25.2085,
    lng: 55.2792,
    address: 'Trade Center Mall, Level B1',
    addedBy: 'Zainab M.',
    createdAt: Date.now() - 1000 * 60 * 60,
    saveCount: 31,
    tags: ['Gaming', 'Arcade', 'Tournaments'],
    rating: 4.6
  },
  {
    id: 'spot-6',
    name: 'Midnight Tacos & Mocktails',
    category: 'food',
    emoji: '🌮',
    description: 'Street-style birria tacos with consommé dip and smoked pineapple citrus coolers.',
    lat: 25.1998,
    lng: 55.2680,
    address: 'Bay Avenue Walkway',
    addedBy: 'Leo B.',
    createdAt: Date.now() - 1000 * 60 * 15,
    saveCount: 22,
    tags: ['Tacos', 'Quick Bites', 'Street Food'],
    rating: 4.8
  },
  {
    id: 'spot-7',
    name: 'Canal Boardwalk Sunset Run & Meetup',
    category: 'events',
    emoji: '🏃',
    description: 'Weekly 5K community jog along the lit water canal, welcoming all paces. Free hydration stations.',
    lat: 25.1852,
    lng: 55.2590,
    address: 'Water Canal Bridge Gate 3',
    addedBy: 'Nadia P.',
    createdAt: Date.now() - 1000 * 60 * 90,
    saveCount: 15,
    tags: ['Fitness', 'Social', 'Outdoors'],
    rating: 4.9
  },
  {
    id: 'spot-8',
    name: 'The Book & Botany Greenhouse',
    category: 'culture',
    emoji: '🌿',
    description: 'Cozy bookshop surrounded by exotic indoor foliage, serving herbal teas and rare prints.',
    lat: 25.2120,
    lng: 55.2650,
    address: 'Jumeirah Road, Villa 12',
    addedBy: 'Farhan D.',
    createdAt: Date.now() - 1000 * 60 * 240,
    saveCount: 37,
    tags: ['Books', 'Plants', 'Peaceful'],
    rating: 4.9
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'events', label: 'Events', emoji: '🎵' },
  { id: 'fun', label: 'Fun & Games', emoji: '🕹️' },
  { id: 'culture', label: 'Culture', emoji: '🎨' }
];

export const CITY_PRESETS = [
  { name: 'Downtown Dubai', lat: 25.1972, lng: 55.2744 },
  { name: 'Dubai Marina', lat: 25.0805, lng: 55.1403 },
  { name: 'Alserkal / Al Quoz', lat: 25.1412, lng: 55.2285 },
  { name: 'Deira Creek', lat: 25.2667, lng: 55.3167 }
];
