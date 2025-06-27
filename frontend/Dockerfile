# Stage 1: Build Next.js application
FROM node:20-alpine AS nextjs-builder

WORKDIR /app

# Copy package files for caching
RUN yarn config set network-timeout 300000
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of the Next.js application
COPY . .

# Build the Next.js application for production
RUN yarn build

# Stage 2: Production image for Next.js
FROM node:20-alpine AS nextjs-runner

WORKDIR /app

# Install only production dependencies
COPY --from=nextjs-builder /app/package.json /app/yarn.lock ./
RUN yarn install --production --frozen-lockfile

# Copy built output and public assets from the builder stage
COPY --from=nextjs-builder /app/public ./public
COPY --from=nextjs-builder /app/next.config.mjs ./
COPY --from=nextjs-builder /app/package.json ./package.json

COPY --from=nextjs-builder /app/.next/standalone ./
COPY --from=nextjs-builder /app/.next/static ./.next/static

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# Bind to 0.0.0.0 to accept connections from outside the container
CMD ["node", "server.js"]