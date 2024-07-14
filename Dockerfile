FROM node:20-slim

LABEL name="kiwiwi"
LABEL version="0.1.0"
LABEL description="kiwiwi - private discord music bot"

RUN apt-get update
RUN apt-get upgrade -y
RUN apt-get install -y wget build-essential libtool ffmpeg

# dockerize
ENV DOCKERIZE_VERSION v0.2.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# App directory
WORKDIR /usr/src/app

COPY package*.json  .

# Install Package
RUN npm install -g pm2 
RUN npm install

# Expose Port
