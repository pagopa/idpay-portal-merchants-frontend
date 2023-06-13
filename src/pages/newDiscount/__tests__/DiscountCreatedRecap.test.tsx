import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import DiscountCreatedRecap from '../DiscountCreatedRecap';
import { transactionResponseMocked } from '../../../api/__mocks__/MerchantsApiClient';

import userEvent from '@testing-library/user-event';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

global.URL.createObjectURL = jest.fn();

describe('Test suite for DiscountCreatedRecap component', () => {
  window.scrollTo = jest.fn();
  test('Render component', async () => {
    renderWithContext(<DiscountCreatedRecap data={transactionResponseMocked} />);
    jest.spyOn(React, 'useEffect').mockImplementation((f) => f());
    const setStateMock = jest.fn();
    const useStateMock: any = (useState: any) => [useState, setStateMock];
    jest.spyOn(React, 'useState').mockImplementation(useStateMock);
    // const downloadQRCode = jest.fn();
    const user = userEvent.setup();
    await user.click(screen.getByTestId('copy-link-buttton-test'));
    // test download
    await user.click(screen.getByTestId('download-qr-code-button-test'));
  });
});
