#!/bin/bash

# Tên image và container
IMAGE_NAME="mshop-pwa-image"
CONTAINER_NAME="mshop-pwa"

# Build Docker image
echo "Building Docker image: $IMAGE_NAME..."
docker build -t $IMAGE_NAME .

# Kiểm tra xem container có đang chạy không và dừng nó
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Stopping existing container: $CONTAINER_NAME..."
    docker stop $CONTAINER_NAME
fi

# Kiểm tra xem container có tồn tại không (kể cả đã dừng) và xóa nó
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "Removing existing container: $CONTAINER_NAME..."
    docker rm $CONTAINER_NAME
fi

# Chạy container mới
echo "Running new container: $CONTAINER_NAME..."
# Bạn có thể cần điều chỉnh cổng publish tùy theo cấu hình ứng dụng của bạn
# Ví dụ: -p 8080:80 nếu ứng dụng trong container chạy trên cổng 80
docker run -d --name $CONTAINER_NAME -p 8080:80 $IMAGE_NAME

echo "Container $CONTAINER_NAME is running."

