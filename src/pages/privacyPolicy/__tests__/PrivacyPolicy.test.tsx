import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrivacyPolicy from '../PrivacyPolicy';
import { useOneTrustNotice } from '../../../hooks/useOneTrustNotice';
import { ENV } from '../../../utils/env';
import routes from '../../../routes';

vi.mock('../../../hooks/useOneTrustNotice');
vi.mock('../../components/OneTrustContentWrapper', () => (props: { idSelector: string }) => (
  <div data-testid="onetrust-wrapper" data-idselector={props.idSelector} />
));

vi.mock('../../../utils/env', () => ({
  ENV: {
    ONE_TRUST: {
      PRIVACY_POLICY_JSON_URL: 'mock-privacy-policy-url',
      PRIVACY_POLICY_ID: 'mock-privacy-policy-id',
    },
  },
}));

vi.mock('../../../routes', () => ({
  PRIVACY_POLICY: '/mock-privacy-route',
}));

describe('PrivacyPolicy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<PrivacyPolicy />);
    expect(screen.getByText(/pages\.privacyPolicyStatic\.title/i)).toBeInTheDocument();
  });
});
