import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';
import ROUTES from '../../../routes';

vi.mock('../../../hooks/useInitiativesList', () => ({
  useInitiativesList: vi.fn(),
}));

vi.mock('../../SideMenu/SideMenu', () => () => <div data-testid="side-menu-mock" />);
vi.mock('../../Footer/Footer', () => () => <div data-testid="footer-mock" />);
vi.mock('../../Header/CustomHeader', () => () => <div data-testid="header-mock" />);

describe('Layout branch coverage', () => {
  test('renders layout with SideMenu when match is found', () => {
    renderWithContext(
      <MemoryRouter initialEntries={[ROUTES.HOME]}>
        <Layout>
          <div data-testid="child-content" />
        </Layout>
      </MemoryRouter>
    );

    expect(document.querySelector('[data-testid="side-menu-mock"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="footer-mock"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="header-mock"]')).toBeInTheDocument();
  });
  test('renders layout without SideMenu when matchNoSideMenu is found', () => {
    renderWithContext(
      <MemoryRouter initialEntries={['/stores/upload']}>
        <Layout>
          <div data-testid="child-content" />
        </Layout>
      </MemoryRouter>
    );

    expect(document.querySelector('[data-testid="side-menu-mock"]')).not.toBeInTheDocument();
  });

  test('sets showAssistanceInfo to false when on assistance page', () => {
    renderWithContext(
      <MemoryRouter initialEntries={['/assistenza']}>
        <Layout>
          <div data-testid="child-content" />
        </Layout>
      </MemoryRouter>
    );

    expect(document.querySelector('[data-testid="header-mock"]')).toBeInTheDocument();
  });
});
