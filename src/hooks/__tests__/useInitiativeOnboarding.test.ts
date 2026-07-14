import { act, renderHook } from '@testing-library/react-hooks';
import { useInitiativeOnboarding } from '../useInitiativeOnboarding';
import { putMerchantOnboardingRequest } from '../../services/merchantService';

jest.mock('../../services/merchantService', () => ({
  putMerchantOnboardingRequest: jest.fn(),
}));

const mockedPutMerchantOnboardingRequest = jest.mocked(putMerchantOnboardingRequest);

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
    expect(onSuccess).toHaveBeenCalledWith('initiative-1');
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
