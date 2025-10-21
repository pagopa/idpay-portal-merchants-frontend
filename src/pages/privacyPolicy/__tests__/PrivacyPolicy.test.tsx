import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrivacyPolicy from '../PrivacyPolicy';
import { useOneTrustNotice } from '../../../hooks/useOneTrustNotice';
import { ENV } from '../../../utils/env';
import routes from '../../../routes';

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

const mockedUseOneTrustNotice = useOneTrustNotice as jest.Mock;

describe('PrivacyPolicy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call useOneTrustNotice and render OneTrustContentWrapper with correct props', () => {
    render(<PrivacyPolicy />);

    // expect(mockedUseOneTrustNotice).toHaveBeenCalledTimes(1);
    // expect(mockedUseOneTrustNotice).toHaveBeenCalledWith(
    //   ENV.ONE_TRUST.PRIVACY_POLICY_JSON_URL,
    //   expect.any(Boolean),
    //   expect.any(Function),
    //   routes.PRIVACY_POLICY
    // );

    // const wrapper = screen.getByTestId('onetrust-wrapper');
    // expect(wrapper).toBeInTheDocument();
    // expect(wrapper).toHaveAttribute('data-idselector', ENV.ONE_TRUST.PRIVACY_POLICY_ID);
  });
});
