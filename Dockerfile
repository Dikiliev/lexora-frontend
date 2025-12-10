# Сборка фронта
FROM node:20-alpine AS build

WORKDIR /app

COPY lexora-frontend/package.json \
     lexora-frontend/package-lock.json* ./

RUN npm install

COPY lexora-frontend/ ./

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Прод nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

# Создаем конфигурацию для фронтенда
RUN echo 'server {' > /etc/nginx/conf.d/frontend.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/frontend.conf && \
    echo '    server_name _;' >> /etc/nginx/conf.d/frontend.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/frontend.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/frontend.conf && \
    echo '' >> /etc/nginx/conf.d/frontend.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/frontend.conf && \
    echo '        try_files $uri /index.html;' >> /etc/nginx/conf.d/frontend.conf && \
    echo '    }' >> /etc/nginx/conf.d/frontend.conf && \
    echo '}' >> /etc/nginx/conf.d/frontend.conf

COPY --from=build /app/dist /usr/share/nginx/html

