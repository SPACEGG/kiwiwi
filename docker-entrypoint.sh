#!/bin/bash
# Update yt-dlp to the latest version on startup
echo "Updating yt-dlp..."
yt-dlp -U || echo "yt-dlp update failed, continuing with current version."

echo "wait db server"
wait-for-it db:3306 -t 20 -- echo "db is up"

echo "start node server"
npm run build
pm2-runtime start ecosystem.config.* --env production
