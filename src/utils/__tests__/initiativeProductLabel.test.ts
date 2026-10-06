import { getInitiativeProductLabel } from '../initiativeProductLabel';

describe('getInitiativeProductLabel', () => {
  test('returns Elettrodomestico for bonusElettrodomestici initiative namespace', () => {
    expect(getInitiativeProductLabel('bonusElettrodomestici2025')).toBe('Elettrodomestico');
  });

  test('returns Prodotto for bonusDecoder initiative namespace', () => {
    expect(getInitiativeProductLabel('bonusDecoder2026')).toBe('Prodotto');
  });

  test('returns Prodotto by default for unknown initiatives', () => {
    expect(getInitiativeProductLabel('unknownInitiative2026')).toBe('Prodotto');
  });

  test('returns Prodotto when initiative namespace is missing', () => {
    expect(getInitiativeProductLabel()).toBe('Prodotto');
  });
});

