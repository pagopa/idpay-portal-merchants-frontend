import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { screen } from '@testing-library/react';
import bonusDecoder2026Copy from '../../locale/it/bonusDecoder2026/copy.json';
import bonusElettrodomestici2025Copy from '../../locale/it/bonusElettrodomestici2025/copy.json';
import { renderWithContext } from '../../utils/__tests__/test-utils';
import InitiativeOnboardingModal from './InitiativeOnboardingModal';

jest.mock('../../locale/initiativeResources', () => ({
  getInitiativeResourceFolder: (initiativeId: string) => {
    if (initiativeId === 'configured-decoder-id') {
      return 'bonusDecoder2026';
    }
    if (initiativeId === 'configured-appliances-id') {
      return 'bonusElettrodomestici2025';
    }
    return undefined;
  },
}));

describe('InitiativeOnboardingModal', () => {
  const defaultProps = {
    open: true,
    isLoading: false,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the dedicated message for Bonus Decoder', () => {
    renderWithContext(
      <InitiativeOnboardingModal
        {...defaultProps}
        initiative={{
          initiativeId: 'configured-decoder-id',
          initiativeName: 'Nome modificato',
        }}
      />
    );

    expect(
      screen.getByText(bonusDecoder2026Copy.pages.initiativesList.onboardingModal.description)
    ).toBeTruthy();
  });

  it('shows the dedicated message for Bonus Elettrodomestici', () => {
    renderWithContext(
      <InitiativeOnboardingModal
        {...defaultProps}
        initiative={{
          initiativeId: 'configured-appliances-id',
          initiativeName: 'Nome modificato',
        }}
      />
    );

    expect(
      screen.getByText(bonusElettrodomestici2025Copy.pages.initiativeOverview.info.description)
    ).toBeTruthy();
  });

  it('falls back to initiative description for other initiatives', () => {
    renderWithContext(
      <InitiativeOnboardingModal
        {...defaultProps}
        initiative={{
          initiativeId: 'bonus-prova',
          initiativeName: 'Bonus Prova',
          description: 'Descrizione generica di test',
        }}
      />
    );

    expect(screen.getByText('Descrizione generica di test')).toBeTruthy();
  });
});
