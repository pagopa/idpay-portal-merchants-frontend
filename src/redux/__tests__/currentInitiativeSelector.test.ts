import { currentInitiativeSelector, InitiativeExtended } from '../slices/initiativesSlice';
import { RootState } from '../store';

const buildState = (overrides: Partial<RootState>): RootState =>
  ({
    initiatives: {
      list: undefined,
      ...overrides.initiatives,
    },
  } as RootState);

describe('currentInitiativeSelector', () => {
  it('returns undefined if initiativeId is missing', () => {
    const state = buildState({
      initiatives: {
        list: [
          {
            initiativeId: '1',
            initiativeName: 'Test Initiative',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
          } as any,
        ],
      },
    });

    const result = currentInitiativeSelector(state, undefined);

    expect(result).toBeUndefined();
  });

  it('returns undefined if initiatives list is undefined', () => {
    const state = buildState({
      initiatives: {
        list: undefined,
      },
    });

    const result = currentInitiativeSelector(state, '1');

    expect(result).toBeUndefined();
  });

  it('returns undefined if initiative is not found', () => {
    const state = buildState({
      initiatives: {
        list: [
          {
            initiativeId: '1',
            initiativeName: 'Test Initiative',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
          } as any,
        ],
      },
    });

    const result = currentInitiativeSelector(state, '999');

    expect(result).toBeUndefined();
  });

  it('returns InitiativeExtended with computed spendingPeriod', () => {
    const state = buildState({
      initiatives: {
        list: [
          {
            initiativeId: '1',
            initiativeName: 'Test Initiative',
            startDate: '2024-01-01',
            endDate: '2024-12-31',
          } as any,
        ],
      },
    });

    const result = currentInitiativeSelector(state, '1') as InitiativeExtended;

    expect(result).toBeDefined();
    expect(result.initiativeId).toBe('1');
    expect(result.spendingPeriod).toContain('01/01/2024');
    expect(result.spendingPeriod).toContain('31/12/2024');
  });

  it('returns empty spendingPeriod if dates are missing', () => {
    const state = buildState({
      initiatives: {
        list: [
          {
            initiativeId: '1',
            initiativeName: 'Test Initiative',
            startDate: undefined,
            endDate: undefined,
          } as any,
        ],
      },
    });

    const result = currentInitiativeSelector(state, '1') as InitiativeExtended;

    expect(result).toBeDefined();
    expect(result.spendingPeriod).toBe('');
  });
});
