FROM node:20-alpine AS builder
WORKDIR /app

COPY frontend/recruiment-system-web/package.json frontend/recruiment-system-web/package-lock.json* ./
RUN npm ci || npm install

COPY frontend/recruiment-system-web/. .

RUN npm run build:docker

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist /app/dist
RUN npm i vite@^7.2.4

EXPOSE 5173
CMD ["npx","vite","preview","--host","0.0.0.0","--port","5173","--strictPort"]
