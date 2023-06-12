import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import CreateForm from '../CreateForm';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for CreateForm component', () => {
  window.scrollTo = jest.fn();
  test('Render component', () => {
    renderWithContext(
      <CreateForm id={'1234'} setDiscountCreated={jest.fn()} setDiscountResponse={jest.fn()} />
    );
  });
});
