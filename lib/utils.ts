import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const round2 = (num: number | undefined | null) => {
  if (num === undefined || num === null || isNaN(num)) {
    return 0;
  }
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const convertDocToObj = (doc: any) => {
  doc._id = doc._id.toString();
  return doc;
};

export const formatNumber = (x: number | undefined | null) => {
  if (x === undefined || x === null || isNaN(x)) {
    return '0';
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const formatId = (x: string) => {
  return `..${x.substring(20, 24)}`;
};

export const formatPrice = (price: number | undefined | null) => {
  if (price === undefined || price === null || isNaN(price)) {
    return '₹0';
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
