#!/bin/sh

CONTAINER_NAME="sale-pwa-container"
IMAGE_NAME="sale-pwa:latest"

# Build the Docker image
echo "Building Docker image ${IMAGE_NAME}..."
docker build -t ${IMAGE_NAME} .

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Docker build failed."
  exit 1
fi

# Check if a container with the same name is running and stop it
if [ $(docker ps -q -f name=^/${CONTAINER_NAME}$) ]; then
  echo "Stopping existing container ${CONTAINER_NAME}..."
  docker stop ${CONTAINER_NAME}
fi

# Check if a container with the same name exists (even if stopped) and remove it
if [ $(docker ps -aq -f name=^/${CONTAINER_NAME}$) ]; then
  echo "Removing existing container ${CONTAINER_NAME}..."
  docker rm ${CONTAINER_NAME}
fi

# Run the new container
echo "Running new container ${CONTAINER_NAME} from image ${IMAGE_NAME}..."
docker run -d -p 8080:80 --name ${CONTAINER_NAME} ${IMAGE_NAME}

echo "Script finished."
