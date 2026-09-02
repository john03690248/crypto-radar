import { Request, Response, NextFunction } from 'express';

/**
 * 🔒 全域錯誤處理中介層
 * 攔截伺服器內部未處理異常，避免敏感堆疊資訊 (Stack Trace) 外洩給客戶端
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('💥 伺服器異常:', err);

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || '伺服器內部錯誤，請稍後再試。',
  });
};
