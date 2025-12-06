echo "wait db server"
wait-for-it db:3306 -t 20 -- echo "db is up"

echo "start node server"
npm run build
pm2-runtime start ecosystem.config.* --env production