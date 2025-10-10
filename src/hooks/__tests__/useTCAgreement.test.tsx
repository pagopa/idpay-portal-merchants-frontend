import { renderHook, act } from '@testing-library/react-hooks';
import { waitFor } from '@testing-library/react';
import useErrorDispatcher from '@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher';
import { useTranslation } from 'react-i18next';
import { getPortalConsent, savePortalConsent } from '../../services/rolePermissionService';
import useTCAgreement from '../useTCAgreement';

jest.mock('../../services/rolePermissionService', () => ({
  getPortalConsent: jest.fn(),
  savePortalConsent: jest.fn(),
}));

jest.mock('@pagopa/selfcare-common-frontend/hooks/useErrorDispatcher');
jest.mock('react-i18next');

const mockedGetPortalConsent = getPortalConsent as jest.Mock;
const mockedSavePortalConsent = savePortalConsent as jest.Mock;
const mockedUseErrorDispatcher = useErrorDispatcher as jest.Mock;
const mockedUseTranslation = useTranslation as jest.Mock;

describe('useTCAgreement', () => {
  const mockAddError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseErrorDispatcher.mockReturnValue(mockAddError);
    mockedUseTranslation.mockReturnValue({ t: (key: string) => key });
  });

  test('should set isTOSAccepted to false if there are pending consents', async () => {
    const consentData = { versionId: 'v1.2.3', firstAcceptance: true };
    mockedGetPortalConsent.mockResolvedValue(consentData);

    const { result } = renderHook(() => useTCAgreement());

    await waitFor(() => {
      expect(result.current.isTOSAccepted).toBe(false);
      expect(result.current.firstAcceptance).toBe(true);
    });
    expect(mockedGetPortalConsent).toHaveBeenCalledTimes(1);
  });

  test('should set isTOSAccepted to true if there are no pending consents', async () => {
    mockedGetPortalConsent.mockResolvedValue({});

    const { result } = renderHook(() => useTCAgreement());

    await waitFor(() => {
      expect(result.current.isTOSAccepted).toBe(true);
    });
  });

  test('should call addError and set isTOSAccepted to false if getPortalConsent fails', async () => {
    const error = new Error('API Error');
    mockedGetPortalConsent.mockRejectedValue(error);

    const { result } = renderHook(() => useTCAgreement());

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

  test('should call savePortalConsent and update state on acceptTOS success', async () => {
    const consentData = { versionId: 'v2.0.0', firstAcceptance: false };
    mockedGetPortalConsent.mockResolvedValue(consentData);
    mockedSavePortalConsent.mockResolvedValue(undefined);

    const { result } = renderHook(() => useTCAgreement());

    await waitFor(() => {
      expect(result.current.isTOSAccepted).toBe(false);
    });

    await act(async () => {
      result.current.acceptTOS();
    });

    expect(mockedSavePortalConsent).toHaveBeenCalledWith(consentData.versionId);
    await waitFor(() => {
      expect(result.current.isTOSAccepted).toBe(true);
    });
    expect(mockAddError).not.toHaveBeenCalled();
  });

  test('should call addError if savePortalConsent fails', async () => {
    const consentData = { versionId: 'v3.0.0', firstAcceptance: true };
    const error = new Error('Save failed');
    mockedGetPortalConsent.mockResolvedValue(consentData);
    mockedSavePortalConsent.mockRejectedValue(error);

    const { result } = renderHook(() => useTCAgreement());

    await waitFor(() => {
      expect(result.current.isTOSAccepted).toBe(false);
    });

    await act(async () => {
      result.current.acceptTOS();
    });

    expect(mockedSavePortalConsent).toHaveBeenCalledWith(consentData.versionId);
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
