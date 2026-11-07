FROM node:20-alpine AS base
WORKDIR /app

# Development target
FROM base AS dev
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Builder for production
FROM base AS builder
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package*.json ./
RUN npm install --prefer-offline
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production target
FROM base AS prod
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/emoji-picker-react /usr/src/app/node_modules/emoji-picker-react
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
