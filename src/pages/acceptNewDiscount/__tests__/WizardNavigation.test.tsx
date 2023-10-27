import { cleanup } from '@testing-library/react';
import { BASE_ROUTE } from '../../../routes';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import WizardNavigation from '../WizardNavigation';
import React from 'react';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

const oldWindowLocation = global.window.location;

const mockedLocation = {
  assign: jest.fn(),
  pathname: `${BASE_ROUTE}/accetta-sconto/1234`,
  origin: 'MOCKED_ORIGIN',
  search: '',
  hash: '',
};

beforeAll(() => {
  Object.defineProperty(window, 'location', { value: mockedLocation });
});

afterAll(() => {
  Object.defineProperty(window, 'location', { value: oldWindowLocation });
});

afterEach(cleanup);

describe('Test suite for WizardNavigation component', () => {
  test('Render component', () => {
    renderWithContext(
      <WizardNavigation handleBack={jest.fn()} handleNext={jest.fn()} disabledNext={false} />
    );
  });
});
