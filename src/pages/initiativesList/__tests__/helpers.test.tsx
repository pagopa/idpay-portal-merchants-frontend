import { Data, descendingComparator, getComparator, stableSort } from '../helpers';

describe('Test suite for helpers.ts of InitiativesList', () => {
  const orderByInitiativeName = 'initiativeName';
  const orderByOrganizationName = 'organizationName';
  const orderBySpendingPeriod = 'spendingPeriod';

  const mockedCompA: Pick<Data, 'initiativeName' | 'organizationName'> = {
    initiativeName: 'qwerty',
    organizationName: 'org1234',
  };

  const mockedCompB: Pick<Data, 'initiativeName' | 'organizationName'> = {
    initiativeName: 'asdfgh',
    organizationName: 'org5678',
  };

  const mockedCompC: Pick<Data, 'initiativeName' | 'organizationName'> = {
    initiativeName: 'zxcvb',
    organizationName: 'org9012',
  };

  const mockedSpendingPeriodA: Pick<Data, 'spendingPeriod'> = {
    spendingPeriod: '10/01/2024',
  };

  const mockedSpendingPeriodB: Pick<Data, 'spendingPeriod'> = {
    spendingPeriod: '09/01/2024',
  };

  const mockedSpendingPeriodC: Pick<Data, 'spendingPeriod'> = {
    spendingPeriod: '11/01/2024',
  };

  const mockedInvalidSpendingPeriod: Pick<Data, 'spendingPeriod'> = {
    spendingPeriod: 'invalid-date',
  };

  const mockedMissingSpendingPeriod: Pick<Data, 'spendingPeriod'> = {};

  const arr: any = ['1', '2'];
  const comp: any = {
    a: 1,
    b: 0,
  };

  const arr2: any = ['1', '1'];
  const comp2: any = {
    a: 0,
    b: 0,
  };

  test('descendingComparator', () => {
    expect(descendingComparator(mockedCompA, mockedCompA, orderByInitiativeName)).toBe(0);
    expect(descendingComparator(mockedCompA, mockedCompC, orderByInitiativeName)).toBe(1);
    expect(descendingComparator(mockedCompA, mockedCompB, orderByInitiativeName)).toBe(-1);
    expect(descendingComparator(mockedCompA, mockedCompA, orderByOrganizationName)).toBe(0);
    expect(descendingComparator(mockedCompA, mockedCompB, orderByOrganizationName)).toBe(1);
    expect(descendingComparator(mockedCompA, mockedCompC, orderByOrganizationName)).toBe(1);
  });

  test('descendingComparator handles spendingPeriod sorting and invalid values', () => {
    expect(
      descendingComparator(mockedSpendingPeriodA, mockedSpendingPeriodA, orderBySpendingPeriod)
    ).toBe(0);
    expect(
      descendingComparator(mockedSpendingPeriodA, mockedSpendingPeriodB, orderBySpendingPeriod)
    ).toBe(-1);
    expect(
      descendingComparator(mockedSpendingPeriodA, mockedSpendingPeriodC, orderBySpendingPeriod)
    ).toBe(1);
    expect(
      descendingComparator(
        mockedInvalidSpendingPeriod,
        mockedMissingSpendingPeriod,
        orderBySpendingPeriod
      )
    ).toBe(0);
    expect(
      descendingComparator(
        mockedMissingSpendingPeriod,
        mockedSpendingPeriodA,
        orderBySpendingPeriod
      )
    ).toBe(1);
  });

  test('getComparator supports ascending order', () => {
    const ascendingComparator = getComparator('asc', orderByInitiativeName);

    expect(ascendingComparator(mockedCompA, mockedCompB)).toBe(1);
    expect(ascendingComparator(mockedCompB, mockedCompA)).toBe(-1);
  });

  test('stableSort', () => {
    expect(stableSort(arr, getComparator<any, any>(comp.a, comp.b))).toEqual(['1', '2']);
    expect(stableSort(arr2, getComparator<any, any>('desc', comp2.b))).toEqual(['1', '1']);
  });
});
