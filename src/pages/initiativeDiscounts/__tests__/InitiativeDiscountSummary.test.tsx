import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import InitiativeDiscountSummary from '../InitiativeDiscountsSummary';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for InitiativeDiscountSummary component', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(<InitiativeDiscountSummary id={'123456789'} setInitiativeName={jest.fn()} />);
  });
});
