import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { mockedMerchantTransactionList } from '../../../api/__mocks__/MerchantsApiClient';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import AuthorizeTransactionModal from '../AuthorizeTransactionModal';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

global.URL.createObjectURL = jest.fn();

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: async () => {},
  },
});

describe('Test suite for AuthorizeTransactionModal component', () => {
  window.scrollTo = jest.fn();

  test('Render component and and onClose with escape button', async () => {
    renderWithContext(
      <AuthorizeTransactionModal
        openAuthorizeTrxModal={true}
        setOpenAuthorizeTrxModal={jest.fn()}
        data={mockedMerchantTransactionList.content[0]}
      />
    );

    // Create a mock for the document.getElementById function
    const mockGetElementById = jest.spyOn(document, 'getElementById');
    const mockContent = document.createElement('div');
    mockGetElementById.mockReturnValue(mockContent);

    const copyToClipBtn = screen.getByText('commons.copyLinkBtn');
    fireEvent.click(copyToClipBtn);

    const downloadBtn = screen.getByText('commons.downloadQrBtn');
    fireEvent.click(downloadBtn);

    const copyCodeToClipBtn = screen.getByText('commons.copyCodeBtn');
    fireEvent.click(copyCodeToClipBtn);

    const modal = await screen.findByTestId('confirm-modal-authorize-trx');

    fireEvent.keyDown(modal, {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });
  });

  test('Render component and close modal clicking the dedicated icon button', async () => {
    renderWithContext(
      <AuthorizeTransactionModal
        openAuthorizeTrxModal={true}
        setOpenAuthorizeTrxModal={jest.fn()}
        data={mockedMerchantTransactionList.content[0]}
      />
    );
    const iconBtn = await screen.findByTestId('close-authorize-transaction-modal-test');
    fireEvent.click(iconBtn);
  });
});
