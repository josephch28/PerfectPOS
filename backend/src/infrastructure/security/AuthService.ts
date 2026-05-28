import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  private secret = process.env.JWT_SECRET || 'super-secret-key';

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload: any): string {
    return jwt.sign(payload, this.secret, { expiresIn: '8h' });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      return null;
    }
  }
}
