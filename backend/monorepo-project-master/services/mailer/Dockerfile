FROM php:8.2-fpm-alpine
WORKDIR /var/www
RUN apk add --no-cache curl zip unzip
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-scripts --optimize-autoloader
COPY . .
EXPOSE 8080
CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]
