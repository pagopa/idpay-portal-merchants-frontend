import getDetailFieldList from '../useDetailList';
import { TYPE_TEXT } from '../../../utils/constants';

describe('getDetailFieldList', () => {
  test('should return an array of 5 objects', () => {
    const list = getDetailFieldList();

    expect(Array.isArray(list)).toBe(true);
    expect(list).toHaveLength(5);
  });

  test.skip('should return the exact list of detail fields with correct values', () => {
    const list = getDetailFieldList();

    expect(list).toMatchSnapshot();
  });
});
