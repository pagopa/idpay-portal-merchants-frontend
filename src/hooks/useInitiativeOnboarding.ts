import { useState, useCallback } from 'react';
import { putMerchantOnboardingRequest } from '../services/merchantService';

export type InitiativeForOnboarding = {
  initiativeId: string;
  initiativeName: string;
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
  modalOpen: boolean;
  selectedInitiative: InitiativeForOnboarding | null;
  isOnboardingLoading: boolean;
  onboardingAlertState: OnboardingAlertState;
  openOnboardingModal: (initiative: InitiativeForOnboarding) => void;
  closeOnboardingModal: () => void;
  confirmOnboarding: () => Promise<void>;
  closeOnboardingAlert: () => void;
};

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

