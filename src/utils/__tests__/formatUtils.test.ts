import {
  formatDate,
  getEndOfNextMonth,
  safeFormatDate,
  curFormatter,
  currencyFormatter,
  formatValues,
  normalizeUrlHttps,
  normalizeUrlHttp,
} from '../formatUtils';
import { MISSING_DATA_PLACEHOLDER } from '../constants';

describe('formatDate', () => {
  test('should format a valid date object correctly', () => {
    const date = new Date('2025-10-06T19:30:00');

    expect(formatDate(date)).toBe('06/10/2025 19:30');
  });

  test('should throw an error for invalid date inputs', () => {
    expect(() => formatDate(null)).toThrow();
    expect(() => formatDate(undefined)).toThrow();
    expect(() => formatDate('invalid-date')).toThrow();
  });

  test('should format different valid dates', () => {
    const date1 = new Date('2024-01-15T10:30:00');
    const date2 = new Date('2024-12-25T23:59:00');

    expect(formatDate(date1)).toBe('15/01/2024 10:30');
    expect(formatDate(date2)).toBe('25/12/2024 23:59');
  });
});

describe('getEndOfNextMonth', () => {
  test('should return undefined when date is not provided', () => {
    const result = getEndOfNextMonth();

    expect(result).toBeUndefined();
  });

  test('should return undefined when date is null', () => {
    const result = getEndOfNextMonth(null as any);

    expect(result).toBeUndefined();
  });

  test('should return end of next month for valid date string', () => {
    const result = getEndOfNextMonth('2024-01-15');

    expect(result).toEqual(new Date(2024, 2, 0));
  });

  test('should return end of next month for valid Date object', () => {
    const date = new Date('2024-06-10');
    const result = getEndOfNextMonth(date);

    expect(result).toEqual(new Date(2024, 7, 0));
  });

  test('should handle year boundary transition', () => {
    const result = getEndOfNextMonth('2024-12-25');

    expect(result).toEqual(new Date(2025, 1, 0));
  });

  test('should handle month with different days', () => {
    const result = getEndOfNextMonth('2024-02-15');

    expect(result).toEqual(new Date(2024, 3, 0));
  });
});

describe('safeFormatDate', () => {
  test('should format valid date object correctly', () => {
    const mockDate = new Date('2024-01-15T10:30:00');

    const result = safeFormatDate(mockDate);

    expect(result).toBe('15/01/2024 10:30');
  });

  test('should format date string correctly', () => {
    const result = safeFormatDate('2024-01-15T10:30:00');

    expect(result).toBe('15/01/2024 10:30');
  });

  test('should return MISSING_DATA_PLACEHOLDER for invalid date', () => {
    const result = safeFormatDate('invalid-date');

    expect(result).toBe(MISSING_DATA_PLACEHOLDER);
  });

  test('should return MISSING_DATA_PLACEHOLDER for NaN date', () => {
    const result = safeFormatDate(NaN);

    expect(result).toBe(MISSING_DATA_PLACEHOLDER);
  });

  test('should handle null value', () => {
    const result = safeFormatDate(null);

    expect(result).not.toBe(MISSING_DATA_PLACEHOLDER);
  });

  test('should handle undefined value', () => {
    const result = safeFormatDate(undefined);

    expect(result).toBe(MISSING_DATA_PLACEHOLDER);
  });

  test('should handle empty string', () => {
    const result = safeFormatDate('');

    expect(result).toBe(MISSING_DATA_PLACEHOLDER);
  });

  test('should format various valid dates', () => {
    const date1 = new Date('2024-12-25T23:59:00');
    const date2 = new Date('2025-01-01T00:00:00');

    expect(safeFormatDate(date1)).toBe('25/12/2024 23:59');
    expect(safeFormatDate(date2)).toBe('01/01/2025 00:00');
  });
});

describe('curFormatter', () => {
  test('should format a number into an Italian EUR currency string', () => {
    expect(curFormatter(1234.56)).toMatch(/1234,56\s€/);
    expect(curFormatter(0)).toMatch(/0,00\s€/);
    expect(curFormatter(-50)).toMatch(/-50,00\s€/);
  });

  test('should format large amounts', () => {
    expect(curFormatter(1000000)).toContain('€');
  });

  test('should format decimal amounts', () => {
    expect(curFormatter(99.99)).toMatch(/99,99\s€/);
  });

  test('should format small amounts', () => {
    expect(curFormatter(0.01)).toMatch(/0,01\s€/);
  });
});

describe('currencyFormatter', () => {
  test.each([
    { input: 1234.56, expected: /1234,56\s€/ },
    { input: 0, expected: /0,00\s€/ },
    { input: null, expected: null },
    { input: undefined, expected: undefined },
  ])('should format $input into $expected', ({ input, expected }) => {
    const result = currencyFormatter(input as number);
    if (expected instanceof RegExp) {
      expect(result).toMatch(expected);
    } else {
      expect(result).toBe(expected);
    }
  });

  test('should format negative numbers', () => {
    expect(currencyFormatter(-100)).toMatch(/-100,00\s€/);
  });

  test('should format decimal values', () => {
    expect(currencyFormatter(45.67)).toMatch(/45,67\s€/);
  });
});

describe('formatValues', () => {
  test.each([
    { input: 'Hello World', expected: 'Hello World' },
    { input: '', expected: MISSING_DATA_PLACEHOLDER },
    { input: null, expected: MISSING_DATA_PLACEHOLDER },
    { input: undefined, expected: MISSING_DATA_PLACEHOLDER },
  ])('should format "$input" into "$expected"', ({ input, expected }) => {
    expect(formatValues(input as string)).toBe(expected);
  });

  test('should return value for non-empty strings', () => {
    expect(formatValues('test-value')).toBe('test-value');
  });

  test('should handle whitespace strings', () => {
    expect(formatValues('   ')).toBe('   ');
  });

  test('should handle special characters', () => {
    expect(formatValues('!@#$%')).toBe('!@#$%');
  });
});

describe('normalizeUrlHttps', () => {
  test.each([
    { input: 'example.com', expected: 'https://example.com' },
    { input: 'https://example.com', expected: 'https://example.com' },
    { input: '  example.com  ', expected: 'https://example.com' },
    { input: '', expected: '' },
    { input: undefined, expected: '' },
    { input: 'http://example.com', expected: 'https://example.com' },
  ])('should normalize "$input" to "$expected"', ({ input, expected }) => {
    expect(normalizeUrlHttps(input)).toBe(expected);
  });

  test('should handle urls with paths', () => {
    expect(normalizeUrlHttps('example.com/path')).toBe('https://example.com/path');
  });

  test('should handle http with paths', () => {
    expect(normalizeUrlHttps('http://example.com/path')).toBe('https://example.com/path');
  });

  test('should handle https with paths', () => {
    expect(normalizeUrlHttps('https://example.com/path')).toBe('https://example.com/path');
  });

  test('should handle urls with ports', () => {
    expect(normalizeUrlHttps('example.com:8080')).toBe('https://example.com:8080');
  });

  test('should handle whitespace only input', () => {
    expect(normalizeUrlHttps('   ')).toBe('');
  });
});

describe('normalizeUrlHttp', () => {
  test.each([
    { input: 'example.com', expected: 'http://example.com' },
    { input: 'http://example.com', expected: 'http://example.com' },
    { input: 'https://example.com', expected: 'https://example.com' },
    { input: '  example.com  ', expected: 'http://example.com' },
    { input: '', expected: '' },
    { input: undefined, expected: '' },
  ])('should normalize "$input" to "$expected"', ({ input, expected }) => {
    expect(normalizeUrlHttp(input)).toBe(expected);
  });

  test('should handle urls with paths', () => {
    expect(normalizeUrlHttp('example.com/path')).toBe('http://example.com/path');
  });

  test('should handle http with paths', () => {
    expect(normalizeUrlHttp('http://example.com/path')).toBe('http://example.com/path');
  });

  test('should handle https with paths', () => {
    expect(normalizeUrlHttp('https://example.com/path')).toBe('https://example.com/path');
  });

  test('should handle urls with ports', () => {
    expect(normalizeUrlHttp('example.com:8080')).toBe('http://example.com:8080');
  });

  test('should handle whitespace only input', () => {
    expect(normalizeUrlHttp('   ')).toBe('');
  });

  test('should preserve protocol for https with whitespace', () => {
    expect(normalizeUrlHttp('  https://example.com  ')).toBe('https://example.com');
  });
});