import path from 'path';
import config from '#src/config.js';
import logger from '#src/logger.js';
import { create } from 'youtube-dl-exec';

// Use system global yt-dlp binary
const youtubeDl = create('/usr/local/bin/yt-dlp');

export default async (link) => {
    return new Promise((res) => {
        const args = {
            format: 'bestaudio',
            noCheckCertificates: true,
            output: '-',
            abortOnError: true,
            noCacheDir: true,
            noPart: true,
            jsRuntimes: 'deno',
            cookies: path.resolve('./cookies.txt'),
            extractorArgs: `youtube:player-client=default,mweb;lang=${config.lang}`,
        };

        if (config.poToken) {
            args.extractorArgs += `;po_token=mweb.gvs+${config.poToken}`;
        }

        const stream = youtubeDl.exec(link, args);

        stream.catch((e) => {
            if (e.stderr) {
                logger.warn(`yt-dlp stderr: ${e.stderr.substr(0, 2000)}`);
            } else {
                logger.warn(`defaultAudioError: ${e.shortMessage || e.message}`);
            }
        });

        res(stream.stdout);
    });
};
