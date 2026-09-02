import rateLimit from 'express-rate-limit';

/**
 * 🔒 資安防護：速率限制器 (Rate Limiter)
 * 防止惡意暴力破解密碼 (Brute-force attacks) 或大量濫用 API
 */

// 針對註冊 / 登入等敏感操作的嚴格限制 (15分鐘內最多 10 次嘗試)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '登入嘗試過於頻繁，為保護帳號安全，請於 15 分鐘後再試。',
  },
});

// 針對一般 API 的通用限制 (1分鐘內最多 120 次)
export const generalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: '請求過於頻繁，請稍後再試。',
  },
});
