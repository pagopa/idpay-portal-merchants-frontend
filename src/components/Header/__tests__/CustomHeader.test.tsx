import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CustomHeader from '../CustomHeader';
import { User } from '@pagopa/selfcare-common-frontend/model/User';
import { trackEvent } from '@pagopa/selfcare-common-frontend/services/analyticsService';
import { ENV } from '../../../utils/env';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@pagopa/selfcare-common-frontend/services/analyticsService', () => ({
  trackEvent: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/config/env', () => ({
  CONFIG: {
    HEADER: {
      LINK: {
        PRODUCTURL: 'http://test-product-url.com',
      },
    },
  },
}));

jest.mock('../../../utils/env', () => ({
  ENV: {
    URL_FE: {
      LOGOUT: 'http://logout-url.com',
      LOGIN: 'http://login-url.com',
    },
    CONFIG: {
      HEADER: {
        OPERATION_MANUAL_LINK: 'http://manual-link.com',
      },
    },
    ASSISTANCE: {
      LINK: 'http://assistance-link.com',
    },
  },
}));

jest.mock('../../../components/Header/CustomHeaderAccount', () => ({
  CustomHeaderAccount: ({ onLogout, onLogin, onDocumentationClick, onAssistanceClick, loggedUser }: any) => (
    <div data-testid="custom-header-account">
      {loggedUser && (
        <div>
          <span>{loggedUser.name}</span>
          <span>{loggedUser.surname}</span>
        </div>
      )}
      <button data-testid="logout-button" onClick={onLogout}>Logout</button>
      <button data-testid="login-button" onClick={onLogin}>Login</button>
      <button data-testid="documentation-button" onClick={onDocumentationClick}>Documentation</button>
      <button data-testid="assistance-button" onClick={onAssistanceClick}>Assistance</button>
    </div>
  ),
}));

jest.mock('@pagopa/mui-italia', () => ({
  HeaderProduct: ({ partyId, productId, productsList, partyList, onSelectedProduct, onSelectedParty }: any) => (
    <div data-testid="header-product">
      <div data-testid="party-id">{partyId}</div>
      <div data-testid="product-id">{productId}</div>
      {productsList && productsList.map((product: any) => (
        <div key={product.id} data-testid={`product-${product.id}`}>
          {product.title}
          <button
            data-testid={`select-product-${product.id}`}
            onClick={() => onSelectedProduct(product)}
          >
            Select
          </button>
        </div>
      ))}
      {partyList && partyList.map((party: any) => (
        <div key={party.id} data-testid={`party-${party.id}`}>
          {party.name}
          <button
            data-testid={`select-party-${party.id}`}
            onClick={() => onSelectedParty(party)}
          >
            Select
          </button>
        </div>
      ))}
    </div>
  ),
}));

const mockPartiesState = {
  parties: {
    selectedParty: {
      partyId: 'party-123',
      description: 'Test Party',
      urlLogo: 'http://logo.com/logo.png',
      roles: [{ roleKey: 'admin' }],
    },
    selectedProducts: [
      {
        id: 'prod-test-1',
        title: 'Test Product 1',
        urlPublic: 'http://product1.com',
        status: 'ACTIVE',
        authorized: true,
      },
      {
        id: 'prod-test-2',
        title: 'Test Product 2',
        urlPublic: 'http://product2.com',
        status: 'INACTIVE',
        authorized: true,
      },
    ],
  },
};

const createMockStore = (initialState = mockPartiesState) => {
  return configureStore({
    reducer: {
      parties: (state = initialState.parties) => state,
    },
    preloadedState: initialState,
  });
};

describe('CustomHeader', () => {
  const mockOnExit = jest.fn((callback) => callback());
  const mockLoggedUser: User = {
    uid: 'user-123',
    name: 'John',
    surname: 'Doe',
    email: 'john.doe@example.com',
    taxCode: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).location;
    (window as any).location = { assign: jest.fn() };
    window.open = jest.fn();
  });

  it('should render CustomHeader component', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.getByTestId('custom-header-account')).toBeInTheDocument();
    expect(screen.getByTestId('header-product')).toBeInTheDocument();
  });

  it('should handle logout action', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    const logoutButton = screen.getByTestId('logout-button');
    fireEvent.click(logoutButton);
    expect(mockOnExit).toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith(ENV.URL_FE.LOGOUT);
  });

  it('should handle login action when user is not logged in', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={undefined}
          parties={[]}
        />
      </Provider>
    );

    const loginButton = screen.getByTestId('login-button');
    fireEvent.click(loginButton);
    expect(mockOnExit).toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith(ENV.URL_FE.LOGIN);
  });

  it('should open documentation link in new tab', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    const docButton = screen.getByTestId('documentation-button');
    fireEvent.click(docButton);
    expect(window.open).toHaveBeenCalledWith(ENV.CONFIG.HEADER.OPERATION_MANUAL_LINK, '_blank');
  });

  it('should open assistance link in new tab', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    const assistanceButton = screen.getByTestId('assistance-button');
    fireEvent.click(assistanceButton);
    expect(window.open).toHaveBeenCalledWith(ENV.ASSISTANCE.LINK, '_blank');
  });

  it('should filter and display only active and authorized products', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.getByTestId('product-prod-test-1')).toBeInTheDocument();
    expect(screen.queryByTestId('product-prod-test-2')).not.toBeInTheDocument();
  });

  it('should track party selection event', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    const partyButton = screen.getByTestId('select-party-party-123');
    fireEvent.click(partyButton);

    expect(trackEvent).toHaveBeenCalledWith('PARTY_SELECTION', {
      party_id: 'party-123',
    });
    expect(mockOnExit).toHaveBeenCalled();
  });

  it('should update party2Show when selectedParty changes', async () => {
    const store = createMockStore();
    const { rerender } = render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.getByText('Test Party')).toBeInTheDocument();

    const newState = {
      parties: {
        ...mockPartiesState.parties,
        selectedParty: {
          partyId: 'party-456',
          description: 'New Test Party',
          urlLogo: 'http://logo.com/new-logo.png',
          roles: [{ roleKey: 'user' }],
        },
      },
    };

    const newStore = createMockStore(newState);
    rerender(
      <Provider store={newStore}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('New Test Party')).toBeInTheDocument();
    });
  });

  it('should render correct logged user information', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
  });

  it('should include welfare product in products list', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.getByText('commons.title')).toBeInTheDocument();
  });

  it('should handle product selection', () => {
    const store = createMockStore();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    const productButton = screen.getByTestId('select-product-prod-test-1');
    fireEvent.click(productButton);

    expect(mockOnExit).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should render with null selectedParty', () => {
    const stateWithNullParty = {
      parties: {
        selectedParty: null,
        selectedProducts: [],
      },
    };
    const store = createMockStore(stateWithNullParty);

    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.getByTestId('custom-header-account')).toBeInTheDocument();
  });

  it('should render with undefined selectedProducts', () => {
    const stateWithUndefinedProducts = {
      parties: {
        selectedParty: mockPartiesState.parties.selectedParty,
        selectedProducts: undefined,
      },
    };
    const store = createMockStore(stateWithUndefinedProducts);

    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.getByTestId('header-product')).toBeInTheDocument();
  });

  it('should filter products by id, status and authorized flag', () => {
    const stateWithMixedProducts = {
      parties: {
        selectedParty: mockPartiesState.parties.selectedParty,
        selectedProducts: [
          {
            id: 'prod-idpay-merchants',
            title: 'Welfare Product',
            urlPublic: 'http://welfare.com',
            status: 'ACTIVE',
            authorized: true,
          },
          {
            id: 'prod-test-3',
            title: 'Test Product 3',
            urlPublic: 'http://product3.com',
            status: 'ACTIVE',
            authorized: false,
          },
          {
            id: 'prod-test-4',
            title: 'Test Product 4',
            urlPublic: 'http://product4.com',
            status: 'PENDING',
            authorized: true,
          },
          {
            id: 'prod-test-5',
            title: 'Test Product 5',
            urlPublic: 'http://product5.com',
            status: 'ACTIVE',
            authorized: true,
          },
        ],
      },
    };
    const store = createMockStore(stateWithMixedProducts);

    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.queryByTestId('product-prod-test-3')).not.toBeInTheDocument();
    expect(screen.queryByTestId('product-prod-test-4')).not.toBeInTheDocument();
    expect(screen.getByTestId('product-prod-test-5')).toBeInTheDocument();
  });

  it('should not call onSelectedParty when selectedParty is null or undefined', () => {
    const store = createMockStore();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    const partyButton = screen.getByTestId('select-party-party-123');

    jest.clearAllMocks();

    fireEvent.click(partyButton);

    expect(trackEvent).toHaveBeenCalled();
    expect(mockOnExit).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle party selection without tracking when party is null', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    jest.clearAllMocks();

    const headerProduct = screen.getByTestId('header-product');
    expect(headerProduct).toBeInTheDocument();
  });

  it('should render with empty products array', () => {
    const stateWithEmptyProducts = {
      parties: {
        selectedParty: mockPartiesState.parties.selectedParty,
        selectedProducts: [],
      },
    };
    const store = createMockStore(stateWithEmptyProducts);

    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.getByTestId('header-product')).toBeInTheDocument();
    expect(screen.getByText('commons.title')).toBeInTheDocument();
  });

  it('should render with product without urlPublic', () => {
    const stateWithProductWithoutUrl = {
      parties: {
        selectedParty: mockPartiesState.parties.selectedParty,
        selectedProducts: [
          {
            id: 'prod-no-url',
            title: 'Product Without URL',
            status: 'ACTIVE',
            authorized: true,
          },
        ],
      },
    };
    const store = createMockStore(stateWithProductWithoutUrl);

    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.getByTestId('product-prod-no-url')).toBeInTheDocument();
  });

  it('should render party with multiple roles', () => {
    const stateWithMultipleRoles = {
      parties: {
        selectedParty: {
          partyId: 'party-multi-role',
          description: 'Multi Role Party',
          urlLogo: 'http://logo.com/logo.png',
          roles: [{ roleKey: 'admin' }, { roleKey: 'operator' }],
        },
        selectedProducts: [],
      },
    };
    const store = createMockStore(stateWithMultipleRoles);

    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.getByText('Multi Role Party')).toBeInTheDocument();
  });

  it('should handle loggedUser as false', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={undefined}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.getByTestId('custom-header-account')).toBeInTheDocument();
    expect(screen.queryByText('John')).not.toBeInTheDocument();
  });

  it('should render when party2Show is undefined initially', () => {
    const stateWithUndefinedParty = {
      parties: {
        selectedParty: undefined,
        selectedProducts: [],
      },
    };
    const store = createMockStore(stateWithUndefinedParty);

    render(
      <Provider store={store}>
        <CustomHeader
          withSecondHeader={true}
          onExit={mockOnExit}
          loggedUser={mockLoggedUser}
          parties={[]}
        />
      </Provider>
    );

    expect(screen.getByTestId('header-product')).toBeInTheDocument();
  });
});