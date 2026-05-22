FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
RUN npm ci --omit=dev

ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/frontend/server/server.mjs"]
