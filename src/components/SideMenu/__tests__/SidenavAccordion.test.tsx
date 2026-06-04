import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { SidenavAccordion } from '../SidenavAccordion';
import { BASE_ROUTE } from '../../../routes';

jest.mock('@mui/material', () => ({
  Accordion: ({ children, expanded, onChange }: any) => (
    <div
      data-testid="accordion-click-test"
      aria-expanded={expanded}
      onClick={(e) => onChange?.(e)}
    >
      {children}
    </div>
  ),
  AccordionSummary: ({ children }: any) => <div>{children}</div>,
  AccordionDetails: ({ children }: any) => <div>{children}</div>,
  List: ({ children }: any) => <div>{children}</div>,
  ListItemText: ({ primary }: any) => <div>{primary}</div>
}));

jest.mock('../SidenavItem', () => ({
  __esModule: true,
  default: ({ title, handleClick, 'data-testid': dataTestId }: any) => (
    <div data-testid={dataTestId} onClick={handleClick}>
      {title}
    </div>
  )
}));

jest.mock('../../../hooks/useInitiativeConfig');
jest.mock('../../../hooks/useScopedTranslation');
jest.mock('../config', () => ({
  config: [
    {
      key: 'overview',
      title: 'overview.title',
      route: 'overview',
      icon: null,
      dataTestId: 'overview-item'
    }
  ]
}));

const mockedGetConfig = jest.fn();
const mockedT = jest.fn((key) => key);

(require('../../../hooks/useInitiativeConfig') as any).useInitiativeConfig = () => ({
  getConfig: mockedGetConfig
});

(require('../../../hooks/useScopedTranslation') as any).default = () => ({
  t: mockedT
});

const initiative = {
  initiativeId: '123',
  initiativeName: 'Test Initiative'
} as any;

const renderComponent = ({
  path = '/',
  isExpanded = '',
  defaultExpanded = false
}: {
  path?: string;
  isExpanded?: string;
  defaultExpanded?: boolean;
} = {}) => {
  const history = createMemoryHistory({ initialEntries: [path] });

  const setIsExpanded = jest.fn();

  const utils = render(
    <Router history={history}>
      <SidenavAccordion
        item={initiative}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        defaultExpanded={defaultExpanded}
      />
    </Router>
  );

  return { history, setIsExpanded, ...utils };
};

describe('SidenavAccordion', () => {
  beforeEach(() => {
    mockedGetConfig.mockImplementation(
      () =>
        ({
          then: (callback: any) => {
            callback(['overview']);
            return Promise.resolve();
          }
        } as any)
    );
    mockedGetConfig.mockClear();
    mockedT.mockClear();
  });

  it('renders initiative name', async () => {
    renderComponent();
    expect(screen.getByText('Test Initiative')).toBeInTheDocument();
  });

  it('expands when pathname matches initiative route', async () => {
    renderComponent({
      path: `${BASE_ROUTE}/123/overview`
    });

    const accordion = screen.getByTestId('accordion-click-test');
    expect(accordion).toHaveAttribute('aria-expanded', 'true');
  });

  it('expands when defaultExpanded is true', async () => {
    renderComponent({
      path: '/',
      defaultExpanded: true
    });

    const accordion = screen.getByTestId('accordion-click-test');
    expect(accordion).toHaveAttribute('aria-expanded', 'true');
  });

  it('does not expand when pathname does not contain initiativeId', async () => {
    renderComponent({
      path: '/some/other/path'
    });

    const accordion = screen.getByTestId('accordion-click-test');
    expect(accordion).toHaveAttribute('aria-expanded', 'false');
  });

  it('navigates and sets expanded on accordion change', async () => {
    const { history, setIsExpanded } = renderComponent({
      path: '/'
    });

    await waitFor(() => {
      expect(mockedGetConfig).toHaveBeenCalled();
    });

    const accordion = screen.getByTestId('accordion-click-test');
    fireEvent.click(accordion);

    await waitFor(() => {
      expect(history.location.pathname).toBe(
        `${BASE_ROUTE}/123/overview`
      );
      expect(setIsExpanded).toHaveBeenCalledWith('123');
    });
  });

  it('renders sidenav items when config is returned', async () => {
    renderComponent({
      path: `${BASE_ROUTE}/123/overview`
    });

    await waitFor(() => {
      expect(screen.getByTestId('overview-item')).toBeInTheDocument();
    });
  });
});
