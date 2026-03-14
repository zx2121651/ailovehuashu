FROM node:20-slim

# Install OpenSSL for Prisma compatibility
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json ./
RUN npm install

# Copy application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build or start script for production
EXPOSE 3000

# Start script
# We will run migrations and start server
CMD npx prisma db push && node src/index.js