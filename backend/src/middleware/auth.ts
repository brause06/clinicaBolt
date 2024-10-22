import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/roles';
import logger from '../utils/logger';

interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
export const auth = (req: Request, res: Response, next: NextFunction) => {
  logger.info('Iniciando middleware de autenticación');
  const authHeader = req.headers['authorization'];
  logger.info('Cabecera de autorización:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    logger.error('No se proporcionó token');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      logger.error('Error al verificar el token:', err);
      return res.sendStatus(403);
    }
    logger.log('Usuario autenticado:', user);
    req.user = user;
    next();
  });
};

export const roleAuth = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.info('Iniciando middleware de autorización de rol');
    logger.info('Roles permitidos:', roles);
    logger.info('Rol del usuario:', req.user?.role);
    if (!req.user || !roles.includes(req.user.role)) {
      logger.error('Usuario no autorizado');
      return res.sendStatus(403);
    }
    logger.info('Usuario autorizado');
    next();
  };
};
