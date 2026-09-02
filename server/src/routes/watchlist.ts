import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { validate } from '../middlewares/validate';
import { requireAuth, AuthenticatedRequest } from '../middlewares/auth';

export const watchlistRouter = Router();

// 所有追蹤清單的操作都必須登入
watchlistRouter.use(requireAuth);

const addWatchlistSchema = z.object({
  body: z.object({
    symbol: z.string().min(2, '幣種代號不可為空').max(20).toUpperCase(),
    coinName: z.string().max(50).optional(),
    notes: z.string().max(200).optional(),
    targetAlertHigh: z.number().positive().optional(),
    targetAlertLow: z.number().positive().optional(),
  }),
});

const updateWatchlistSchema = z.object({
  body: z.object({
    notes: z.string().max(200).optional(),
    targetAlertHigh: z.number().positive().nullable().optional(),
    targetAlertLow: z.number().positive().nullable().optional(),
  }),
});

/**
 * 1. 取得使用者的追蹤清單
 * GET /api/watchlist
 */
watchlistRouter.get('/', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.userId;

    const items = await prisma.watchlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: { watchlist: items },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 2. 加入幣種至追蹤清單
 * POST /api/watchlist
 */
watchlistRouter.post(
  '/',
  validate(addWatchlistSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.userId;
      const { symbol, coinName, notes, targetAlertHigh, targetAlertLow } = req.body;

      // 檢查是否已在清單中
      const existing = await prisma.watchlistItem.findUnique({
        where: {
          userId_symbol: {
            userId,
            symbol,
          },
        },
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: `${symbol} 已在你的追蹤清單中。`,
        });
        return;
      }

      const item = await prisma.watchlistItem.create({
        data: {
          userId,
          symbol,
          coinName,
          notes,
          targetAlertHigh,
          targetAlertLow,
        },
      });

      res.status(201).json({
        success: true,
        message: `成功將 ${symbol} 加入追蹤清單！`,
        data: { item },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 3. 更新追蹤幣種備註或警報價位
 * PUT /api/watchlist/:symbol
 */
watchlistRouter.put(
  '/:symbol',
  validate(updateWatchlistSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.userId;
      const rawSymbol = Array.isArray(req.params.symbol) ? req.params.symbol[0] : req.params.symbol;
      const symbol = String(rawSymbol).toUpperCase();
      const { notes, targetAlertHigh, targetAlertLow } = req.body;

      // 🔒 資安防護：限定 userId 與 symbol 雙重條件，防止越權修改他人資料 (IDOR)
      const updated = await prisma.watchlistItem.updateMany({
        where: {
          userId,
          symbol,
        },
        data: {
          notes,
          targetAlertHigh,
          targetAlertLow,
        },
      });

      if (updated.count === 0) {
        res.status(404).json({
          success: false,
          message: '找不到該追蹤項目。',
        });
        return;
      }

      res.json({
        success: true,
        message: '追蹤項目設定已更新！',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * 4. 從追蹤清單移除幣種
 * DELETE /api/watchlist/:symbol
 */
watchlistRouter.delete('/:symbol', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.userId;
    const rawSymbol = Array.isArray(req.params.symbol) ? req.params.symbol[0] : req.params.symbol;
    const symbol = String(rawSymbol).toUpperCase();

    const deleted = await prisma.watchlistItem.deleteMany({
      where: {
        userId,
        symbol,
      },
    });

    if (deleted.count === 0) {
      res.status(404).json({
        success: false,
        message: '找不到該追蹤項目。',
      });
      return;
    }

    res.json({
      success: true,
      message: `已從追蹤清單中移除 ${symbol}。`,
    });
  } catch (error) {
    next(error);
  }
});
