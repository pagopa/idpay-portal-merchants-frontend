import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useOneTrustNotice } from '../../../hooks/useOneTrustNotice';
import TOS from '../TOS';

jest.mock('../../../hooks/useOneTrustNotice');
jest.mock('../../../utils/env', () => ({
  ENV: {
    ONE_TRUST: {
      TOS_ID: 'mock-tos-id',
      TOS_JSON_URL: 'mock-tos-json-url',
    },
  },
}));
jest.mock('../../components/OneTrustContentWrapper', () => (props: { idSelector: string }) => (
  <div data-testid="onetrust-wrapper" data-idselector={props.idSelector} />
));
jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    TOS: '/mock-tos-route',
  },
}));

describe('TOS component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and renders the OneTrust TOS notice', () => {
    render(<TOS />);

    expect(useOneTrustNotice).toHaveBeenCalledWith(
      'mock-tos-json-url',
      false,
      expect.any(Function),
      '/mock-tos-route'
    );
    expect(screen.getByTestId('onetrust-wrapper')).toHaveAttribute(
      'data-idselector',
      'mock-tos-id'
    );
  });
});
