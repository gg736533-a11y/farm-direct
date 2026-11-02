export const CATEGORIES = [
  { id: 'ALL', name: 'All Products', icon: 'Sparkles' },
  { id: 'VEGETABLES', name: 'Vegetables', icon: 'Carrot' },
  { id: 'FRUITS', name: 'Fruits', icon: 'Apple' },
  { id: 'GRAINS', name: 'Grains', icon: 'Wheat' },
  { id: 'DAIRY', name: 'Dairy', icon: 'Milk' },
  { id: 'EGGS', name: 'Eggs', icon: 'Egg' },
  { id: 'HONEY', name: 'Honey', icon: 'Droplets' },
  { id: 'NUTS', name: 'Nuts & Seeds', icon: 'Leaf' },
  { id: 'OTHER', name: 'Farm Specials', icon: 'Leaf' },
];

export function normalizeCategory(cat) {
  if (!cat) return 'ALL';
  const c = cat.toString().trim().toUpperCase();
  if (c === 'ALL') return 'ALL';
  if (c === 'VEGETABLES' || c === 'VEGETABLE') return 'VEGETABLES';
  if (c === 'FRUITS' || c === 'FRUIT') return 'FRUITS';
  if (c === 'GRAINS' || c === 'GRAIN') return 'GRAINS';
  if (c === 'DAIRY' || c === 'MILK') return 'DAIRY';
  if (c === 'EGGS' || c === 'EGG') return 'EGGS';
  if (c === 'HONEY') return 'HONEY';
  if (c === 'NUTS' || c === 'NUT' || c === 'PEANUT' || c === 'GROUNDNUT') return 'NUTS';
  return 'OTHER';
}
