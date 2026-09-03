# ─── Stage 1: 建置編譯階段 ───
FROM node:20-alpine AS builder

WORKDIR /app

# 安裝 OpenSSL (Prisma 在 Alpine 上運行所需依賴)
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .
RUN npm run build

# ─── Stage 2: 生產運行階段 ───
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

# 只安裝生產環境依賴
RUN npm install --omit=dev
RUN npx prisma generate

# 複製 Stage 1 編譯出的 dist/
COPY --from=builder /app/dist ./dist

# 資安防護：使用 node 內建非 root 使用者運行
USER node

EXPOSE 5001

CMD ["node", "dist/index.js"]
