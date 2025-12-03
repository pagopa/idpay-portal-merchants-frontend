import { render, screen, fireEvent } from '@testing-library/react';
import { CustomHeaderAccount, JwtUser, RootLinkType } from '../CustomHeaderAccount';

jest.mock('@pagopa/mui-italia/dist/components/ButtonNaked', () => ({
  ButtonNaked: ({ children, ...props }: any) => (
    <button data-testid="button-naked" {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@pagopa/mui-italia/dist/components/AccountDropdown', () => ({
  AccountDropdown: ({ user }: any) => (
    <div data-testid="account-dropdown">{user?.email}</div>
  ),
}));

const rootLink: RootLinkType = {
  label: 'PagoPA S.p.A.',
  href: 'https://www.pagopa.it/it/',
  ariaLabel: 'PagoPA S.p.A.',
  title: 'PagoPA S.p.A.',
};

const loggedUser: JwtUser = {
  id: 'user-id',
  name: 'Mario',
  surname: 'Rossi',
  email: 'mario.rossi@example.com',
};

describe('CustomHeaderAccount', () => {
  test('renderizza il rootLink come ButtonNaked', () => {
    render(
      <CustomHeaderAccount
        rootLink={rootLink}
        loggedUser={false}
        onAssistanceClick={jest.fn()}
      />
    );

    const linkBtn = screen.getAllByTestId('button-naked')[0];
    expect(linkBtn).toBeInTheDocument();
    expect(linkBtn).toHaveAttribute('href', rootLink.href);
    expect(linkBtn).toHaveTextContent(rootLink.label);
  });

  test('mostra i controlli di documentazione (desktop e mobile) quando onDocumentationClick è presente', () => {
    const onDocumentationClick = jest.fn();
    render(
      <CustomHeaderAccount
        rootLink={rootLink}
        loggedUser={false}
        onAssistanceClick={jest.fn()}
        onDocumentationClick={onDocumentationClick}
      />
    );

    // Desktop button (ButtonNaked)
    const docDesktop = screen.getAllByText('Manuale operativo')[0];
    fireEvent.click(docDesktop);
    expect(onDocumentationClick).toHaveBeenCalledTimes(1);

    // IconButton mobile: ha aria-label="Documentazione"
    const docMobile = screen.getByLabelText('Documentazione');
    fireEvent.click(docMobile);
    expect(onDocumentationClick).toHaveBeenCalledTimes(2);
  });

  test('mostra i controlli di assistenza (desktop e mobile) quando enableAssistanceButton è true', () => {
    const onAssistanceClick = jest.fn();
    render(
      <CustomHeaderAccount
        rootLink={rootLink}
        loggedUser={false}
        onAssistanceClick={onAssistanceClick}
      />
    );

    // Desktop button
    const assistDesktop = screen.getAllByText('Assistenza')[0];
    fireEvent.click(assistDesktop);
    expect(onAssistanceClick).toHaveBeenCalledTimes(1);

    // IconButton mobile: ha aria-label="Assistenza"
    const assistMobile = screen.getByLabelText('Assistenza');
    fireEvent.click(assistMobile);
    expect(onAssistanceClick).toHaveBeenCalledTimes(2);
  });

  test('non mostra i controlli di assistenza quando enableAssistanceButton è false', () => {
    render(
      <CustomHeaderAccount
        rootLink={rootLink}
        loggedUser={false}
        onAssistanceClick={jest.fn()}
        enableAssistanceButton={false}
      />
    );

    expect(screen.queryByText('Assistenza')).toBeNull();
    expect(screen.queryByLabelText('Assistenza')).toBeNull();
  });

  test('utente loggato + enableDropdown = true → mostra AccountDropdown', () => {
    render(
      <CustomHeaderAccount
        rootLink={rootLink}
        loggedUser={loggedUser}
        enableDropdown={true}
        onAssistanceClick={jest.fn()}
      />
    );

    const dropdown = screen.getByTestId('account-dropdown');
    expect(dropdown).toBeInTheDocument();
    expect(dropdown).toHaveTextContent(loggedUser.email!);

    // in questo scenario non ci deve essere il bottone Esci
    expect(screen.queryByText('Esci')).toBeNull();
    // né il bottone Accedi
    expect(screen.queryByText('Accedi')).toBeNull();
  });

  test('utente loggato + enableDropdown = false → mostra bottone Logout', () => {
    const onLogout = jest.fn();

    render(
      <CustomHeaderAccount
        rootLink={rootLink}
        loggedUser={loggedUser}
        enableDropdown={false}
        onAssistanceClick={jest.fn()}
        onLogout={onLogout}
      />
    );

    const logoutBtn = screen.getByText('Esci');
    expect(logoutBtn).toBeInTheDocument();
    fireEvent.click(logoutBtn);
    expect(onLogout).toHaveBeenCalledTimes(1);

    // non deve mostrare AccountDropdown
    expect(screen.queryByTestId('account-dropdown')).toBeNull();
    // non deve mostrare bottone Accedi
    expect(screen.queryByText('Accedi')).toBeNull();
  });

  test('utente non loggato → mostra bottone Login', () => {
    const onLogin = jest.fn();

    render(
      <CustomHeaderAccount
        rootLink={rootLink}
        loggedUser={false}
        onAssistanceClick={jest.fn()}
        onLogin={onLogin}
      />
    );

    const loginBtn = screen.getByText('Accedi');
    expect(loginBtn).toBeInTheDocument();
    fireEvent.click(loginBtn);
    expect(onLogin).toHaveBeenCalledTimes(1);

    // niente AccountDropdown e niente bottone Esci
    expect(screen.queryByTestId('account-dropdown')).toBeNull();
    expect(screen.queryByText('Esci')).toBeNull();
  });

  test('quando enableLogin è false non mostra né dropdown né login/logout', () => {
    render(
      <CustomHeaderAccount
        rootLink={rootLink}
        loggedUser={loggedUser}
        enableDropdown={true}
        enableLogin={false}
        onAssistanceClick={jest.fn()}
      />
    );

    expect(screen.queryByTestId('account-dropdown')).toBeNull();
    expect(screen.queryByText('Esci')).toBeNull();
    expect(screen.queryByText('Accedi')).toBeNull();
  });

  test('usa translationsMap personalizzato per logIn/logOut/assistance/documentation', () => {
    const onAssistanceClick = jest.fn();
    const onDocumentationClick = jest.fn();
    const onLogin = jest.fn();
    const onLogout = jest.fn();

    const translationsMap = {
      logIn: 'Entra',
      logOut: 'Esci subito',
      assistance: 'Help',
      documentation: 'Docs',
    };

    // Utente loggato per vedere logOut
    const { rerender } = render(
      <CustomHeaderAccount
        rootLink={rootLink}
        loggedUser={loggedUser}
        enableDropdown={false}
        enableLogin={true}
        onAssistanceClick={onAssistanceClick}
        onDocumentationClick={onDocumentationClick}
        onLogout={onLogout}
        translationsMap={translationsMap}
      />
    );

    // Logout label
    expect(screen.getByText('Esci subito')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Esci subito'));
    expect(onLogout).toHaveBeenCalledTimes(1);

    // Assistance
    expect(screen.getAllByText('Help')[0]).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Help')[0]);
    expect(onAssistanceClick).toHaveBeenCalledTimes(1);

    // Documentation
    expect(screen.getAllByText('Docs')[0]).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Docs')[0]);
    expect(onDocumentationClick).toHaveBeenCalledTimes(1);

    // Rerender utente non loggato per verificare logIn
    rerender(
      <CustomHeaderAccount
        rootLink={rootLink}
        loggedUser={false}
        enableLogin={true}
        onAssistanceClick={onAssistanceClick}
        onDocumentationClick={onDocumentationClick}
        onLogin={onLogin}
        translationsMap={translationsMap}
      />
    );

    expect(screen.getByText('Entra')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Entra'));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});
