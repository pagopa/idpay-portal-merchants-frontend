import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

import PrivacyPolicy from '../PrivacyPolicy';
import { setupInitiativeMocks } from '../../../test-utils/mockInitiativeContext';

jest.mock('../../../hooks/useOneTrustNotice');
jest.mock('../../components/OneTrustContentWrapper', () => (props: { idSelector: string }) => (
  <div data-testid="onetrust-wrapper" data-idselector={props.idSelector} />
));

jest.mock('../../../utils/env', () => ({
  ENV: {
    ONE_TRUST: {
      PRIVACY_POLICY_JSON_URL: 'mock-privacy-policy-url',
      PRIVACY_POLICY_ID: 'mock-privacy-policy-id',
    },
  },
}));

jest.mock('../../../routes', () => ({
  PRIVACY_POLICY: '/mock-privacy-route',
}));


describe('PrivacyPolicy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupInitiativeMocks();
  });

  const createMockStore = () =>
    configureStore({
      reducer: {
        initiatives: () => ({
          list: [],
        }),
      },
    });

  const renderComponent = () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PrivacyPolicy />
      </Provider>
    );
  };

  it('renders page title correctly', () => {
    renderComponent();
    expect(
      screen.getByText(/pages\.privacyPolicyStatic\.title/i)
    ).toBeInTheDocument();
  });
});
