import { describe, expect, it } from 'vitest';
import { PRODUCTS, formatPrice } from './products';

describe('product catalog', () => {
  it('contains six complete, uniquely routable products', () => {
    expect(PRODUCTS).toHaveLength(6);
    expect(new Set(PRODUCTS.map((product) => product.slug)).size).toBe(6);
    PRODUCTS.forEach((product) => {
      expect(product.image.endsWith('.webp')).toBe(true);
      expect(product.images).toHaveLength(3);
      expect(new Set(product.images).size).toBe(3);
      expect(product.images.every((image) => image.endsWith('.webp'))).toBe(true);
      expect(product.colors.length).toBeGreaterThan(0);
      expect(product.specs.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('formats customer prices with Persian digits', () => {
    expect(formatPrice(4900000)).toContain('۴٬۹۰۰٬۰۰۰');
  });
});
