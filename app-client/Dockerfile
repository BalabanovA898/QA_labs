FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

RUN addgroup -S www-data && adduser -S www-data -G www-data

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

RUN chown www-data:www-data ./nginx
RUN chown www-data:www-data /usr/share/nginx/html

USER www-data
CMD ["nginx", "-g", "daemon off;"]
