import { render, screen } from '@testing-library/react';
import NoResultPaper from '../NoResultPaper';
import { useAppSelector } from '../../../redux/hooks';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => `translated_${key}`,
  }),
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

describe('NoResultPaper', () => {
  const defaultKey = 'test.key';

  (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);
  test('should render without crashing', () => {
    render(<NoResultPaper translationKey="test.key" />);
    expect(screen.getByText('translated_test.key')).toBeInTheDocument();
  });

  const renderComponent = (translationKey: string = defaultKey) =>
    render(<NoResultPaper translationKey={translationKey} />);

  beforeEach(() => {
    (useAppSelector as jest.Mock).mockReturnValue([{ initiativeId: 'initiative-1' }]);
  });

  it('renders translated text correctly', () => {
    renderComponent();
    expect(screen.getByText(`translated_${defaultKey}`)).toBeInTheDocument();
  });

  it('updates correctly on re-render with different keys', () => {
    const { rerender } = renderComponent('key1');
    expect(screen.getByText('translated_key1')).toBeInTheDocument();

    rerender(<NoResultPaper translationKey="key2" />);
    expect(screen.getByText('translated_key2')).toBeInTheDocument();
  });

  it('handles edge-case translation keys', () => {
    const keys = [
      '',
      'common.errors.noResultsFound',
      'test.key-special_123',
      'very.long.translation.key.path.to.some.message.value',
    ];

    keys.forEach((key) => {
      renderComponent(key);
      expect(screen.getByText(`translated_${key}`)).toBeInTheDocument();
    });
  });

  it('renders correct MUI structure and styling', () => {
    const { container } = renderComponent();

    const paper = container.querySelector('[class*="MuiPaper"]');
    const stack = container.querySelector('[class*="MuiStack"]');
    const typography = container.querySelector('[class*="MuiTypography"]');

    expect(paper).toBeInTheDocument();
    expect(paper).toHaveStyle({
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });

    expect(stack).toBeInTheDocument();
    expect(stack).toHaveClass('MuiStack-root');

    expect(typography).toBeInTheDocument();
    expect(typography).toHaveClass('MuiTypography-body2');
  });

  it('renders a single Typography inside Stack', () => {
    const { container } = renderComponent();
    const stack = container.querySelector('[class*="MuiStack"]');
    const typographies = stack?.querySelectorAll('[class*="MuiTypography"]');

    expect(typographies).toHaveLength(1);
  });
});
