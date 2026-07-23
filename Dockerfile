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

CMD sh -c "npx prisma db push --accept-data-loss && node prisma/seed.js && npm start -- -p ${PORT:-3000} -H 0.0.0.0"
