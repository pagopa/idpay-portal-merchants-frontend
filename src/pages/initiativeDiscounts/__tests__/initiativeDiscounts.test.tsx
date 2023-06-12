import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import InitiativeDiscounts from '../initiativeDiscounts';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for initiativeDiscounts page', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(<InitiativeDiscounts />);
  });
});
