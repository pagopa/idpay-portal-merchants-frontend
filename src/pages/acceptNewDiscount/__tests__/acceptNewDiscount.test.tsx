import React, { useState as useStateMock } from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import AcceptNewDiscount from '../acceptNewDiscount';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
const setAmount = jest.fn();
const setCode = jest.fn();
const setAmountGiven = jest.fn();

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  // @ts-ignore
  // Accepts a function that will be used as an implementation of the mock for one call to the mocked function.
  // Can be chained so that multiple function calls produce different results.
  useStateMock.mockImplementation((init: any) => [init, setAmount]);
  // @ts-ignore
  useStateMock.mockImplementation((init: any) => [init, setCode]);
  // @ts-ignore
  useStateMock.mockImplementation((init: any) => [init, setAmountGiven]);
});

describe('Test suite for AcceptnewDiscount page', () => {
  window.scrollTo = jest.fn();
  //   test('Render component', () => {
  //     renderWithContext(<AcceptNewDiscount />);
  //   });

  test('Render component with first step', () => {
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [false, setAmountGiven]);
    renderWithContext(<AcceptNewDiscount />);
  });

  test('Render component with second step', () => {
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [true, setAmountGiven]);
    renderWithContext(<AcceptNewDiscount />);
  });
});
