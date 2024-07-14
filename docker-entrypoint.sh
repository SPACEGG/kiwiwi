echo "wait db server"
dockerize -wait tcp://db:3306 -timeout 20s

echo "start node server"
npm run build
pm2-runtime start ecosystem.config.* --env production