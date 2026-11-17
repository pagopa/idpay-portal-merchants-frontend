import { getInitiativeResourceFolder } from '../initiativeResources';

jest.mock('../../utils/env', () => ({
  ENV: {
    INITIATIVE_IDS: {
      BONUS_ELETTRODOMESTICI: 'configured-appliances-id',
      BONUS_DECODER: 'configured-decoder-id',
    },
  },
}));

describe('getInitiativeResourceFolder', () => {
  it('resolves initiative resources by ID', () => {
    expect(getInitiativeResourceFolder('configured-appliances-id')).toBe(
      'bonusElettrodomestici2025'
    );
    expect(getInitiativeResourceFolder('configured-decoder-id')).toBe('bonusDecoder2026');
  });

  it('returns undefined for unknown or missing initiative IDs', () => {
    expect(getInitiativeResourceFolder('unknown-id')).toBeUndefined();
    expect(getInitiativeResourceFolder(undefined)).toBeUndefined();
  });
});
