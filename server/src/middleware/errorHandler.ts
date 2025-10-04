import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('error:', err);

  // mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'validation failed',
      details: err.errors,
    });
  }

  // mongoose cast error (invalid objectid)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'invalid id format',
    });
  }

  // duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'resource already exists',
    });
  }

  // default error
  const status = err.status || 500;
  const message = err.message || 'internal server error';

  res.status(status).json({
    error: message,
  });
};
