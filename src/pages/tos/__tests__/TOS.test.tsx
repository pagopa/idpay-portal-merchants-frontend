import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TOS from '../TOS';
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
      TOS_JSON_URL: 'mock-tos-json-url',
      TOS_ID: 'mock-tos-id',
    },
  },
}));
jest.mock('../../../routes', () => ({
  TOS: '/mock-tos-route',
}));

const mockedUseOneTrustNotice = useOneTrustNotice as jest.Mock;

describe('TOS component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call useOneTrustNotice and render OneTrustContentWrapper with correct props', () => {
    render(<TOS />);

    expect(mockedUseOneTrustNotice).toHaveBeenCalledTimes(1);
    expect(mockedUseOneTrustNotice).toHaveBeenCalledWith(
      ENV.ONE_TRUST.TOS_JSON_URL,
      expect.any(Boolean),
      expect.any(Function),
      routes.TOS
    );

    const wrapper = screen.getByTestId('onetrust-wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute('data-idselector', ENV.ONE_TRUST.TOS_ID);
  });
});
