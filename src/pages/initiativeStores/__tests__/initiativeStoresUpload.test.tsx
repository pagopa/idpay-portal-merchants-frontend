import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InitiativeStoresUpload from '../initiativeStoresUpload';
import { POS_UPDATE } from '../../../utils/constants';
import * as merchantService from '../../../services/merchantService';
import * as jwtUtils from '../../../utils/jwt-utils';
import * as formatUtils from '../../../utils/formatUtils';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/utils/storage';
import { useHistory, useParams } from 'react-router-dom';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  withTranslation: () => (Component: React.ComponentType<any>) => (props: any) =>
    <Component {...props} />,
}));

jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher');

jest.mock('@pagopa/selfcare-common-frontend/utils/storage', () => ({
  storageTokenOps: { read: jest.fn() },
}));

jest.mock('../../../services/merchantService', () => ({
  getMerchantPointOfSales: jest.fn(),
  updateMerchantPointOfSales: jest.fn(),
}));

jest.mock('../../../utils/jwt-utils');

jest.mock('../../../utils/formatUtils', () => ({
  normalizeUrlHttp: jest.fn((x) => x),
  normalizeUrlHttps: jest.fn((x) => x),
}));

jest.mock('../../../routes', () => ({
  __esModule: true,
  default: {
    OVERVIEW: '/portale-esercenti/:id/panoramica',
    STORES: '/portale-esercenti/:id/stores',
  },
}));

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useHistory: jest.fn(),
    useParams: jest.fn(),
    generatePath: (route: string, params: any) => {
      if (typeof route === 'string' && params?.id) {
        return route.replace(':id', params.id);
      }
      return route;
    },
  };
});

jest.mock('../../../components/pointsOfSaleForm/PointsOfSaleForm', () => {
  return function MockPointsOfSaleForm({ onFormChange }: any) {
    return (
      <div data-testid="points-of-sale-form">
        <button
          data-testid="mock-form-change"
          onClick={() => {
            onFormChange([
              {
                franchiseName: 'Test Store',
                contactName: 'John',
                contactSurname: 'Doe',
                contactEmail: 'test@test.com',
                confirmContactEmail: 'test@test.com',
                type: 'PHYSICAL',
                address: 'Via Test 1',
                city: 'Rome',
                zipCode: '00100',
                region: 'Lazio',
                province: 'RM',
              },
            ]);
          }}
        >
          Change Form
        </button>
      </div>
    );
  };
});

const addErrorMock = jest.fn();
const pushMock = jest.fn();
const readTokenMock = storageTokenOps.read as jest.Mock;
const updateMerchantPointOfSalesMock = merchantService.updateMerchantPointOfSales as jest.Mock;

describe('InitiativeStoresUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useErrorDispatcher as jest.Mock).mockReturnValue(addErrorMock);
    (useParams as jest.Mock).mockReturnValue({ id: 'test-initiative' });
    (useHistory as jest.Mock).mockReturnValue({ push: pushMock });
  });

  it('renders correctly with Manual upload by default', () => {
    render(<InitiativeStoresUpload />);
    expect(screen.getByTestId('confirm-stores-button')).toBeInTheDocument();
    expect(screen.getByTestId('back-stores-button')).toBeInTheDocument();
  });

  it('calls handleBack when back button is clicked', () => {
    render(<InitiativeStoresUpload />);
    fireEvent.click(screen.getByTestId('back-stores-button'));

    expect(pushMock).toHaveBeenCalledTimes(1);

    const callArg = pushMock.mock.calls[0][0];
    expect(callArg).toContain('portale-esercenti');
    expect(callArg).toContain('test-initiative');
    expect(callArg).toContain('panoramica');
  });

  it('sets salesPoints when form changes', () => {
    render(<InitiativeStoresUpload />);
    const mockFormChangeButton = screen.getByTestId('mock-form-change');
    fireEvent.click(mockFormChangeButton);
    // Verifica che il form sia stato caricato
    expect(screen.getByTestId('points-of-sale-form')).toBeInTheDocument();
  });

  it('shows error if merchant_id is missing', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({});

    render(<InitiativeStoresUpload />);

    const mockFormChangeButton = screen.getByTestId('mock-form-change');
    fireEvent.click(mockFormChangeButton);

    fireEvent.click(screen.getByTestId('confirm-stores-button'));

    await waitFor(() => {
      expect(addErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          techDescription: 'Merchant ID not found',
        })
      );
    });
  });

  it('shows POINT_OF_SALE_ALREADY_REGISTERED error', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });
    updateMerchantPointOfSalesMock.mockResolvedValue({
      code: 'POINT_OF_SALE_ALREADY_REGISTERED',
      message: 'test@test.com',
    });

    render(<InitiativeStoresUpload />);

    const mockFormChangeButton = screen.getByTestId('mock-form-change');
    fireEvent.click(mockFormChangeButton);

    fireEvent.click(screen.getByTestId('confirm-stores-button'));

    await waitFor(() => {
      expect(addErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          techDescription: 'Point of sale already registered',
          displayableTitle: 'errors.duplicateEmailError',
        })
      );
    });
  });

  it('shows generic upload error when response.code != known', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });
    updateMerchantPointOfSalesMock.mockResolvedValue({ code: 'GENERIC_ERROR' });

    render(<InitiativeStoresUpload />);

    const mockFormChangeButton = screen.getByTestId('mock-form-change');
    fireEvent.click(mockFormChangeButton);

    fireEvent.click(screen.getByTestId('confirm-stores-button'));

    await waitFor(() => {
      expect(addErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          techDescription: 'error points of sale upload',
        })
      );
    });
  });

  it('navigates to STORES when response is null (success)', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });
    updateMerchantPointOfSalesMock.mockResolvedValue(null);

    render(<InitiativeStoresUpload />);

    // Aggiungi dati al form
    const mockFormChangeButton = screen.getByTestId('mock-form-change');
    fireEvent.click(mockFormChangeButton);

    fireEvent.click(screen.getByTestId('confirm-stores-button'));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        expect.objectContaining({
          pathname: expect.stringContaining('/portale-esercenti/test-initiative'),
          state: { showSuccessAlert: true },
        })
      );
    });
  });

  it('normalizes URLs when uploading manually', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });
    updateMerchantPointOfSalesMock.mockResolvedValue(null);

    render(<InitiativeStoresUpload />);

    const mockFormChangeButton = screen.getByTestId('mock-form-change');
    fireEvent.click(mockFormChangeButton);

    fireEvent.click(screen.getByTestId('confirm-stores-button'));

    await waitFor(() => {
      expect(formatUtils.normalizeUrlHttps).toHaveBeenCalled();
      expect(formatUtils.normalizeUrlHttp).toHaveBeenCalled();
    });
  });

  it('calls API even when salesPoints is empty', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });
    updateMerchantPointOfSalesMock.mockResolvedValue(null);

    render(<InitiativeStoresUpload />);

    fireEvent.click(screen.getByTestId('confirm-stores-button'));

    await waitFor(() => {
      expect(updateMerchantPointOfSalesMock).toHaveBeenCalledWith('merchant-1', []);
    });
  });
});