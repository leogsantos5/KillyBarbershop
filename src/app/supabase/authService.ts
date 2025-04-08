import { barbersService } from './barbersService';
import { ErrorMessages } from '../utils/errorMessages';
import { hashPassword } from '../utils/passwordUtils';
import { jwtService } from './jwtService';
import supabase from '../services/supabaseClient';

const OWNER_NAME = process.env.NEXT_PUBLIC_OWNER_NAME?.replace('_', ' ') || "Killy Ross";

export const authService = {
  async signIn(name: string, password: string): Promise<string | null> {
    try {
      const { success, data: barber } = await barbersService.fetchBarber(name);
      if (!success || !barber) {
        return ErrorMessages.BARBER.FETCH_BARBER_FAILURE;
      }

      const hashedPassword = await hashPassword(password);
      if (barber.Password !== hashedPassword) {
        return ErrorMessages.AUTH.INVALID_CREDENTIALS;
      }

      const isOwner = name === OWNER_NAME;
      const token = await jwtService.generateToken(barber.Id, isOwner);

      // Store token and update Supabase client
      sessionStorage.setItem('authToken', token);
      supabase.realtime.setAuth(token);
      
      return null; // No error means success
    } catch (err) {
      return (err as Error).message;
    }
  },

  async checkSession(): Promise<string | null> {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        return ErrorMessages.AUTH.INVALID_SESSION;
      }

      await jwtService.verifyToken(token);
      // Update Supabase client with current token
      supabase.realtime.setAuth(token);
      return null; // No error means valid session
    } catch (err) {
      sessionStorage.removeItem('authToken');
      return (err as Error).message;
    }
  },

  signOut(): void {
    sessionStorage.removeItem('authToken');
    supabase.realtime.setAuth(null);
  }
}; 