# Сборка: Vite dist. Рантайм: Node отдаёт статику и живой /api/v1 (не nginx-only).
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

COPY --from=build /app/dist ./dist
COPY server ./server

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=8s \
  CMD node -e "fetch('http://127.0.0.1:8080/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/serve.mjs"]
