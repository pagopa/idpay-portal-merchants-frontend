import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import DiscountCreatedRecap from '../DiscountCreatedRecap';
import { transactionResponseMocked } from '../../../api/__mocks__/MerchantsApiClient';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for DiscountCreatedRecap component', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(<DiscountCreatedRecap data={transactionResponseMocked} />);
  });
});
