/** Uppercases the first letter and leaves the rest as typed (French capitalisation, not Title Case). */
export const capitalizeFirst = (text: string): string => text.charAt(0).toLocaleUpperCase('fr') + text.slice(1);

const pairs = (digits: string): string => digits.replace(/(\d{2})(?=\d)/g, '$1 ');

/**
 * Phone number with spaces only, whatever the input separators: `0612345678`, `06.12.34.56.78` and `06-12-34-56-78`
 * all become `06 12 34 56 78`; `+33612345678` becomes `+33 6 12 34 56 78`. Other shapes just get single spaces.
 */
export function formatPhone(phone: string): string {
  const compact = phone.replace(/[\s.-]/g, '');
  const international = /^\+33(\d)(\d{8})$/.exec(compact);
  if (international?.[1] !== undefined && international[2] !== undefined) {
    return `+33 ${international[1]} ${pairs(international[2])}`;
  }
  if (/^0\d{9}$/.test(compact)) {
    return pairs(compact);
  }
  return phone.replace(/[.-]/g, ' ').replace(/\s+/g, ' ').trim();
}
