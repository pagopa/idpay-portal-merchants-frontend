import { useState, useCallback } from 'react';
import { putMerchantOnboardingRequest } from '../services/merchantService';

export type InitiativeForOnboarding = {
  initiativeId: string;
  initiativeName: string;
  /** Optional description shown in the confirmation modal body */
  description?: string;
};

export type OnboardingAlertState = {
  open: boolean;
  severity: 'success' | 'error';
  titleKey: string;
  messageKey: string;
  initiativeName?: string;
};

const INITIAL_ALERT_STATE: OnboardingAlertState = {
  open: false,
  severity: 'success',
  titleKey: '',
  messageKey: '',
};

export type UseInitiativeOnboardingResult = {
  /** Whether the confirmation modal is open */
  modalOpen: boolean;
  /** The initiative currently selected for onboarding */
  selectedInitiative: InitiativeForOnboarding | null;
  /** Whether the onboarding API call is in progress */
  isOnboardingLoading: boolean;
  /** State for the success/error alert after onboarding */
  onboardingAlertState: OnboardingAlertState;
  /** Call this with an initiative to open the confirmation modal */
  openOnboardingModal: (initiative: InitiativeForOnboarding) => void;
  /** Close the confirmation modal without confirming */
  closeOnboardingModal: () => void;
  /** Confirm the onboarding – triggers the API call */
  confirmOnboarding: () => Promise<void>;
  /** Dismiss the success/error alert */
  closeOnboardingAlert: () => void;
};

/**
 * Manages the full "aderire a un'iniziativa" flow:
 * - opens/closes the confirmation modal
 * - calls the onboarding API on confirm
 * - exposes alert state for success/error feedback
 *
 * @param onSuccess - optional callback invoked with the initiativeId after a successful onboarding
 */
export const useInitiativeOnboarding = (
  onSuccess?: (initiativeId: string) => void
): UseInitiativeOnboardingResult => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<InitiativeForOnboarding | null>(
    null
  );
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);
  const [onboardingAlertState, setOnboardingAlertState] =
    useState<OnboardingAlertState>(INITIAL_ALERT_STATE);

  const openOnboardingModal = useCallback((initiative: InitiativeForOnboarding) => {
    setSelectedInitiative(initiative);
    setModalOpen(true);
  }, []);

  const closeOnboardingModal = useCallback(() => {
    setModalOpen(false);
    // keep selectedInitiative until after the transition animation
    setTimeout(() => setSelectedInitiative(null), 300);
  }, []);

  const confirmOnboarding = useCallback(async () => {
    if (!selectedInitiative) {
      return;
    }

    setIsOnboardingLoading(true);
    try {
      await putMerchantOnboardingRequest(selectedInitiative.initiativeId);
      closeOnboardingModal();
      setOnboardingAlertState({
        open: true,
        severity: 'success',
        titleKey: 'pages.initiativesList.onboarding.successTitle',
        messageKey: 'pages.initiativesList.onboarding.successMessage',
        initiativeName: selectedInitiative.initiativeName,
      });
      onSuccess?.(selectedInitiative.initiativeId);
    } catch {
      closeOnboardingModal();
      setOnboardingAlertState({
        open: true,
        severity: 'error',
        titleKey: 'pages.initiativesList.onboarding.errorTitle',
        messageKey: 'pages.initiativesList.onboarding.errorMessage',
      });
    } finally {
      setIsOnboardingLoading(false);
    }
  }, [selectedInitiative, closeOnboardingModal, onSuccess]);

  const closeOnboardingAlert = useCallback(() => {
    setOnboardingAlertState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    modalOpen,
    selectedInitiative,
    isOnboardingLoading,
    onboardingAlertState,
    openOnboardingModal,
    closeOnboardingModal,
    confirmOnboarding,
    closeOnboardingAlert,
  };
};

export default useInitiativeOnboarding;

