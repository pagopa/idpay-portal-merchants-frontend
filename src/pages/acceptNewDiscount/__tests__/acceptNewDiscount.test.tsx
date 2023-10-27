import React, { useState as useStateMock } from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import AcceptNewDiscount from '../acceptNewDiscount';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
const setActiveStep = jest.fn();
const setAmount = jest.fn();
const setCode = jest.fn();

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  // @ts-ignore
  useStateMock.mockImplementation((init: any) => [init, setActiveStep]);
  // @ts-ignore
  useStateMock.mockImplementation((init: any) => [init, setAmount]);
  // @ts-ignore
  useStateMock.mockImplementation((init: any) => [init, setCode]);
});

describe('Test suite for AcceptnewDiscount page', () => {
  window.scrollTo = jest.fn();
  test('Render component with step 0 active', () => {
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [0, setActiveStep]);
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [undefined, setAmount]);
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [undefined, setCode]);
    renderWithContext(<AcceptNewDiscount />);
  });

  test('Render component with step 1 active', () => {
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [1, setActiveStep]);
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [100, setAmount]);
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [undefined, setCode]);
    renderWithContext(<AcceptNewDiscount />);
  });

  test('Render component with unexpected step 2 active', () => {
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [2, setActiveStep]);
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => [100, setAmount]);
    // @ts-ignore
    useStateMock.mockImplementationOnce(() => ['qwertyui', setCode]);
    renderWithContext(<AcceptNewDiscount />);
  });
});
