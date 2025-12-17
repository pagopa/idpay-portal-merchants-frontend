import { theme } from '@pagopa/mui-italia';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';
import getStatus from '../useStatus';

describe('getStatus', () => {
  it('should return correct configuration for REWARDED status', () => {
    const result = getStatus('REWARDED');
    expect(result).toEqual({
      color: '#E1F4E1',
      label: 'Rimborso richiesto',
      textColor: '#224021',
    });
  });

  it('should return correct configuration for CANCELLED status', () => {
    const result = getStatus('CANCELLED');
    expect(result).toEqual({
      color: '#FFE0E0',
      label: 'Annullato',
      textColor: '#761F1F',
    });
  });

  it('should return correct configuration for REFUNDED status', () => {
    const result = getStatus('REFUNDED');
    expect(result).toEqual({
      color: '#C4DCF5',
      label: 'Stornato',
      textColor: '#17324D',
    });
  });

  it('should return correct configuration for CAPTURED status', () => {
    const result = getStatus('CAPTURED');
    expect(result).toEqual({
      color: theme.palette.error.extraLight,
      label: 'Da rimborsare',
    });
  });

  it('should return correct configuration for AUTHORIZED status', () => {
    const result = getStatus('AUTHORIZED');
    expect(result).toEqual({
      color: theme.palette.success.extraLight,
      label: 'Da autorizzare',
    });
  });

  it('should return correct configuration for APPROVING status', () => {
    const result = getStatus('APPROVING');
    expect(result).toEqual({
      color: '#E1F5FE',
      label: 'In approvazione',
      textColor: '#215C76',
    });
  });

  it('should return MISSING_DATA_PLACEHOLDER configuration for an unknown status (default case)', () => {
    const result = getStatus('UNKNOWN_STATUS');
    expect(result).toEqual({
      color: theme.palette.action.disabled,
      label: MISSING_DATA_PLACEHOLDER,
    });
  });

  it('should return MISSING_DATA_PLACEHOLDER configuration for null or undefined input', () => {
    let result = getStatus(null);
    expect(result.label).toBe(MISSING_DATA_PLACEHOLDER);

    result = getStatus(undefined);
    expect(result.label).toBe(MISSING_DATA_PLACEHOLDER);
  });
});
