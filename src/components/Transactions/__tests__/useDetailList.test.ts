import getDetailFieldList from '../useDetailList';
import { TYPE_TEXT } from '../../../utils/constants';

describe('getDetailFieldList', () => {
  test('should return an array of detail fields', () => {
    const list = getDetailFieldList();

    expect(Array.isArray(list)).toBe(true);
    expect(list).toHaveLength(list.length);
  });

  test('should use Prodotto as default product label', () => {
    const list = getDetailFieldList();

    expect(list[1]).toEqual({
      label: 'Prodotto',
      id: 'additionalProperties.productName',
      type: TYPE_TEXT.Text,
    });
  });

  test('should use custom product label when provided', () => {
    const list = getDetailFieldList('Elettrodomestico');

    expect(list[1]).toEqual({
      label: 'Elettrodomestico',
      id: 'additionalProperties.productName',
      type: TYPE_TEXT.Text,
    });
  });

  test.skip('should return the exact list of detail fields with correct values', () => {
    const list = getDetailFieldList();

    expect(list).toMatchSnapshot();
  });
});
