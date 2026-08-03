import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDate, resolveAssetUrl, initials } from './format';

describe('formatCurrency', () => {
  it('formats a number as INR with no decimals', () => {
    expect(formatCurrency(1250)).toBe('₹1,250');
  });

  it('falls back to zero for non-numeric input', () => {
    expect(formatCurrency(undefined)).toBe('₹0');
    expect(formatCurrency('not a number')).toBe('₹0');
  });
});

describe('formatDate', () => {
  it('returns an empty string for a falsy value', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('formats a date string as day, short month, year', () => {
    expect(formatDate('2026-01-15T00:00:00.000Z')).toMatch(/15 Jan 2026/);
  });
});

describe('resolveAssetUrl', () => {
  it('returns null for a falsy path', () => {
    expect(resolveAssetUrl(null, 'http://localhost:5000')).toBeNull();
  });

  it('returns absolute URLs unchanged', () => {
    expect(resolveAssetUrl('https://cdn.example.com/a.png', 'http://localhost:5000')).toBe(
      'https://cdn.example.com/a.png'
    );
  });

  it('prefixes relative paths with the base URL', () => {
    expect(resolveAssetUrl('/uploads/a.png', 'http://localhost:5000')).toBe('http://localhost:5000/uploads/a.png');
  });
});

describe('initials', () => {
  it('takes the first letter of up to two words', () => {
    expect(initials('Jane Doe')).toBe('JD');
    expect(initials('Cher')).toBe('C');
    expect(initials('First Middle Last')).toBe('FM');
  });

  it('handles empty input', () => {
    expect(initials('')).toBe('');
    expect(initials(undefined)).toBe('');
  });

  it('ignores repeated whitespace between words', () => {
    expect(initials('Jane   Doe')).toBe('JD');
  });
});
