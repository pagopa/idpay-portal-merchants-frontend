import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import MerchantTransactions from '../MerchantTransactions';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
describe('test suite for MerchantTransactionsProcessed', () => {
  test('render of component MerchantTransactionsProcessed', () => {
    renderWithContext(<MerchantTransactions id={'testId2222'} />);
  });
});
