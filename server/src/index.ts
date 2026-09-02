import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env';
import { apiRouter } from './routes';
import { generalRateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// 🔒 1. 資安防護：Helmet 安全 HTTP 標頭 (防 Clickjacking, XSS, 嗅探)
app.use(helmet());

// 🔒 2. 資安防護：CORS 跨來源資源共享控制 (允許前端連線)
app.use(
  cors({
    origin: [config.corsOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 🔒 3. 資安防護：限制 JSON Body 大小，防止超大負載 DoS 攻擊
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 🔒 4. 資安防護：通用 API 速率限制
app.use('/api', generalRateLimiter);

// 5. 掛載 API 總路由
app.use('/api', apiRouter);

// 6. 全域錯誤攔截
app.use(errorHandler);

// 啟動伺服器
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 CryptoPulse 後端伺服器運行於: http://localhost:${PORT}`);
  console.log(`🛡️ 資安防護已啟用：Helmet, CORS, RateLimiter, bcrypt, JWT`);
  console.log(`📡 API 健康檢查端點: http://localhost:${PORT}/api/health`);
});
