import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, message?: string) => {
  return res.status(200).json({
    success: true,
    message: message || 'operation successful',
    data,
  });
};

export const sendCreated = (res: Response, data: any, message?: string) => {
  return res.status(201).json({
    success: true,
    message: message || 'resource created successfully',
    data,
  });
};

export const sendError = (res: Response, status: number, message: string, details?: any) => {
  return res.status(status).json({
    success: false,
    error: message,
    ...(details && { details }),
  });
};
