import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { setupInitiativeMocks } from '../../../test-utils/mockInitiativeContext';

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


describe('TOS component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupInitiativeMocks();
  });

  const renderTOS = async (html: string) => {
    jest.doMock('../tosHTML.json', () => ({
      __esModule: true,
      default: { html },
      html,
    }));

    const { default: TOS } = await import('../TOS');
    render(<TOS />);
  };


  it('renders content when html is provided', async () => {
    await renderTOS('<p>Some TOS content</p>');

    expect(
      screen.getByText(/pages\.tosStatic\.title/i)
    ).toBeInTheDocument();

    expect(document.querySelector('.content')).toBeInTheDocument();
  });

  it('renders fallback Typography when html is empty', async () => {
    await renderTOS('');

    expect(
      screen.getByText('Some TOS content')
    ).toBeInTheDocument();
  });
});
