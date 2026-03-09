import getStatus from '../useStatus';
import { theme } from '@pagopa/mui-italia';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';

describe('useStatus', () => {
  it('returns correct config for REWARDED', () => {
    const result = getStatus('REWARDED');
    expect(result).toEqual({
      color: '#E1F4E1',
      label: 'Rimborso richiesto',
      textColor: '#224021',
    });
  });

  it('returns correct config for CANCELLED', () => {
    const result = getStatus('CANCELLED');
    expect(result).toEqual({
      color: '#FFE0E0',
      label: 'Annullato',
      textColor: '#761F1F',
    });
  });

  it('returns correct config for REFUNDED', () => {
    const result = getStatus('REFUNDED');
    expect(result).toEqual({
      color: '#C4DCF5',
      label: 'Stornato',
      textColor: '#17324D',
    });
  });

  it('returns correct config for INVOICED', () => {
    const result = getStatus('INVOICED');
    expect(result).toEqual({
      color: '#E1F5FE',
      label: 'Preso in carico',
      textColor: '#215C76',
    });
  });

  it('returns correct config for CAPTURED', () => {
    const result = getStatus('CAPTURED');
    expect(result).toEqual({
      color: theme.palette.error.extraLight as string,
      label: 'Da rimborsare',
    });
  });

  it('returns correct config for AUTHORIZED', () => {
    const result = getStatus('AUTHORIZED');
    expect(result).toEqual({
      color: theme.palette.success.extraLight as string,
      label: 'Da autorizzare',
    });
  });

  it('returns correct config for CREATED', () => {
    const result = getStatus('CREATED');
    expect(result).toEqual({
      color: '#FFF5DA !important',
      textColor: '#614C15 !important',
      label: 'Da inviare',
    });
  });

  it('returns correct config for EVALUATING', () => {
    const result = getStatus('EVALUATING');
    expect(result).toEqual({
      color: '#EEEEEE',
      textColor: '#17324D !important',
      label: 'Preso in carico',
    });
  });

  it('returns correct config for APPROVED', () => {
    const result = getStatus('APPROVED');
    expect(result).toEqual({
      color: '#E1F4E1',
      textColor: '#224021',
      label: 'Rimborso approvato',
    });
  });

  it('returns correct config for APPROVING', () => {
    const result = getStatus('APPROVING');
    expect(result).toEqual({
      color: '#E1F5FE',
      textColor: '#215C76',
      label: 'In approvazione',
    });
  });

  it('returns correct config for SENT', () => {
    const result = getStatus('SENT');
    expect(result).toEqual({
      color: '#EEEEEE',
      textColor: '#224021',
      label: 'Inviato',
    });
  });

  it('returns default config for unknown status', () => {
    const result = getStatus('UNKNOWN_STATUS');
    expect(result).toEqual({
      color: theme.palette.action.disabled as string,
      label: MISSING_DATA_PLACEHOLDER,
    });
  });
});
