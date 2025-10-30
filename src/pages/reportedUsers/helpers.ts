/**
 * Formal validation of the Italian tax code (Codice Fiscale).
 * - Checks presence (not empty or only spaces)
 * - Cleans input by removing spaces and non-alphanumeric characters, then converts to uppercase
 * - Checks that the cleaned value is exactly 16 alphanumeric characters
 * - Checks that there is at least one letter and at least one number (not only letters or only numbers)
 */
export function isValidCF(cf: string): boolean {
  if (!cf || /^\s+$/.test(cf)) {
    return false;
  }

  const cleaned = String(cf)
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase();

  return /^[A-Za-z0-9]{16}$/.test(cleaned) && /[A-Za-z]/.test(cleaned) && /[0-9]/.test(cleaned);
}
