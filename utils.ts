
import { ExpiryStatus, FoodItem } from './types';

/**
 * Calculates the expiry status based on the difference between today and the expiry date.
 */
export const calculateExpiryStatus = (expiryDateStr: string): ExpiryStatus => {
  const expiryDate = new Date(expiryDateStr);
  const today = new Date();
  
  const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d2 = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
  
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return ExpiryStatus.EXPIRED;
  if (diffDays <= 3) return ExpiryStatus.EXPIRING_SOON;
  return ExpiryStatus.FRESH;
};

/**
 * Calculates a Priority Score (0-10) and associated color/label.
 * 0-2: Red (Critical/Expiring Soon)
 * 3-5: Yellow (Near Expiry)
 * 6-10: Green (Safe)
 */
export const calculatePriority = (expiryDateStr: string) => {
  const expiryDate = new Date(expiryDateStr);
  const today = new Date();
  
  const d1 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d2 = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
  
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let score = Math.max(0, Math.min(10, diffDays + 1));
  if (diffDays < 0) score = 0;

  if (diffDays <= 2) {
    return {
      score,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      label: diffDays < 0 ? 'Expired' : 'Expiring Soon',
      theme: 'red'
    };
  } else if (diffDays <= 6) {
    return {
      score,
      color: 'text-warning-orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      label: 'Near Expiry',
      theme: 'yellow'
    };
  } else {
    return {
      score,
      color: 'text-fresh-green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
      label: 'Safe',
      theme: 'green'
    };
  }
};

/**
 * Exports inventory data to a CSV file.
 */
export const exportToCSV = (inventory: FoodItem[]) => {
  const headers = ['Name', 'Category', 'Quantity', 'Location', 'Expiry Date', 'Status'];
  const rows = inventory.map(item => [
    item.name,
    item.category,
    item.quantity,
    item.location,
    new Date(item.expiryDate).toLocaleDateString(),
    item.status
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Expronix_Report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
