const API_KEY = process.env.NUMVERIFY_API_KEY;
const API_URL = 'http://apilayer.net/api/validate';

export async function validatePortuguesePhone(phone: string): Promise<boolean> {
  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+351${phone.replace(/^0+/, '')}`;
    
    const url = `${API_URL}?access_key=${API_KEY}&number=${formattedPhone}&country_code=PT&format=1`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error('Failed to validate phone number');
    }

    return data.valid === true;
  } catch (error) {
    console.error('Phone validation error:', error);
    throw new Error('Failed to validate phone number');
  }
}