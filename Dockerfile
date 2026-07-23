FROM node:20-alpine
WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev
RUN npx prisma generate

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start script - run migrations, seed, then start
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node prisma/seed.js && npm start"]
