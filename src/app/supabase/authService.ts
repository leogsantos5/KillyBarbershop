import { barbersService } from './barbersService';
import { AuthResponse } from '../types/other';
import { ErrorMessages } from '../utils/errorMessages';
import { hashPassword } from '../utils/passwordUtils';

const OWNER_NAME = process.env.NEXT_PUBLIC_OWNER_NAME?.replace('_', ' ') || "Killy Ross";

export const authService = {
  async signIn(name: string, password: string): Promise<AuthResponse> {
    try {
      const { success, data: barber } = await barbersService.fetchBarber(name);
      if (!success || !barber) {
        return new AuthResponse(false, null, ErrorMessages.BARBER.FETCH_BARBER_FAILURE);
      }

      const hashedPassword = await hashPassword(password);
      if (barber.Password !== hashedPassword) {
        return new AuthResponse(false, null, ErrorMessages.AUTH.INVALID_CREDENTIALS);
      }

      sessionStorage.setItem('barberId', barber.Id);
      sessionStorage.setItem('isOwner', (name === OWNER_NAME).toString());
      return new AuthResponse(name === OWNER_NAME, barber.Id);
    } catch (err) {
      return new AuthResponse(false, null, (err as Error).message);
    }
  },

  async checkSession(): Promise<AuthResponse> {
    try {
      const barberId = sessionStorage.getItem('barberId');
      const isOwner = sessionStorage.getItem('isOwner') === 'true';

      if (!barberId) {
        return new AuthResponse(false, null, ErrorMessages.AUTH.INVALID_SESSION);
      }

      const { success, data: barber } = await barbersService.fetchBarberById(barberId);
      if (!success || !barber) {
        // Clear invalid session
        sessionStorage.removeItem('barberId');
        sessionStorage.removeItem('isOwner');
        return new AuthResponse(false, null, ErrorMessages.AUTH.BARBER_NOT_FOUND);
      }

      return new AuthResponse(isOwner, barber.Id);
    } catch (err) {
      return new AuthResponse(false, null, (err as Error).message);
    }
  },

  signOut(): void {
    sessionStorage.removeItem('barberId');
    sessionStorage.removeItem('isOwner');
  }
}; 