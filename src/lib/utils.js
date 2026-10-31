const { clsx } = require('clsx');
const { twMerge } = require('tailwind-merge');

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function formatPrice(amount, currencySymbol = '৳') {
  if (amount === null || amount === undefined || isNaN(amount)) return `${currencySymbol}0`;
  return `${currencySymbol}${Number(amount).toLocaleString('en-US')}`;
}

function formatDate(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatShortDate(dateInput) {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `AR-${dateStr}-${randomSuffix}`;
}

module.exports = {
  cn,
  formatPrice,
  formatDate,
  formatShortDate,
  slugify,
  generateOrderNumber,
};
