FROM node:20-alpine
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy and install ALL dependencies (prisma is needed for generate + build)
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Start: migrate DB, seed, then run production server
CMD sh -c "npx prisma db push --accept-data-loss && node prisma/seed.js && npm start"
