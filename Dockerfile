FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate
COPY . .
RUN npm run build
EXPOSE ${PORT:-3000}
CMD sh -c "DATABASE_URL=file:/data/app.db npx prisma db push --accept-data-loss 2>/dev/null; DATABASE_URL=file:/data/app.db node prisma/seed.js 2>/dev/null; npm start"
