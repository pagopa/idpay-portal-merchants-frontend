import React, { useState as useStateMock } from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import NewDiscount from '../newDiscount';

vi.mock('react', () => ({
  ...vi.importActual('react'),
  useState: vi.fn(),
}));
const setDiscountCreated = vi.fn();

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  // @ts-ignore
  useStateMock.mockImplementation((init: any) => [init, setDiscountCreated]);
});

describe('Test suite for newDiscount page', () => {
  window.scrollTo = vi.fn();
  test('Render component', () => {
    renderWithContext(<NewDiscount />);
  });

  test('Render component', () => {
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [true, setDiscountCreated]);
    renderWithContext(<NewDiscount />);
  });
});
