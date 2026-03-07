FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

RUN yarn install --frozen-lockfile

COPY shared/ ./shared/
COPY backend/ ./backend/

RUN yarn workspace @todo-app/shared build
RUN yarn workspace backend build

FROM node:20-alpine
WORKDIR /app

COPY package.json yarn.lock ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist

ENV PORT=3000
ENV NODE_ENV=production
ENV SQLITE_DB_LOCATION=/app/data/todo.db

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "backend/dist/index.js"]