#!/usr/bin/env sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding admin user if needed..."
npx prisma db seed

echo "Starting Hedgehog Hydrate..."
exec node server.js
