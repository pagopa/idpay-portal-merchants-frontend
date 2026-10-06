import { act, renderHook } from '@testing-library/react-hooks';
import { useInitiativeOnboarding } from '../useInitiativeOnboarding';
import { putMerchantOnboardingRequest } from '../../services/merchantService';
import { trackAnalyticsEvent } from '../../services/analyticsService';

jest.mock('../../services/merchantService', () => ({
  putMerchantOnboardingRequest: jest.fn(),
}));

jest.mock('../../services/analyticsService', () => ({
  MIXPANEL_EVENTS: {
    BONUS_ACCEPTANCE_SUCCESS: 'IDPAY_BONUS_ACCEPTANCE_UX_SUCCESS',
    BONUS_ACCEPTANCE_DENIED: 'IDPAY_BONUS_ACCEPTANCE_UX_DENIED',
  },
  trackAnalyticsEvent: jest.fn(),
}));

const mockedPutMerchantOnboardingRequest = jest.mocked(putMerchantOnboardingRequest);
const mockedTrackAnalyticsEvent = jest.mocked(trackAnalyticsEvent);

describe('useInitiativeOnboarding', () => {
  const initiative = {
    initiativeId: 'initiative-1',
    initiativeName: 'Bonus Test',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('does nothing when confirmOnboarding is called without a selected initiative', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useInitiativeOnboarding(onSuccess));

    await act(async () => {
      await result.current.confirmOnboarding();
    });

    expect(mockedPutMerchantOnboardingRequest).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.isOnboardingLoading).toBe(false);
    expect(result.current.onboardingAlertState.open).toBe(false);
  });

  it('sets success alert and invokes onSuccess after a successful onboarding', async () => {
    const onSuccess = jest.fn();
    mockedPutMerchantOnboardingRequest.mockResolvedValue({ status: 'APPROVED' } as never);

    const { result } = renderHook(() => useInitiativeOnboarding(onSuccess));

    act(() => {
      result.current.openOnboardingModal(initiative);
    });

    await act(async () => {
      await result.current.confirmOnboarding();
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockedPutMerchantOnboardingRequest).toHaveBeenCalledWith('initiative-1');
    expect(result.current.modalOpen).toBe(false);
    expect(result.current.selectedInitiative).toBeNull();
    expect(result.current.isOnboardingLoading).toBe(false);
    expect(result.current.onboardingAlertState).toEqual({
      open: true,
      severity: 'success',
      titleKey: 'pages.initiativesList.onboarding.successTitle',
      messageKey: 'pages.initiativesList.onboarding.successMessage',
      initiativeName: 'Bonus Test',
    });
    expect(mockedTrackAnalyticsEvent).toHaveBeenCalledWith('IDPAY_BONUS_ACCEPTANCE_UX_SUCCESS');
    expect(onSuccess).toHaveBeenCalledWith('initiative-1');
  });

  it('sets error alert and tracks denied onboarding when the request fails', async () => {
    mockedPutMerchantOnboardingRequest.mockRejectedValue(new Error('denied'));

    const { result } = renderHook(() => useInitiativeOnboarding());

    act(() => {
      result.current.openOnboardingModal(initiative);
    });

    await act(async () => {
      await result.current.confirmOnboarding();
    });

    expect(result.current.onboardingAlertState).toEqual({
      open: true,
      severity: 'error',
      titleKey: 'pages.initiativesList.onboarding.errorTitle',
      messageKey: 'pages.initiativesList.onboarding.errorMessage',
    });
    expect(mockedTrackAnalyticsEvent).toHaveBeenCalledWith('IDPAY_BONUS_ACCEPTANCE_UX_DENIED');
  });

  it('closes the onboarding alert preserving its other properties', async () => {
    mockedPutMerchantOnboardingRequest.mockResolvedValue({ status: 'APPROVED' } as never);

    const { result } = renderHook(() => useInitiativeOnboarding());

    act(() => {
      result.current.openOnboardingModal(initiative);
    });

    await act(async () => {
      await result.current.confirmOnboarding();
    });

    act(() => {
      result.current.closeOnboardingAlert();
    });

    expect(result.current.onboardingAlertState).toEqual({
      open: false,
      severity: 'success',
      titleKey: 'pages.initiativesList.onboarding.successTitle',
      messageKey: 'pages.initiativesList.onboarding.successMessage',
      initiativeName: 'Bonus Test',
    });
  });
});
