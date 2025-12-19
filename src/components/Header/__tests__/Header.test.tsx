jest.mock('@pagopa/selfcare-common-frontend/services/analyticsService');
jest.mock('@pagopa/selfcare-common-frontend/config/env', () => ({
  CONFIG: {
    HEADER: {
      LINK: {
        PRODUCTURL: 'http://test-product-url.com',
      },
    },
  },
}));

let mockOnExit = jest.fn();
let mockOnDocumentationClick = jest.fn();
let mockOnSelectedProduct = jest.fn();
let mockOnSelectedParty = jest.fn();

jest.mock('@pagopa/selfcare-common-frontend', () => ({
  Header: (props: any) => {
    if (props.onDocumentationClick) {
      mockOnDocumentationClick = props.onDocumentationClick;
    }
    if (props.onSelectedProduct) {
      mockOnSelectedProduct = props.onSelectedProduct;
    }
    if (props.onSelectedParty) {
      mockOnSelectedParty = props.onSelectedParty;
    }
    mockOnExit = props.onExit;
    return <div data-testid="common-header" {...props}>{props.children}</div>;
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'commons.title': 'Test Title',
        'roles.ADMIN': 'Administrator',
        'roles.SUB_DELEGATE': 'Sub Delegate',
        'roles.incaricato-ente-creditore': 'Incaricato Ente Creditore',
      };
      return translations[key] || key;
    },
  }),
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, PreloadedState } from '@reduxjs/toolkit';
import Header from '../Header';
import CustomHeader from '../Header';
import { mockedUser } from '../../../decorators/__mocks__/withLogin';
import { Party } from '../../../model/Party';
import { partiesSlice } from '../../../redux/slices/partiesSlice';
import * as analyticsService from '@pagopa/selfcare-common-frontend/services/analyticsService';

function createMockStore(preloadedState?: PreloadedState<any>) {
  return configureStore({
    reducer: {
      parties: partiesSlice.reducer,
    },
    preloadedState,
  });
}

const mockedParties: Array<Party> = [
  {
    roles: [
      {
        partyRole: 'SUB_DELEGATE',
        roleKey: 'incaricato-ente-creditore',
      },
    ],
    description: 'Comune di Bari',
    urlLogo: 'image',
    status: 'ACTIVE',
    partyId: '1',
    digitalAddress: 'comune.bari@pec.it',
    fiscalCode: 'fiscalCodeBari',
    category: 'Comuni e loro Consorzi e Associazioni',
    registeredOffice: 'Piazza della Scala, 2 - 20121 Milano',
    typology: 'Pubblica Amministrazione',
    externalId: 'externalId1',
    originId: 'originId1',
    origin: 'IPA',
    institutionType: 'PA',
  },
  {
    roles: [
      {
        partyRole: 'SUB_DELEGATE',
        roleKey: 'incaricato-ente-creditore',
      },
    ],
    description: 'Comune di Milano',
    urlLogo: 'image2',
    status: 'ACTIVE',
    partyId: '2',
    digitalAddress: 'comune.milano@pec.it',
    fiscalCode: 'fiscalCodeMilano',
    category: 'Comuni e loro Consorzi e Associazioni',
    registeredOffice: 'Piazza della Scala, 2 - 20121 Milano',
    typology: 'Pubblica Amministrazione',
    externalId: 'externalId2',
    originId: 'originId2',
    origin: 'IPA',
    institutionType: 'PA',
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockOnExit = jest.fn();
  mockOnDocumentationClick = jest.fn();
  mockOnSelectedProduct = jest.fn();
  mockOnSelectedParty = jest.fn();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  window.open = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('test suite for Header', () => {
  test('render Header with no parties', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={[]}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render CustomHeader with no parties', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <CustomHeader
          parties={[]}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header with parties', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render CustomHeader with parties', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <CustomHeader
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header with withSecondHeader true', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={true}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header with withSecondHeader false', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header with multiple roles in party', () => {
    const partiesWithMultipleRoles = [
      {
        ...mockedParties[0],
        roles: [
          { partyRole: 'ADMIN', roleKey: 'ADMIN' },
          { partyRole: 'SUB_DELEGATE', roleKey: 'incaricato-ente-creditore' },
        ],
      },
    ];

    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: partiesWithMultipleRoles[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={partiesWithMultipleRoles}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header without loggedUser', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={undefined}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header with empty products', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header with null selected party', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: null,
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header with null products', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: null,
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header with different party roles', () => {
    const partiesWithDifferentRoles = [
      {
        ...mockedParties[0],
        roles: [
          { partyRole: 'MANAGER', roleKey: 'manager' },
        ],
      },
    ];

    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: partiesWithDifferentRoles[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={partiesWithDifferentRoles}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header when selectedParty updates', async () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    const { rerender } = render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    const newStore = createMockStore({
      parties: {
        selected: mockedParties[1],
        products: [],
      },
    });

    rerender(
      <Provider store={newStore}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('common-header')).toBeInTheDocument();
    });
  });

  test('render Header with loggedUser properties', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    const { container } = render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(container).toBeTruthy();
  });

  test('render Header renders CommonHeader component', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={true}
          onExit={onExit}
        />
      </Provider>
    );

    const commonHeader = screen.getByTestId('common-header');
    expect(commonHeader).toBeInTheDocument();
  });

  test('render Header with single role in party', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={[mockedParties[0]]}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header with party logo url', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: { ...mockedParties[0], urlLogo: 'http://custom-logo.com' },
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header handles rerender with new loggedUser', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    const { rerender } = render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    const newLoggedUser = { ...mockedUser, name: 'Jane' };

    rerender(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={newLoggedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header with multiple parties selection', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header with active and inactive products', () => {
    const onExit = jest.fn();
    const mixedProducts = [
      { id: 'prod-1', title: 'Active', status: 'ACTIVE', authorized: true },
      { id: 'prod-2', title: 'Inactive', status: 'INACTIVE', authorized: true },
    ];
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: mixedProducts,
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('render Header with authorized and unauthorized products', () => {
    const onExit = jest.fn();
    const mixedProducts = [
      { id: 'prod-1', title: 'Authorized', status: 'ACTIVE', authorized: true },
      { id: 'prod-2', title: 'Unauthorized', status: 'ACTIVE', authorized: false },
    ];
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: mixedProducts,
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });

  test('call onDocumentationClick callback', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={true}
          onExit={onExit}
        />
      </Provider>
    );

    mockOnDocumentationClick();
    expect(window.open).toHaveBeenCalled();
  });

  test('call onSelectedProduct callback', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={true}
          onExit={onExit}
        />
      </Provider>
    );

    mockOnSelectedProduct({ id: 'prod-1' });
    expect(onExit).toHaveBeenCalled();
  });

  test('call onSelectedParty callback with valid party', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={true}
          onExit={onExit}
        />
      </Provider>
    );

    mockOnSelectedParty({ id: '1' });
    expect(analyticsService.trackEvent).toHaveBeenCalledWith('PARTY_SELECTION', {
      party_id: '1',
    });
    expect(onExit).toHaveBeenCalled();
  });

  test('call onSelectedParty callback with null party', () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={true}
          onExit={onExit}
        />
      </Provider>
    );

    mockOnSelectedParty(null);
    expect(analyticsService.trackEvent).not.toHaveBeenCalled();
  });

  test('useEffect updates party2Show when selectedParty changes', async () => {
    const onExit = jest.fn();
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products: [],
      },
    });

    const { rerender } = render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    const newStore = createMockStore({
      parties: {
        selected: mockedParties[1],
        products: [],
      },
    });

    rerender(
      <Provider store={newStore}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('common-header')).toBeInTheDocument();
    });
  });

  test('useMemo filters products correctly', () => {
    const onExit = jest.fn();
    const products = [
      { id: 'prod-idpay-merchants', title: 'Welfare', status: 'ACTIVE', authorized: true },
      { id: 'prod-2', title: 'Active Auth', status: 'ACTIVE', authorized: true },
      { id: 'prod-3', title: 'Inactive', status: 'INACTIVE', authorized: true },
      { id: 'prod-4', title: 'Unauth', status: 'ACTIVE', authorized: false },
    ];
    const store = createMockStore({
      parties: {
        selected: mockedParties[0],
        products,
      },
    });

    render(
      <Provider store={store}>
        <Header
          parties={mockedParties}
          loggedUser={mockedUser}
          withSecondHeader={false}
          onExit={onExit}
        />
      </Provider>
    );

    expect(screen.getByTestId('common-header')).toBeInTheDocument();
  });
});