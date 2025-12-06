FROM node:22-slim

LABEL name="kiwiwi"
LABEL version="0.1.0"
LABEL description="kiwiwi - private discord music bot"

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y wget build-essential libtool ffmpeg
RUN apt-get install -y libgtk2.0-0 libgtk-3-0 libnotify-dev libgconf-2-4 libnss3 libxss1

# wait-for-it
COPY wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

# App directory
WORKDIR /usr/src/app

COPY package*.json  .

# Install Package
RUN npm install -g pm2 
RUN npm install
RUN npx puppeteer browsers install chrome

# Expose Port
