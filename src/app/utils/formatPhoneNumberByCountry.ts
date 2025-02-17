import { ErrorMessages } from './errorMessages';

type CountryCode = 'PT' | 'ES' | 'FR' | 'DE' | 'IT' | 'UK';

export function formatPhoneNumber(phone: string, country: CountryCode): string {
  // Remove any non-digit characters except '+'
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // If already has international format, return as is
  if (cleanPhone.startsWith('+')) return cleanPhone;

  // Remove leading zeros
  const numberWithoutZeros = cleanPhone.replace(/^0+/, '');

  switch (country) {
    case 'PT':
      return `+351${numberWithoutZeros}`;
    case 'ES':
      return `+34${numberWithoutZeros}`;
    case 'FR':
      return `+33${numberWithoutZeros}`;
    case 'DE':
      return `+49${numberWithoutZeros}`;
    case 'IT':
      return `+39${numberWithoutZeros}`;
    case 'UK':
      return `+44${numberWithoutZeros}`;
    default:
      throw new Error(ErrorMessages.FORM.COUNTRY_CODE_NOT_SUPPORTED);
  }
}
