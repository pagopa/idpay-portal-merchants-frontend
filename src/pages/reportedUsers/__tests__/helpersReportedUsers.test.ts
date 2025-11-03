import { isValidCF, normalizeValue } from '../helpersReportedUsers';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';

describe('isValidCF', () => {
  it('restituisce true per un CF valido', () => {
    expect(isValidCF('ABCDEF12G34H567I')).toBe(true);
    expect(isValidCF('abcdef12g34h567i')).toBe(true);
    expect(isValidCF('1234567890123456')).toBe(false);
  });

  it('restituisce false per CF troppo corto o troppo lungo', () => {
    expect(isValidCF('ABCDEF12G34H567')).toBe(false); // 15
    expect(isValidCF('ABCDEF12G34H567II')).toBe(false); // 17
  });

  it('restituisce false per CF con caratteri non validi', () => {
    expect(isValidCF('ABCDEF12G34H567!')).toBe(false);
    expect(isValidCF('ABCDEF12G34H567_')).toBe(false);
    expect(isValidCF('')).toBe(false);
    expect(isValidCF(null as any)).toBe(false);
    expect(isValidCF(undefined as any)).toBe(false);
  });
});

describe('normalizeValue', () => {
  it('restituisce il placeholder per null, undefined o stringa vuota', () => {
    expect(normalizeValue(null)).toBe(MISSING_DATA_PLACEHOLDER);
    expect(normalizeValue(undefined)).toBe(MISSING_DATA_PLACEHOLDER);
    expect(normalizeValue('')).toBe(MISSING_DATA_PLACEHOLDER);
  });

  it('restituisce la stringa se non vuota', () => {
    expect(normalizeValue('test')).toBe('test');
    expect(normalizeValue('0')).toBe('0');
  });

  it('restituisce la data in formato ISO', () => {
    const d = new Date('2023-01-01T12:00:00Z');
    expect(normalizeValue(d)).toBe(d.toISOString());
  });

  it('restituisce la stringa di un numero o oggetto', () => {
    expect(normalizeValue(123)).toBe('123');
    expect(normalizeValue({ a: 1 })).toBe('[object Object]');
  });
});
