import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/roles';

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
  console.log('Iniciando middleware de autenticación');
  const authHeader = req.headers['authorization'];
  console.log('Cabecera de autorización:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('No se proporcionó token');
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      console.error('Error al verificar el token:', err);
      return res.sendStatus(403);
    }
    console.log('Usuario autenticado:', user);
    req.user = user;
    next();
  });
};

export const roleAuth = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('Iniciando middleware de autorización de rol');
    console.log('Roles permitidos:', roles);
    console.log('Rol del usuario:', req.user?.role);
    if (!req.user || !roles.includes(req.user.role)) {
      console.log('Usuario no autorizado');
      return res.sendStatus(403);
    }
    console.log('Usuario autorizado');
    next();
  };
};
