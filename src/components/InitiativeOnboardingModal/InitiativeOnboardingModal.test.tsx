import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { screen } from '@testing-library/react';
import { renderWithContext } from '../../utils/__tests__/test-utils';
import InitiativeOnboardingModal from './InitiativeOnboardingModal';

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
          initiativeId: 'bonus-decoder',
          initiativeName: 'Bonus Decoder',
        }}
      />
    );

    expect(
      screen.getByText(
        'Bonus Decoder è un contributo pubblico del Ministero delle Imprese e del Made in Italy che permette ai consumatori di acquistare un decoder DVB-T2 (terrestre) o DVB-S2 (satellitare) con uno sconto diretto applicato dal rivenditore.'
      )
    ).toBeTruthy();
  });

  it('shows the dedicated message for Bonus Elettrodomestici', () => {
    renderWithContext(
      <InitiativeOnboardingModal
        {...defaultProps}
        initiative={{
          initiativeId: 'bonus-elettrodomestici',
          initiativeName: 'Bonus Elettrodomestici',
        }}
      />
    );

    expect(
      screen.getByText(
        'Bonus Elettrodomestici è il contributo, erogato dal Ministero delle Imprese e del Made in Italy, per incentivare la sostituzione di un elettrodomestico con un modello ad alta efficienza energetica e promuovere la sostenibilità e la transizione energetica ai sensi del Decreto del Ministro delle Imprese e del Made in Italy di concerto con il Ministero dell’Economia e delle Finanze 3 settembre 2025, ammesso alla registrazione dalla Corte dei conti in data 18 settembre 2025, al n. 1146.'
      )
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
