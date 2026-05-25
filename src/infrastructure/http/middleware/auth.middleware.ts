import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      if (token === 'client-jwt-token') {
        (req as any).user = { id: 'client-1', role: 'CLIENT', departmentId: 'CLIENT-DEPT' };
      } else if (token === 'agent-ti-jwt-token') {
        (req as any).user = { id: 'agent-1', role: 'AGENT', departmentId: 'IT-DEPT' };
      } else if (token === 'agent-rh-jwt-token') {
        (req as any).user = { id: 'agent-2', role: 'AGENT', departmentId: 'RH-DEPT' };
      } else if (token === 'admin-jwt-token') {
        (req as any).user = { id: 'admin-1', role: 'ADMIN', departmentId: 'ADMIN-DEPT' };
      }
    }
    next();
  }
}
