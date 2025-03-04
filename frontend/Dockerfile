FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# Ensure next.config.js has output: 'standalone'
RUN echo "Building with Next.js"
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy necessary files
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Copy output files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set proper permissions
RUN chmod +x ./server.js || echo "Warning: server.js not executable or not found"

EXPOSE 3000

# Environment variables must be present at build time
ENV PORT 3000

CMD ["node", "server.js"]