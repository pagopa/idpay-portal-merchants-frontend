import getStatus from '../useStatus';
import { MISSING_DATA_PLACEHOLDER } from '../../../utils/constants';

describe('useStatus - FULL SWITCH COVERAGE', () => {
  it('covers REWARDED', () => {
    const result = getStatus('REWARDED');
    expect(result.label).toBe('Rimborso richiesto');
  });

  it('covers CANCELLED', () => {
    const result = getStatus('CANCELLED');
    expect(result.label).toBe('Annullato');
  });

  it('covers REFUNDED', () => {
    const result = getStatus('REFUNDED');
    expect(result.label).toBe('Stornato');
  });

  it('covers INVOICED', () => {
    const result = getStatus('INVOICED');
    expect(result.label).toBe('Preso in carico');
  });

  it('covers CAPTURED', () => {
    const result = getStatus('CAPTURED');
    expect(result.label).toBe('Da rimborsare');
  });

  it('covers AUTHORIZED', () => {
    const result = getStatus('AUTHORIZED');
    expect(result.label).toBe('Da autorizzare');
  });

  it('covers CREATED', () => {
    const result = getStatus('CREATED');
    expect(result.label).toBe('Da inviare');
  });

  it('covers EVALUATING', () => {
    const result = getStatus('EVALUATING');
    expect(result.label).toBe('Preso in carico');
  });

  it('covers APPROVED', () => {
    const result = getStatus('APPROVED');
    expect(result.label).toBe('Rimborso approvato');
  });

  it('covers APPROVING', () => {
    const result = getStatus('APPROVING');
    expect(result.label).toBe('In approvazione');
  });

  it('covers SENT', () => {
    const result = getStatus('SENT');
    expect(result.label).toBe('Inviato');
  });

  it('covers DEFAULT branch', () => {
    const result = getStatus('UNKNOWN_STATUS');
    expect(result.label).toBe(MISSING_DATA_PLACEHOLDER);
  });
});
