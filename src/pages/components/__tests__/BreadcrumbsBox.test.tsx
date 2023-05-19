import React from 'react';
import ROUTES from '../../../routes';
import { renderWithHistoryAndStore } from '../../../utils/__tests__/test-utils';
import BreadcrumbsBox from '../BreadcrumbsBox';

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for BreadcrumbsBox', () => {
  test('render BreadcrumbsBox', () => {
    renderWithHistoryAndStore(
      <BreadcrumbsBox
        backUrl={ROUTES.HOME}
        backLabel="Indietro"
        items={['Level1', 'Level2', 'Level3']}
      />
    );
  });
});
