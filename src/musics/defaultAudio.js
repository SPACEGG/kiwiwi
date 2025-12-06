import path from 'path';
import logger from '#src/logger.js';
import youtubeDl from 'youtube-dl-exec';

export default async (link) => {
    return new Promise((res) => {
        const stream = youtubeDl.exec(link, {
            extractAudio: true,
            noCheckCertificates: true,
            audioFormat: 'best',
            audioQuality: 0,
            output: '-',
            abortOnError: true,
            noCacheDir: true,
            noPart: true,
            cookies: path.resolve('./cookies.txt'),
            extractorArgs: `youtube:player-client=default,web;format=dashy`,
        });
        // extractorArgs: `youtube:player-client=default,mweb;lang=${config.lang};format=dashy;po_token=mweb.gvs+${config.poToken}`,

        // eslint-disable-next-line no-unused-vars
        // stream.stdout.on('error', (e) => {
        //     logger.warn(`defaultAudioError(${link}): ${e.message}`);
        //     rej(e);
        // });

        stream.catch((e) => {
            if (e.stderr) {
                logger.warn(`yt-dlp stderr: ${e.stderr.substr(0, 500)}`);
            } else {
                logger.warn(`defaultAudioError: ${e.shortMessage || e.message}`);
            }
        });

        res(stream.stdout);
    });
};
