// @ts-nocheck
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { storageTokenOps } from '@pagopa/selfcare-common-frontend/lib/utils/storage';
import { useHistory, useParams } from 'react-router-dom';
import InitiativeStoresUpload from '../initiativeStoresUpload';
import * as merchantService from '../../../services/merchantService';
import * as jwtUtils from '../../../utils/jwt-utils';
import * as formatUtils from '../../../utils/formatUtils';

const mockSetAlert = jest.fn();
const pushMock = jest.fn();
let mockLatestFormProps: any;

jest.mock('../../../hooks/useScopedTranslation', () => () => ({
  t: (key: string) => key,
}));

jest.mock('../../../hooks/useAlert', () => ({
  useAlert: () => ({ setAlert: mockSetAlert }),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/utils/storage', () => ({
  storageTokenOps: { read: jest.fn() },
}));

jest.mock('../../../services/merchantService', () => ({
  updateMerchantPointOfSales: jest.fn(),
}));

jest.mock('../../../utils/jwt-utils');

jest.mock('../../../utils/formatUtils', () => ({
  normalizeUrlHttp: jest.fn((value) => `http:${value}`),
  normalizeUrlHttps: jest.fn((value) => `https:${value}`),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('../../../components/pointsOfSaleForm/PointsOfSaleForm', () => (props: any) => {
  mockLatestFormProps = props;

  return (
    <div data-testid="points-of-sale-form">
      <button
        data-testid="set-valid-form"
        onClick={() => {
          props.onFormChange([
            {
              id: 'local-id',
              type: 'PHYSICAL',
              contactEmail: 'shop@example.com',
              confirmContactEmail: 'shop@example.com',
              website: 'example.com',
              channelGeolink: 'maps.example.com',
            },
          ]);
          props.onValidationChange(true);
        }}
      >
        valid
      </button>
      <button
        data-testid="set-invalid-form"
        onClick={() => {
          props.onFormChange([]);
          props.onValidationChange(false);
        }}
      >
        invalid
      </button>
      <button
        data-testid="set-duplicate-emails"
        onClick={() => {
          props.onFormChange([
            {
              contactEmail: ' DUPLICATE@example.com ',
              confirmContactEmail: 'duplicate@example.com',
            },
            {
              contactEmail: 'duplicate@example.com',
              confirmContactEmail: 'duplicate@example.com',
            },
          ]);
          props.onValidationChange(true);
        }}
      >
        duplicates
      </button>
    </div>
  );
});

const readTokenMock = storageTokenOps.read as jest.Mock;
const parseJwtMock = jwtUtils.parseJwt as jest.Mock;
const updateMerchantPointOfSalesMock = merchantService.updateMerchantPointOfSales as jest.Mock;
const normalizeUrlHttpMock = formatUtils.normalizeUrlHttp as jest.Mock;
const normalizeUrlHttpsMock = formatUtils.normalizeUrlHttps as jest.Mock;

const renderComponent = () => render(<InitiativeStoresUpload />);

const submitValidForm = async () => {
  fireEvent.click(screen.getByTestId('set-valid-form'));
  fireEvent.click(screen.getByTestId('confirm-stores-button'));
  await waitFor(() => expect(updateMerchantPointOfSalesMock).toHaveBeenCalled());
};

describe('InitiativeStoresUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLatestFormProps = undefined;
    (useParams as jest.Mock).mockReturnValue({ initiative_id: 'test-initiative' });
    (useHistory as jest.Mock).mockReturnValue({ push: pushMock });
    readTokenMock.mockReturnValue('fake-token');
    parseJwtMock.mockReturnValue({ merchant_id: 'merchant-1' });
    updateMerchantPointOfSalesMock.mockResolvedValue(undefined);
    normalizeUrlHttpMock.mockImplementation((value) => `http:${value}`);
    normalizeUrlHttpsMock.mockImplementation((value) => `https:${value}`);
    jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the manual form and opens the operation manual', () => {
    renderComponent();

    expect(screen.getByTestId('points-of-sale-form')).toBeInTheDocument();
    fireEvent.click(screen.getByText('pages.initiativeStores.manualLink'));

    expect(window.open).toHaveBeenCalledWith(expect.any(String), '_blank');
  });

  it('navigates back to the initiative overview', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('back-stores-button'));

    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining('/portale-esercenti/test-initiative/panoramica')
    );
  });

  it('does not submit an invalid form and increments the submit attempt', async () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('set-invalid-form'));

    fireEvent.click(screen.getByTestId('confirm-stores-button'));

    await waitFor(() => expect(mockLatestFormProps.submitAttempt).toBe(1));
    expect(updateMerchantPointOfSalesMock).not.toHaveBeenCalled();
  });

  it('does not submit when duplicate emails are present', async () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('set-duplicate-emails'));

    await waitFor(() =>
      expect(mockLatestFormProps.externalErrors).toEqual({
        1: {
          contactEmail: expect.any(String),
          confirmContactEmail: expect.any(String),
        },
      })
    );
    fireEvent.click(screen.getByTestId('confirm-stores-button'));

    await waitFor(() => expect(mockLatestFormProps.submitAttempt).toBe(1));
    expect(updateMerchantPointOfSalesMock).not.toHaveBeenCalled();
  });

  it('shows a generic error when the merchant ID is missing', async () => {
    parseJwtMock.mockReturnValue(undefined);
    renderComponent();
    fireEvent.click(screen.getByTestId('set-valid-form'));

    fireEvent.click(screen.getByTestId('confirm-stores-button'));

    await waitFor(() =>
      expect(mockSetAlert).toHaveBeenCalledWith({
        title: 'errors.genericTitle',
        text: 'errors.genericDescription',
        isOpen: true,
        severity: 'error',
      })
    );
    expect(updateMerchantPointOfSalesMock).not.toHaveBeenCalled();
  });

  it('normalizes the payload and navigates to stores after a successful update', async () => {
    renderComponent();

    await submitValidForm();

    expect(normalizeUrlHttpsMock).toHaveBeenCalledWith('example.com');
    expect(normalizeUrlHttpMock).toHaveBeenCalledWith('maps.example.com');
    expect(updateMerchantPointOfSalesMock).toHaveBeenCalledWith(
      'test-initiative',
      'merchant-1',
      [
        {
          type: 'PHYSICAL',
          contactEmail: 'shop@example.com',
          website: 'https:example.com',
          channelGeolink: 'http:maps.example.com',
        },
      ]
    );
    expect(pushMock).toHaveBeenCalledWith({
      pathname: expect.stringContaining('/portale-esercenti/test-initiative/punti-vendita'),
      state: { showSuccessAlert: true },
    });
    expect(mockLatestFormProps.pointsOfSaleLoaded).toBe(true);
  });

  it('resets the loaded flag when the form changes after a successful update', async () => {
    renderComponent();
    await submitValidForm();
    expect(mockLatestFormProps.pointsOfSaleLoaded).toBe(true);

    fireEvent.click(screen.getByTestId('set-invalid-form'));

    await waitFor(() => expect(mockLatestFormProps.pointsOfSaleLoaded).toBe(false));
  });

  it('shows the duplicate point-of-sale error returned by the API', async () => {
    updateMerchantPointOfSalesMock.mockResolvedValue({
      code: 'POINT_OF_SALE_ALREADY_REGISTERED',
      message: 'shop@example.com',
    });
    renderComponent();

    await submitValidForm();

    expect(mockSetAlert).toHaveBeenCalledWith({
      title: 'errors.duplicateEmailError',
      text: expect.stringContaining('shop@example.com'),
      isOpen: true,
      severity: 'error',
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('shows a generic error for an unrecognized API response', async () => {
    updateMerchantPointOfSalesMock.mockResolvedValue({
      code: 'UNKNOWN_ERROR',
      message: 'Unexpected error',
    });
    renderComponent();

    await submitValidForm();

    expect(mockSetAlert).toHaveBeenCalledWith({
      title: 'errors.genericTitle',
      text: 'errors.genericDescription',
      isOpen: true,
      severity: 'error',
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
