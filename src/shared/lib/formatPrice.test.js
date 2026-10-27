import { describe, expect, it } from 'vitest';
import { formatPrice } from './formatPrice.js';

describe('formatPrice', () => {
  it('formats a decimal price as Russian rubles', () => {
    expect(formatPrice(367.92)).toBe('367,92 ₽');
  });

  it('formats zero as a valid price', () => {
    expect(formatPrice(0)).toBe('0,00 ₽');
  });

  it('formats integer prices with currency decimals', () => {
    expect(formatPrice(100)).toBe('100,00 ₽');
  });
});
