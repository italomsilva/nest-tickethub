# Stage 1: Build NestJS Application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

# Install all dependencies (including devDependencies) to build the app
RUN npm ci

COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Production Run
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./

# Install only production dependencies to keep the image lightweight
RUN npm ci --omit=dev && npm cache clean --force

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Create an uploads folder for local file storage if needed
RUN mkdir -p uploads

# Expose NestJS default port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/main"]
