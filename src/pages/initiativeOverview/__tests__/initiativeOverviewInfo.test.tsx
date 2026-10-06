import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

import { InitiativeOverviewInfo } from '../initiativeOverviewInfo';
import { setupInitiativeMocks } from '../../../test-utils/mockInitiativeContext';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <>{i18nKey}</>,
}));

describe('InitiativeOverviewInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupInitiativeMocks();
  });

  test('Renders InitiativeOverviewInfo', async () => {
    const store = configureStore({
      reducer: {
        initiatives: () => ({
          list: [],
        }),
      },
    });

    render(
      <Provider store={store}>
        <InitiativeOverviewInfo />
      </Provider>
    );
    const openModalButton = screen.getByTestId('open-modal');

    expect(screen.queryByText('pages.initiativeOverview.info.description')).not.toBeInTheDocument();

    expect(screen.queryByText('actions.close')).not.toBeInTheDocument();

    screen.getByTestId('open-modal').click();

    expect(screen.getByText('pages.initiativeOverview.info.description')).toBeInTheDocument();

    expect(screen.getByText('actions.close')).toBeInTheDocument();
  });
});
