import { Router } from 'express';
import { authRouter } from './auth';
import { watchlistRouter } from './watchlist';
import { newsRouter } from './news';

export const apiRouter = Router();

// 健康檢查端點
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'CryptoPulse Backend API',
  });
});

// 掛載子模組路由
apiRouter.use('/auth', authRouter);
apiRouter.use('/watchlist', watchlistRouter);
apiRouter.use('/news', newsRouter);
