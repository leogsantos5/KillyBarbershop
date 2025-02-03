import { NumVerifyResponse } from "../types/booking";

const API_KEY = process.env.NEXT_PUBLIC_NUMVERIFY_API_KEY;
const API_URL = 'https://apilayer.net/api/validate';

export async function validatePortuguesePhone(phone: string): Promise<boolean> {
  try { 
    const url = `${API_URL}?access_key=${API_KEY}&number=${phone}&country_code=PT&format=1`;
    
    const response = await fetch(url);
    const data: NumVerifyResponse = await response.json();

    return data.valid;
  } catch (error) {
    console.error('Phone validation error:', error);
    throw new Error('Failed to validate phone number');
  }
}