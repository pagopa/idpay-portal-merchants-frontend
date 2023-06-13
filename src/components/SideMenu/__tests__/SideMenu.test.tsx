import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import SideMenu from '../SideMenu';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Test suite for SideMenu component', () => {
  test('Render component', () => {
    renderWithContext(<SideMenu />);
  });
});
