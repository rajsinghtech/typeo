# Stage 1: Build the Frontend
FROM node:16-alpine AS frontend

# Set working directory
WORKDIR /client

# Copy frontend package files
COPY client/package*.json ./

# Install frontend dependencies
RUN npm install --silent

# Copy frontend source code
COPY client/ ./

COPY client/.env ./.env

# Build the frontend
RUN npm run build

# Stage 2: Build the Backend
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY package*.json ./

# Install backend dependencies
RUN npm install --silent

# Copy backend source code
COPY src/ ./src
COPY tsconfig.json ./

# Copy the built frontend from the previous stage
COPY --from=frontend /client/build ./client/build

# Build the backend
RUN npm run tsc

# Expose the backend port
EXPOSE 8080

# Start the backend server
CMD ["npm", "start"]