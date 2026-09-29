FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY apps/api/package*.json ./
RUN npm ci
COPY apps/api ./
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /usr/src/app
COPY apps/api/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/main"]
