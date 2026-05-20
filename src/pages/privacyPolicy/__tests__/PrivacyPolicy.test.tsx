import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrivacyPolicy from '../PrivacyPolicy';
import { useAppSelector } from '../../../redux/hooks';

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

jest.mock('../../../hooks/useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(), 
}));

jest.mock('../../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

describe('PrivacyPolicy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppSelector as jest.Mock).mockReturnValue([
      { initiativeId: 'initiative-1' },
    ]);
  });

  const renderComponent = () => {
    render(<PrivacyPolicy />);
  };

  it('renders page title correctly', () => {
    renderComponent();
    expect(
      screen.getByText(/pages\.privacyPolicyStatic\.title/i)
    ).toBeInTheDocument();
  });
});
