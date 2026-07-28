import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useOneTrustNotice } from '../../../hooks/useOneTrustNotice';
import PrivacyPolicy from '../PrivacyPolicy';

jest.mock('../../../hooks/useOneTrustNotice');
jest.mock('../../../utils/env', () => ({
  ENV: {
    ONE_TRUST: {
      PRIVACY_POLICY_ID: 'mock-privacy-policy-id',
      PRIVACY_POLICY_JSON_URL: 'mock-privacy-policy-url',
    },
  },
}));
jest.mock('../../components/OneTrustContentWrapper', () => (props: { idSelector: string }) => (
  <div data-testid="onetrust-wrapper" data-idselector={props.idSelector} />
));

jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    PRIVACY_POLICY: '/mock-privacy-route',
  },
}));

describe('PrivacyPolicy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and renders the OneTrust privacy notice', () => {
    render(<PrivacyPolicy />);

    expect(useOneTrustNotice).toHaveBeenCalledWith(
      'mock-privacy-policy-url',
      false,
      expect.any(Function),
      '/mock-privacy-route'
    );
    expect(screen.getByTestId('onetrust-wrapper')).toHaveAttribute(
      'data-idselector',
      'mock-privacy-policy-id'
    );
  });
});
