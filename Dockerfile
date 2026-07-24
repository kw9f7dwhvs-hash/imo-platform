FROM node:20-alpine
RUN apk add --no-cache python3 make g++ openssl
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build
EXPOSE ${PORT:-3000}
CMD sh -c "npx prisma db push --accept-data-loss 2>&1 | tail -3; node prisma/seed.js 2>&1 | tail -3; npm start"
