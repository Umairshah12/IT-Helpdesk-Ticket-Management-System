import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message?: string, meta?: any, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
      meta,
    });
  }

  static error(res: Response, message: string, code = 'INTERNAL_ERROR', details?: any[], statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        details,
      },
    });
  }
}

