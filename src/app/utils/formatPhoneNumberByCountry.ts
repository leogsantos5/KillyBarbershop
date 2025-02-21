export function formatPhoneNumber(phone: string, country: string) : string | null {
  const cleanPhone = phone.replace(/\s/g, '');
  
  switch (country) {
    case 'PT':
      const ptRegex = /^(\+351|00351)?[1-9][0-9]{8}$/;
      if (!ptRegex.test(cleanPhone)) return null;
      return cleanPhone.startsWith('+351') ? cleanPhone : `+351${cleanPhone}`;
    // Add other countries as needed
    default:
      return null;
  }
}
