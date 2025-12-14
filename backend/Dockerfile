FROM golang:1.22 AS builder
WORKDIR /app

COPY backend/go.mod backend/go.sum ./backend/
WORKDIR /app/backend
ENV GOTOOLCHAIN=auto
RUN go mod download

COPY backend/. .

RUN go build -o /app/server ./cmd/api

FROM debian:stable-slim
WORKDIR /app
ENV PORT=8080
COPY --from=builder /app/server /app/server

EXPOSE 8080
CMD ["/app/server"]