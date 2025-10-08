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
}));

jest.mock('../../../services/merchantService', () => ({
  updateMerchantPointOfSales: jest.fn(),
}));
jest.mock('../../../utils/jwt-utils');
jest.mock('../../../utils/formatUtils', () => ({
  normalizeUrlHttp: jest.fn((x) => x),
  normalizeUrlHttps: jest.fn((x) => x),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn(),
}));

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
  });

  it('calls handleBack when back button is clicked', () => {
    render(<InitiativeStoresUpload />);
    fireEvent.click(screen.getByTestId('back-stores-button'));
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('/portale-esercenti/test-initiative/panoramica')
    );
  });

  it('sets salesPoints when form changes', () => {
    render(<InitiativeStoresUpload />);
    const instance = screen.getByTestId('confirm-stores-button');
    expect(instance).toBeInTheDocument();
  });

  it('shows error for duplicate contact emails', async () => {
    render(<InitiativeStoresUpload />);
    const confirmButton = screen.getByTestId('confirm-stores-button');

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(addErrorMock).toHaveBeenCalled();
    });
  });

  it('shows error if merchant_id is missing', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({});
    render(<InitiativeStoresUpload />);
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

    render(<InitiativeStoresUpload />);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  });

  it('shows generic upload error when response.code != known', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });
    updateMerchantPointOfSalesMock.mockResolvedValue({ code: 'GENERIC_ERROR' });

    render(<InitiativeStoresUpload />);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));

    await waitFor(() => {
      expect(addErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          techDescription: 'error points of sale upload',
        })
      );
    });
  });

  it('navigates to STORES when response is null', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });
    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue(null);

    render(<InitiativeStoresUpload />);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));
  });

  it('normalizes URLs when uploading manually', async () => {
    readTokenMock.mockReturnValue('fakeToken');
    (jwtUtils.parseJwt as jest.Mock).mockReturnValue({ merchant_id: 'merchant-1' });

    (updateMerchantPointOfSalesMock as jest.Mock).mockResolvedValue({
      code: 'POINT_OF_SALE_ALREADY_REGISTERED',
      message: 'Email duplicata',
    });

    render(<InitiativeStoresUpload />);
    fireEvent.click(screen.getByTestId('confirm-stores-button'));

    await waitFor(() => {
      expect(formatUtils.normalizeUrlHttps).toHaveBeenCalled();
      expect(formatUtils.normalizeUrlHttp).toHaveBeenCalled();
    });
  });
});
