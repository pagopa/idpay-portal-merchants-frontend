import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { mockedMerchantTransactionList } from '../../../api/__mocks__/MerchantsApiClient';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import AuthorizeTransactionModal from '../AuthorizeTransactionModal';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for AuthorizeTransactionModal component', () => {
  window.scrollTo = jest.fn();
  test('Render component and and onClose with escape button', async () => {
    renderWithContext(
      <AuthorizeTransactionModal
        openAuthorizeTrxModal={true}
        setOpenAuthorizeTrxModal={jest.fn()}
        data={mockedMerchantTransactionList[0]}
      />
    );

    const modal = await screen.findByTestId('confirm-modal-authorize-trx');

    fireEvent.keyDown(modal, {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });
  });
});
