import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import AuthorizeTransactionModal from '../AuthorizeTransactionModal';
import { mockedMerchantTransactionList } from '../../../api/__mocks__/MerchantsApiClient';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for AuthorizeTransactionModal component', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(
      <AuthorizeTransactionModal
        openAuthorizeTrxModal={false}
        setOpenAuthorizeTrxModal={jest.fn()}
        data={mockedMerchantTransactionList[0]}
      />
    );
  });
});
