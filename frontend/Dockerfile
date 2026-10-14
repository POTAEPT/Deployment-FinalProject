# ===== Stage 1: build =====
# build React เป็นไฟล์ static (HTML/JS/CSS) ในโฟลเดอร์ dist/
FROM node:22-alpine AS build
WORKDIR /app

# URL ของแต่ละ service ถูกฝังลงใน JS ตอน build (Vite อ่านจาก env ที่ขึ้นต้นด้วย VITE_)
# ค่าเริ่มต้นใช้ได้กับ docker compose ในเครื่อง เพราะเบราว์เซอร์เรียก service ผ่าน port ของเครื่องเรา
ARG VITE_AUTH_URL=http://localhost:3001
ARG VITE_TIMER_URL=http://localhost:3002
ARG VITE_TASK_URL=http://localhost:3003
ARG VITE_HISTORY_URL=http://localhost:3004
ARG VITE_NOTIFY_URL=http://localhost:3005

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ===== Stage 2: run =====
# nginx เสิร์ฟไฟล์ static อย่างเดียว ไม่มี Node.js ใน image นี้
# ใช้ nginx-unprivileged: รันด้วย user nginx (ไม่ใช่ root) และฟัง port 8080
FROM nginxinc/nginx-unprivileged:1.30-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1
