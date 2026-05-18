import { buildNamespaceKey } from '../buildNamespaceKey';

describe('buildNamespaceKey', () => {
  it('should return empty string if name is empty', () => {
    const result = buildNamespaceKey('', '2024-01-01');
    expect(result).toBe('');
  });

  it('should return empty string if startDate is empty', () => {
    const result = buildNamespaceKey('TestName', '');
    expect(result).toBe('');
  });

  it('should normalize name and append year', () => {
    const result = buildNamespaceKey('Test Name', '2024-05-10');
    expect(result).toBe('testName2024');
  });

  it('should remove special characters and spaces', () => {
    const result = buildNamespaceKey('My Initiative! @2024', '2023-03-15');
    expect(result).toBe('myInitiative20242023');
  });

  it('should lowercase only the first character', () => {
    const result = buildNamespaceKey('TESTName', '2022-07-01');
    expect(result).toBe('tESTName2022');
  });

  it('should handle names with multiple spaces', () => {
    const result = buildNamespaceKey('My   New   Initiative', '2021-12-31');
    expect(result).toBe('myNewInitiative2021');
  });
});
