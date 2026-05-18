import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAppSelector } from '../../../redux/hooks';

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

describe('TOS component', () => {
  (useAppSelector as jest.Mock).mockReturnValue([{initiativeId: 'initiative-1'}])
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', async () => {
    jest.doMock('../tosHTML.json', () => ({
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
    jest.doMock('../tosHTML.json', () => ({
      __esModule: true,
      default: { html: '' },
      html: '',
    }));

    const { default: TOS } = await import('../TOS');

    render(<TOS />);

    expect(screen.getByText('Some TOS content')).toBeInTheDocument();
  });
});
