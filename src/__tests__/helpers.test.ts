/// <reference types="jest" />
/// <reference types="node" />

import {
  copyTextToClipboard,
  downloadQRCodeFromURL,
  mapDataForDiscoutTimeRecap,
  formattedCurrency,
  formatIban,
  formatDate,
  isValidEmail,
  isValidUrl,
  generateUniqueId,
  handlePromptMessage,
  truncateString,
  formatEuro,
  isReversableOrEditable,
} from '../helpers';
import { MISSING_DATA_PLACEHOLDER, MISSING_EURO_PLACEHOLDER } from '../utils/constants';

describe('copyTextToClipboard', () => {
  const writeTextMock = jest.fn();

  beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
    });
  });

  beforeEach(() => {
    writeTextMock.mockClear();
  });

  test('should call clipboard.writeText if a valid string is provided', () => {
    const link = 'https://example.com';
    copyTextToClipboard(link);
    expect(writeTextMock).toHaveBeenCalledWith(link);
  });

  test('should not call clipboard.writeText if the input is undefined', () => {
    copyTextToClipboard(undefined);
    expect(writeTextMock).not.toHaveBeenCalled();
  });
});

describe('downloadQRCodeFromURL', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
    Object.defineProperty(URL, 'createObjectURL', {
      value: jest.fn(() => 'blob:mock-url'),
      writable: true,
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    (URL.createObjectURL as jest.Mock).mockClear();
  });

  it('should log an error if fetch fails', async () => {
    const mockError = new Error('Network error');
    fetchSpy.mockRejectedValue(mockError);

    const { browserConsole } = require('../utils/consoleLogger');
    const consoleSpy = jest.spyOn(browserConsole, 'error').mockImplementation(() => {});

    downloadQRCodeFromURL('https://example.com/qrcode');
    await new Promise(process.nextTick);

    expect(consoleSpy).toHaveBeenCalledWith(mockError);
    consoleSpy.mockRestore();
  });

  it('should perform fetch and trigger download on success', async () => {
    const mockUrl = 'https://example.com/qrcode.png';
    const mockBlob = new Blob(['qrcode-data'], { type: 'image/png' });

    fetchSpy.mockResolvedValue({ blob: () => Promise.resolve(mockBlob) } as any);

    downloadQRCodeFromURL(mockUrl);

    await new Promise(process.nextTick);

    expect(fetchSpy).toHaveBeenCalledWith(mockUrl);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
  });

  test('should not throw if fetch fails', async () => {
    const mockError = new Error('Network error');
    (fetch as jest.Mock).mockRejectedValue(mockError);

    expect(() => downloadQRCodeFromURL('https://example.com/qrcode.png')).not.toThrow();
  });

  test('should do nothing if URL is not a string', () => {
    downloadQRCodeFromURL(undefined);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('mapDataForDiscoutTimeRecap', () => {
  test('should return correct expiration data when valid inputs are provided', () => {
    const date = new Date('2025-10-06T10:00:00.000Z');
    const seconds = 86400 + 3600;
    const { expirationDays, expirationDate, expirationTime } = mapDataForDiscoutTimeRecap(
      seconds,
      date
    );

    expect(expirationDays).toBe(1);
    expect(expirationDate).toBe('07/10/2025');
    expect(expirationTime).toMatch(/13:00/);
  });

  test('should return undefined values if inputs are invalid', () => {
    const result = mapDataForDiscoutTimeRecap(undefined, undefined);
    expect(result).toEqual({
      expirationDays: undefined,
      expirationDate: undefined,
      expirationTime: undefined,
    });
  });
});

describe('formattedCurrency', () => {
  test.each([
    { number: 1234.56, cents: false, expected: '1.234,56 €' },
    { number: 123456, cents: true, expected: '1.234,56 €' },
    { number: 0, cents: false, expected: '0,00 €' },
    { number: 0, cents: true, expected: '0,00 €' },
    { number: undefined, cents: false, expected: MISSING_EURO_PLACEHOLDER },
    { number: undefined, cents: false, symbol: 'N/A', expected: 'N/A' },
  ])(
    'should format $number correctly with options: cents=$cents, symbol=$symbol',
    ({ number, cents, symbol, expected }) => {
      expect(formattedCurrency(number, symbol, cents)).toBe(expected);
    }
  );
});

describe('formatIban', () => {
  test.each([
    { input: 'IT60X0542811101000000123456', expected: 'IT 60 X 05428 11101 000000123456' },
    { input: undefined, expected: MISSING_DATA_PLACEHOLDER },
    { input: '', expected: MISSING_DATA_PLACEHOLDER },
  ])('should format "$input" to "$expected"', ({ input, expected }) => {
    expect(formatIban(input)).toBe(expected);
  });
});

describe('formatDate', () => {
  test.each([
    { input: new Date('2025-12-25T00:00:00.000Z'), expected: '25/12/2025' },
    { input: undefined, expected: '' },
  ])('should format "$input" to "$expected"', ({ input, expected }) => {
    expect(formatDate(input)).toBe(expected);
  });
});

describe('isValidEmail', () => {
  test.each([
    { email: 'test@example.com', expected: true },
    { email: 'test.name@example.co.uk', expected: true },
    { email: 'test', expected: false },
    { email: 'test@example', expected: false },
    { email: '@example.com', expected: false },
    { email: 'test@example.google', expected: true },
  ])('should validate "$email" as $expected', ({ email, expected }) => {
    expect(isValidEmail(email)).toBe(expected);
  });
});
describe('isValidUrl', () => {
  test.each([
    { url: 'http://example.it', expected: true },
    { url: 'http://example.com', expected: true },
    { url: 'http://example.info', expected: true },
    { url: 'http://example.io', expected: true },
    { url: 'http://example.net', expected: true },
    { url: 'http://example.eu', expected: true },
    { url: 'http://example.google', expected: true },
    { url: 'http://example.it/test-page', expected: true },
    { url: 'http://example.it/test-page?param=test&name=test#token=123', expected: true },
    { url: 'https://example.subdomain.com', expected: true },
    { url: 'https://example.it', expected: true },
    { url: 'https://www.example.it:8080/test', expected: true },
    { url: 'http://example.com', expected: true },
    { url: 'example.com', expected: false },
    { url: 'https://example.org', expected: false },
  ])('should validate "$url" as $expected', ({ url, expected }) => {
    expect(isValidUrl(url)).toBe(expected);
  });
});

describe('generateUniqueId', () => {
  test('should generate a unique id', () => {
    const id1 = generateUniqueId();
    const id2 = generateUniqueId();
    expect(id1).toBeDefined();
    expect(typeof id1).toBe('string');
    expect(id1).not.toEqual(id2);
  });

  test('should generate a predictable id when Date and Math are mocked', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
    expect(generateUniqueId()).toBe('17000000000004fzzzxj');
  });
});

describe('handlePromptMessage', () => {
  test('should handle prompt message', () => {
    sessionStorage.setItem('storesPagination', 'test');
    const pathName1 = { pathname: 'path-name-test' };
    const targetPage1 = 'target-page-test';

    const pathName2 = { pathname: 'path-name-test' };
    const targetPage2 = 'path-name-test';

    handlePromptMessage(pathName2, targetPage2);
    expect(sessionStorage.getItem('storesPagination')).toBe('test');

    handlePromptMessage(pathName1, targetPage1);
    expect(sessionStorage.getItem('storesPagination')).toBeNull();
  });
});

describe('formatEuro', () => {
  test('should formatEuro', () => {
    const amountCents = 4500;
    const amount = formatEuro(amountCents);
    expect(amount).toBe('45,00€');
  });
});

describe('truncateString', () => {
  test('should truncateString', () => {
    const initialText = 'Initial text excess';
    const finalText = truncateString(initialText, 7);
    const fullText = truncateString(initialText);
    const emptyText = truncateString();
    expect(finalText).toBe('Initial...');
    expect(fullText).toBe('Initial text excess');
    expect(emptyText).toBe('-');
  });
});

describe('isReversableOrEditable', () => {
  const StatusEnum = {
    INVOICED: 'INVOICED',
    REWARDED: 'REWARDED',
    CANCELLED: 'CANCELLED',
  } as const;

  const RewardBatchTrxStatusEnum = {
    REJECTED: 'REJECTED',
    SUSPENDED: 'SUSPENDED',
    APPROVED: 'APPROVED',
  } as const;

  test('returns true for INVOICED and non-APPROVED batch', () => {
    expect(
      isReversableOrEditable({
        status: 'INVOICED',
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.APPROVED,
      })
    ).toBe(false);
  });

  test('returns true for REWARDED and non-APPROVED batch', () => {
    expect(
      isReversableOrEditable({
        status: StatusEnum.REWARDED,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.SUSPENDED,
      })
    ).toBe(true);
  });

  test('returns false when rewardBatchTrxStatus is APPROVED', () => {
    expect(
      isReversableOrEditable({
        status: StatusEnum.REWARDED,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.APPROVED,
      })
    ).toBe(false);
  });

  test('returns false for unsupported status', () => {
    expect(
      isReversableOrEditable({
        status: StatusEnum.CANCELLED,
        rewardBatchTrxStatus: RewardBatchTrxStatusEnum.REJECTED,
      })
    ).toBe(false);
  });

  test('returns false for undefined input', () => {
    expect(isReversableOrEditable(undefined)).toBe(false);
  });
});
