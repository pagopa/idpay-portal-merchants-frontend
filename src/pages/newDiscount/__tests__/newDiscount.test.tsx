import React, { useState as useStateMock } from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import NewDiscount from '../newDiscount';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
const setDiscountCreated = jest.fn();

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  // @ts-ignore
  useStateMock.mockImplementation((init: any) => [init, setDiscountCreated]);
});

describe('Test suite for newDiscount page', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(<NewDiscount />);
  });

  test('Render component', () => {
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [true, setDiscountCreated]);
    renderWithContext(<NewDiscount />);
  });
});
