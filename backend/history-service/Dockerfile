# ===== Stage 1: build =====
# ติดตั้ง dependency ทั้งหมด (รวม TypeScript) แล้วแปลง src/ เป็น JavaScript ใน dist/
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ===== Stage 2: run =====
# image ที่ใช้จริง มีแค่ dependency ตอนรัน + dist/ (ไม่มี TypeScript, Vitest, source code)
FROM node:22-alpine
ENV NODE_ENV=production
ENV PORT=3004
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

# ไม่รันด้วย root เพื่อความปลอดภัย (ข้อมูลเก็บใน memory ไม่ต้องเขียนไฟล์)
USER node

EXPOSE 3004

# docker / docker compose ใช้เช็คว่า service พร้อมหรือยัง (wget มีใน alpine อยู่แล้ว)
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/health || exit 1

CMD ["node", "dist/index.js"]
