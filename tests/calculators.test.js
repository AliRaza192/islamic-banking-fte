// tests/calculators.test.js
// Unit tests for Islamic Banking FTE calculator functions
import { describe, it, expect } from 'vitest';
import { calculateZakatTransparent } from '../api/calculate.js';

describe('calculateZakatTransparent', () => {
  const defaultNisab = { gold_pkr: 1837500, silver_pkr: 141750, date: '2026-01-01' };

  it('calculates zakat correctly for 5 lakh savings', () => {
    const result = calculateZakatTransparent(500000, defaultNisab);
    expect(result.result.zakatDue).toBe(12500);
    expect(result.result.isZakatable).toBe(true);
    expect(result.result.rate).toBe(0.025);
  });

  it('calculates zakat correctly for 10 lakh', () => {
    const result = calculateZakatTransparent(1000000, defaultNisab);
    expect(result.result.zakatDue).toBe(25000);
    expect(result.result.isZakatable).toBe(true);
  });

  it('returns 0 when below silver nisab', () => {
    const result = calculateZakatTransparent(100000, defaultNisab);
    expect(result.result.zakatDue).toBe(0);
    expect(result.result.isZakatable).toBe(false);
  });

  it('returns 0 for zero assets', () => {
    const result = calculateZakatTransparent(0, defaultNisab);
    expect(result.result.zakatDue).toBe(0);
    expect(result.result.isZakatable).toBe(false);
  });

  it('uses default nisab when none provided', () => {
    const result = calculateZakatTransparent(500000);
    expect(result.result.isZakatable).toBe(true);
    expect(result.result.zakatDue).toBe(12500);
  });

  it('includes required fields in output', () => {
    const result = calculateZakatTransparent(500000, defaultNisab);
    expect(result).toHaveProperty('calculation_type', 'zakat');
    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('result');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('sources');
    expect(result).toHaveProperty('currency', 'PKR');
    expect(result.steps.length).toBeGreaterThanOrEqual(3);
  });

  it('exactly at silver nisab is zakatable', () => {
    const result = calculateZakatTransparent(141750, defaultNisab);
    expect(result.result.isZakatable).toBe(true);
    expect(result.result.zakatDue).toBe(3543.75);
  });

  it('one rupee below silver nisab is not zakatable', () => {
    const result = calculateZakatTransparent(141749, defaultNisab);
    expect(result.result.isZakatable).toBe(false);
    expect(result.result.zakatDue).toBe(0);
  });

  it('rounds zakat to 2 decimal places', () => {
    const result = calculateZakatTransparent(123456, defaultNisab);
    const zakat = result.result.zakatDue;
    expect(zakat).toBe(Math.round(zakat * 100) / 100);
  });

  it('handles very large amounts', () => {
    const result = calculateZakatTransparent(100000000, defaultNisab); // 10 crore
    expect(result.result.zakatDue).toBe(2500000);
    expect(result.result.isZakatable).toBe(true);
  });
});
