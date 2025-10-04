import { Request, Response, NextFunction } from 'express';

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userRole || !roles.includes(req.session.userRole)) {
      return res.status(403).json({ error: 'insufficient permissions' });
    }
    next();
  };
};

// specific role helpers
export const requireStudent = requireRole('student', 'teacher', 'admin');
export const requireTeacher = requireRole('teacher', 'admin');
export const requireAdmin = requireRole('admin');
