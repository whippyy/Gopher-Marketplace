# ---------- Build Stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# Build Next.js app without injecting env vars
RUN npm run build

# ---------- Run Stage ----------
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Runtime config script
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000
ENV NODE_ENV=production

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "start"]
