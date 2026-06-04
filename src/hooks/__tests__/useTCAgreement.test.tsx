import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/lib/hooks/useErrorDispatcher';
import { useTranslation } from 'react-i18next';
import { getPortalConsent, savePortalConsent } from '../../services/rolePermissionService';
import useTCAgreement from '../useTCAgreement';
import { useAppSelector } from '../../redux/hooks';
const mockCommonHooks = () => {
  const mockAddError = jest.fn();

  (useAppSelector as jest.Mock).mockReturnValue([
    { initiativeId: 'initiative-1' },
  ]);

  (useErrorDispatcher as jest.Mock).mockReturnValue(mockAddError);

  (useTranslation as jest.Mock).mockReturnValue({
    t: (key: string) => key,
  });

  return { mockAddError };
};

jest.mock('../../services/rolePermissionService', () => ({
  getPortalConsent: jest.fn(),
  savePortalConsent: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/lib/hooks/useErrorDispatcher');
jest.mock('react-i18next');

const mockedGetPortalConsent = getPortalConsent as jest.Mock;
const mockedSavePortalConsent = savePortalConsent as jest.Mock;
const mockedUseErrorDispatcher = useErrorDispatcher as jest.Mock;
const mockedUseTranslation = useTranslation as jest.Mock;

jest.mock('../useCurrentInitiativeId', () => ({
  useCurrentInitiativeId: () => 'initiative-1',
}));

jest.mock('../../redux/slices/initiativesSlice', () => ({
  setInitiativesList: jest.fn(),
  intiativesListSelector: jest.fn(),
  initiativesReducer: jest.fn(), 
}));

jest.mock('../../redux/hooks', () => ({
  useAppSelector: jest.fn(),
}));

describe('useTCAgreement', () => {
  let mockAddError: jest.Mock;

  const setupHook = (
    consentResponse: any,
    saveError?: Error
  ) => {
    if (consentResponse instanceof Error) {
      mockedGetPortalConsent.mockRejectedValue(consentResponse);
    } else {
      mockedGetPortalConsent.mockResolvedValue(consentResponse);
    }

    if (saveError) {
      mockedSavePortalConsent.mockRejectedValue(saveError);
    } else {
      // default success behavior for acceptTOS
      mockedSavePortalConsent.mockResolvedValue(undefined);
    }

    return renderHook(() => useTCAgreement());
  };

  beforeEach(() => {
    jest.clearAllMocks();
    const mocks = mockCommonHooks();
    mockAddError = mocks.mockAddError;
  });

  it('sets isTOSAccepted to false when pending consents exist', async () => {
    const consentData = { versionId: 'v1.2.3', firstAcceptance: true };
    const { result } = setupHook(consentData);

    await waitFor(() => {
      expect(result.current.isTOSAccepted).toBe(false);
      expect(result.current.firstAcceptance).toBe(true);
    });

    expect(mockedGetPortalConsent).toHaveBeenCalledTimes(1);
  });

  it('sets isTOSAccepted to true when no pending consents exist', async () => {
    const { result } = setupHook({});

    await waitFor(() => {
      expect(result.current.isTOSAccepted).toBe(true);
    });
  });

  it('dispatches error if getPortalConsent fails', async () => {
    const error = new Error('API Error');
    const { result } = setupHook(error);

    await waitFor(() => {
      expect(result.current.isTOSAccepted).toBe(false);
      expect(mockAddError).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'GET_TERMS_AND_CONDITION_ACCEPTANCE',
          error,
        })
      );
    });
  });

  it('calls savePortalConsent and updates state on success', async () => {
    const consentData = { versionId: 'v2.0.0', firstAcceptance: false };
    const { result } = setupHook(consentData);

    await waitFor(() =>
      expect(result.current.isTOSAccepted).toBe(false)
    );

    await act(async () => {
      result.current.acceptTOS();
    });

    expect(mockedSavePortalConsent).toHaveBeenCalledWith(
      consentData.versionId
    );

    await waitFor(() =>
      expect(result.current.isTOSAccepted).toBe(true)
    );

    expect(mockAddError).not.toHaveBeenCalled();
  });

  it('dispatches error if savePortalConsent fails', async () => {
    const consentData = { versionId: 'v3.0.0', firstAcceptance: true };
    const error = new Error('Save failed');

    const { result } = setupHook(consentData, error);

    await waitFor(() =>
      expect(result.current.isTOSAccepted).toBe(false)
    );

    await act(async () => {
      result.current.acceptTOS();
    });

    expect(mockedSavePortalConsent).toHaveBeenCalledWith(
      consentData.versionId
    );

    await waitFor(() => {
      expect(result.current.isTOSAccepted).toBe(false);
      expect(mockAddError).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'SAVE_TERMS_AND_CONDITION_ACCEPTANCE',
          error,
        })
      );
    });
  });
});
