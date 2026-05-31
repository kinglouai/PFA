# ─── Stage 1: Build the React app ───────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Accept build-time env vars (VITE_ prefix required by Vite)
ARG VITE_API_BASE_URL=http://localhost:8000
ARG VITE_GITHUB_CLIENT_ID=

# Set them as environment variables for the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GITHUB_CLIENT_ID=$VITE_GITHUB_CLIENT_ID

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# ─── Stage 2: Serve with nginx ──────────────────────────────────────────
FROM nginx:alpine AS production

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
