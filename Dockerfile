# Stage 1: Build the application
FROM node:18 as builder

WORKDIR /app/sale-pwa

COPY package*.json ./
COPY . .

RUN npm install

# Build the PWA application
RUN npx quasar build -m pwa

# Stage 2: Serve the application with nginx
FROM nginx:alpine

# Copy the PWA build output
COPY --from=builder /app/sale-pwa/dist/pwa /usr/share/nginx/html

EXPOSE 80
