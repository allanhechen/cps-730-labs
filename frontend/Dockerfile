FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json yarn.lock ./
COPY shared/package.json ./shared/
COPY frontend/package.json ./frontend/

RUN yarn install --frozen-lockfile

COPY shared/ ./shared/
COPY frontend/ ./frontend/

RUN rm frontend/.env

RUN yarn workspace @todo-app/shared build
RUN yarn workspace frontend build

# Stage 2: Production
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /app/frontend/dist .

COPY frontend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]