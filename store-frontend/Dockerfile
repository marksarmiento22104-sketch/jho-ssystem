FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build argument for the API URL (passed at build time)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the app
RUN npm run build

# --- Production stage ---
FROM node:20-alpine AS production

WORKDIR /app

# Install 'serve' to serve the static files
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Railway uses the PORT env variable
EXPOSE 3000

# Serve the built app
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
