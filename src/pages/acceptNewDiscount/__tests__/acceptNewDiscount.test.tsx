import React, { useState as useStateMock } from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import AcceptNewDiscount from '../acceptNewDiscount';

vi.mock('react', () => ({
  ...vi.importActual('react'),
  useState: vi.fn(),
}));
const setActiveStep = vi.fn();
const setAmount = vi.fn();
const setCode = vi.fn();

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  // @ts-ignore
  useStateMock.mockImplementation((init: any) => [init, setActiveStep]);
  // @ts-ignore
  useStateMock.mockImplementation((init: any) => [init, setAmount]);
  // @ts-ignore
  useStateMock.mockImplementation((init: any) => [init, setCode]);
});

describe('Test suite for AcceptnewDiscount page', () => {
  window.scrollTo = vi.fn();
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
