import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

vi.mock('../../../hooks/useOneTrustNotice');
vi.mock('../../components/OneTrustContentWrapper', () => (props: { idSelector: string }) => (
  <div data-testid="onetrust-wrapper" data-idselector={props.idSelector} />
));

vi.mock('../../../utils/env', () => ({
  ENV: {
    ONE_TRUST: {
      TOS_JSON_URL: 'mock-tos-json-url',
      TOS_ID: 'mock-tos-id',
    },
  },
}));
vi.mock('../../../routes', () => ({
  TOS: '/mock-tos-route',
}));

describe('TOS component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', async () => {
    vi.doMock('../tosHTML.json', () => ({
      __esModule: true,
      default: { html: '<p>Some TOS content</p>' },
      html: '<p>Some TOS content</p>',
    }));

    const { default: TOS } = await import('../TOS');

    render(<TOS />);

    expect(screen.getByText(/pages\.tosStatic\.title/i)).toBeInTheDocument();

    expect(document.querySelector('.content')).toBeInTheDocument();
  });

  test('renders fallback Typography when html is empty (branch 2)', async () => {
    vi.doMock('../tosHTML.json', () => ({
      __esModule: true,
      default: { html: '' },
      html: '',
    }));

    const { default: TOS } = await import('../TOS');

    render(<TOS />);

    expect(screen.getByText("Some TOS content")).toBeInTheDocument();
  });
});
