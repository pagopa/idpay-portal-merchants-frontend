import {
  formatDate,
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
});

describe('curFormatter', () => {
  test('should format a number into an Italian EUR currency string', () => {
    expect(curFormatter(1234.56)).toBe('1234,56 €');
    expect(curFormatter(0)).toBe('0,00 €');
    expect(curFormatter(-50)).toBe('-50,00 €');
  });
});

describe('currencyFormatter', () => {
  test.each([
    { input: 1234.56, expected: '1234,56 €' },
    { input: 0, expected: '0,00 €' },
    { input: null, expected: null },
    { input: undefined, expected: undefined },
  ])('should format $input into $expected', ({ input, expected }) => {
    expect(currencyFormatter(input as number)).toBe(expected);
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
});
