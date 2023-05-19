import React from 'react';
import { renderWithHistoryAndStore } from '../../../utils/__tests__/test-utils';
import Layout from '../Layout';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('test suite for Layout', () => {
  test('test render Layout', () => {
    renderWithHistoryAndStore(<Layout children={<div />} />);
  });
});
