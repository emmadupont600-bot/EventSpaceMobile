/** Tests utilitaires multi-devise et promo */
import { applyDiscount, toStripeCents, formatMoney } from '../src/utils/currency';

describe('currency utils', () => {
  test('toStripeCents convertit euros en centimes', () => {
    expect(toStripeCents(150)).toBe(15000);
    expect(toStripeCents(9.99)).toBe(999);
  });

  test('applyDiscount percent', () => {
    const r = applyDiscount(100, { discount_type: 'percent', discount_value: 10 });
    expect(r.total).toBe(90);
    expect(r.discount).toBe(10);
  });

  test('applyDiscount fixed', () => {
    const r = applyDiscount(100, { discount_type: 'fixed', discount_value: 25 });
    expect(r.total).toBe(75);
    expect(r.discount).toBe(25);
  });

  test('formatMoney EUR', () => {
    expect(formatMoney(800, 'eur')).toContain('€');
  });
});
