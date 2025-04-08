import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { ErrorMessages } from '../utils/errorMessages';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

export const jwtService = {
  async generateToken(barberIdArg: string, isOwner: boolean): Promise<string> {
    const payload: JWTPayload = {
      sub: barberIdArg, barberId: barberIdArg, isOwner,
      role: isOwner ? 'owner' : 'barber', iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60),
    };

    const token = await new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).setIssuedAt()
                                            .setExpirationTime('12h').sign(JWT_SECRET);
      
    return token;
  },

  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload;
    } catch {
      throw new Error(ErrorMessages.AUTH.INVALID_TOKEN);
    }
  },

}; 