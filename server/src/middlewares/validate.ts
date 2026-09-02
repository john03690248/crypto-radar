import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * 🔒 資安防護：輸入驗證中介層 (Input Validation Middleware)
 * 透過 Zod Schema 嚴格過濾與驗證 Request Body / Query / Params
 * 有效防範 SQL Injection、XSS 負載與格式異常攻擊
 */
export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: '輸入資料格式不符合規範',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
