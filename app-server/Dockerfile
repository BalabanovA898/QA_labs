FROM golang:1.25.8-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /recipe-api ./server/cmd/server/main.go

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /recipe-api .

EXPOSE 8080

USER www-data CMD ["./recipe-api"]
