# Stage 1: Build the application
FROM node:18 as builder

WORKDIR /app/sale-pwa

COPY package*.json ./
COPY . .

RUN npm install

RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine

COPY --from=builder /app/sale-pwa/dist/spa /usr/share/nginx/html

EXPOSE 80
