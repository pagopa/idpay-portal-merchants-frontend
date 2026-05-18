import { buildNamespaceKey } from '../buildNamespaceKey';

describe('buildNamespaceKey', () => {
  it.each([
    {
      name: '',
      date: '2024-01-01',
      expected: '',
      description: 'returns empty string if name is empty',
    },
    {
      name: 'TestName',
      date: '',
      expected: '',
      description: 'returns empty string if startDate is empty',
    },
    {
      name: 'Test Name',
      date: '2024-05-10',
      expected: 'testName2024',
      description: 'normalizes name and appends year',
    },
    {
      name: 'My Initiative! @2024',
      date: '2023-03-15',
      expected: 'myInitiative20242023',
      description: 'removes special characters and spaces',
    },
    {
      name: 'TESTName',
      date: '2022-07-01',
      expected: 'testname2022',
      description: 'normalizes entire string to lowercase before camelCase rebuild',
    },
    {
      name: 'My   New   Initiative',
      date: '2021-12-31',
      expected: 'myNewInitiative2021',
      description: 'handles names with multiple spaces',
    },
    {
      name: 'Bonus elettrodomestici',
      date: '2025-01-01',
      expected: 'bonusElettrodomestici2025',
      description: 'is case insensitive and builds correct camelCase namespace',
    },
  ])('should $description', ({ name, date, expected }) => {
    expect(buildNamespaceKey(name, date)).toBe(expected);
  });
});
