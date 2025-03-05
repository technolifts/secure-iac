FROM node:18-alpine AS base

# Create app directory
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# Set up development environment with hot reload
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js specific env variables
ENV PORT 3000
ENV NODE_ENV development
ENV NEXT_TELEMETRY_DISABLED 1

# Expose port
EXPOSE 3000

# Start Next.js in development mode for hot reloading
CMD ["npm", "run", "dev"]