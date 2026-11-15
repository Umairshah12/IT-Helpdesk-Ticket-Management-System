import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  departmentId?: string | null;
}

export const tokenHelper = {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
      expiresIn: '15m',
    });
  },

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, ENV.JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  },

  generateRefreshToken(): { rawToken: string; tokenHash: string; expiresAt: Date } {
    const rawToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    return { rawToken, tokenHash, expiresAt };
  },

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  },
};

