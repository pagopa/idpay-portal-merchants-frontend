import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { renderWithHistoryAndStore } from '../../../utils/__tests__/test-utils';
import TOSWall from '../TOSWall';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: any) => key }),
  Trans: () => {
    return null;
  },
}));

describe('tests for TOSWall', () => {
  test('test render of TOSWall component with not already accepted tos', async () => {
    renderWithHistoryAndStore(
      <TOSWall acceptTOS={jest.fn()} tosRoute={''} privacyRoute={''} firstAcceptance={false} />
    );
    fireEvent.click(screen.getByText('Accedi'));
  });

  test('test render of TOSWall component with tos already accepted', async () => {
    renderWithHistoryAndStore(
      <TOSWall acceptTOS={jest.fn()} tosRoute={''} privacyRoute={''} firstAcceptance={true} />
    );
  });
});
