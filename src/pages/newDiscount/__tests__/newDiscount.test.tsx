import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import NewDiscount from '../newDiscount';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for newDiscount page', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(<NewDiscount />);
  });
});
