
import { StorageLocation, FoodItem, ExpiryStatus } from './types';

export const COLORS = {
  primary: '#2ECC71',
  secondary: '#F39C12',
  accent: '#2980B9',
  bg: '#F8F9FA',
  text: '#2C3E50',
};

export const CATEGORIES = [
  'Dairy', 'Bakery', 'Vegetables', 'Fruits', 'Meat', 'Grains', 'Snacks', 'Beverages', 'Other'
];

export const MOCK_ITEMS: Partial<FoodItem>[] = [
  {
    id: '1',
    name: 'Fresh Milk',
    category: 'Dairy',
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    addedDate: new Date().toISOString(),
    location: StorageLocation.FRIDGE,
    quantity: '1 Liter',
    status: ExpiryStatus.EXPIRING_SOON,
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1550583724-1255818c0533?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: '2',
    name: 'Organic Eggs',
    category: 'Dairy',
    expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    addedDate: new Date().toISOString(),
    location: StorageLocation.FRIDGE,
    quantity: '12 pieces',
    status: ExpiryStatus.FRESH,
    price: 6.50,
    image: 'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: '3',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    expiryDate: new Date().toISOString(),
    addedDate: new Date().toISOString(),
    location: StorageLocation.PANTRY,
    quantity: '1 Loaf',
    status: ExpiryStatus.EXPIRING_SOON,
    price: 3.80,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: '4',
    name: 'Fresh Spinach',
    category: 'Vegetables',
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    addedDate: new Date().toISOString(),
    location: StorageLocation.FRIDGE,
    quantity: '200g',
    status: ExpiryStatus.EXPIRING_SOON,
    price: 2.50,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: '5',
    name: 'Greek Yogurt',
    category: 'Dairy',
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    addedDate: new Date().toISOString(),
    location: StorageLocation.FRIDGE,
    quantity: '500g',
    status: ExpiryStatus.FRESH,
    price: 5.20,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=60'
  },
  {
    id: '6',
    name: 'Avocados',
    category: 'Vegetables',
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    addedDate: new Date().toISOString(),
    location: StorageLocation.PANTRY,
    quantity: '3 units',
    status: ExpiryStatus.FRESH,
    price: 6.00,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&auto=format&fit=crop&q=60'
  }
];
