# Dockerfile for Next.js with Bun

# Stage 1: Build the application
FROM oven/bun:1 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and bun.lock
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the source code
COPY . .

# Build the Next.js application
RUN bun run build

# Stage 2: Production environment
FROM oven/bun:1 AS runner

# Set working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json .
COPY --from-builder /app/bun.lock .

# Install production dependencies
RUN bun install --production

# Expose the port the app runs on
EXPOSE 3000

# Set the command to start the app
CMD ["bun", "run", "start"]
