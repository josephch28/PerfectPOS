import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../security/AuthService';

const authService = new AuthService();

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = authService.verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }

  (req as any).user = decoded;
  next();
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'No tiene permisos para realizar esta acción' });
    }
    next();
  };
};
