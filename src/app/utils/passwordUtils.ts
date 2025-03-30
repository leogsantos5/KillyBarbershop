import { createHash } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  return createHash('sha256').update(password).digest('hex');
}

export function validatePassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
} 