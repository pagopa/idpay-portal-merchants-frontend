import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { transactionResponseMocked } from '../../../api/__mocks__/MerchantsApiClient';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import DiscountCreatedRecap from '../DiscountCreatedRecap';

import userEvent from '@testing-library/user-event';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  // Mock the fetch response
  const mockResponse = {
    blob: () => Promise.resolve(new Blob()),
  } as Response;

  jest.spyOn(global, 'fetch').mockResolvedValue(mockResponse);
});

global.URL.createObjectURL = jest.fn();

afterEach(() => cleanup);

describe('Test suite for DiscountCreatedRecap component', () => {
  window.scrollTo = jest.fn();
  test('Render component', async () => {
    renderWithContext(<DiscountCreatedRecap data={transactionResponseMocked} />);
  });

  test('User copies the magic link', async () => {
    renderWithContext(<DiscountCreatedRecap data={transactionResponseMocked} />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId('copy-link-buttton-test'));
    await screen.findByText('pages.newDiscount.magicLinkCopied');
    fireEvent.click(screen.getByTestId('CloseIcon'));
  });

  test('User downloads the QR code', async () => {
    renderWithContext(<DiscountCreatedRecap data={transactionResponseMocked} />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId('download-qr-code-button-test'));
    const toast = await screen.findByText('pages.newDiscount.qrCodeDownloaded');
    expect(toast).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('CloseIcon'));
  });

  test('User navigates back to initiative discount list page', async () => {
    const { history } = renderWithContext(
      <DiscountCreatedRecap data={transactionResponseMocked} />
    );
    const link = await screen.findByText('pages.newDiscount.handleDiscountsBtn');
    const user = userEvent.setup();
    const oldLocationPathname = history.location.pathname;
    await user.click(link);
    await waitFor(() => expect(oldLocationPathname !== history.location.pathname).toBeTruthy());
  });
});
