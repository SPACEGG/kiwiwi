FROM node:22-slim

LABEL name="kiwiwi"
LABEL version="0.1.0"
LABEL description="kiwiwi - private discord music bot"

# system dependency
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    wget build-essential libtool ffmpeg curl unzip ca-certificates python3 \
    libgtk2.0-0 libgtk-3-0 libnotify-dev libgconf-2-4 libnss3 libxss1 && \
    rm -rf /var/lib/apt/lists/*

# Install Deno from official image
COPY --from=denoland/deno:bin /deno /usr/local/bin/deno

# Install latest yt-dlp directly from GitHub
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

# corepack
RUN corepack enable

# wait-for-it
COPY wait-for-it.sh /usr/local/bin/wait-for-it
RUN chmod +x /usr/local/bin/wait-for-it

# App directory
WORKDIR /usr/src/app

# dependencies
COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY package.json ./
COPY yarn.lock* ./

# Install Package
RUN yarn install --immutable
RUN npm install -g pm2

# copy sources
COPY . .

# Expose Port
