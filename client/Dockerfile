# ─── Stage 1: 建置編譯階段 ───
FROM node:20-alpine AS builder

WORKDIR /app

# 先複製 package.json 充分利用 Docker 快取層
COPY package*.json ./
RUN npm install

# 複製其餘原始碼並打包
COPY . .
RUN npm run build

# ─── Stage 2: 生產運行階段 (超輕量 Nginx) ───
FROM nginx:alpine

# 複製自訂 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 將 Stage 1 編譯出的 dist/ 靜態資源複製到 Nginx 網頁目錄
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
