import { Router } from 'express';
import { fetchLatestCryptoNews } from '../services/newsService';

export const newsRouter = Router();

/**
 * 取得最新加密貨幣即時快訊與新聞
 * GET /api/news
 */
newsRouter.get('/', async (req, res, next) => {
  try {
    const news = await fetchLatestCryptoNews();
    res.json({
      success: true,
      data: { news },
    });
  } catch (error) {
    next(error);
  }
});
