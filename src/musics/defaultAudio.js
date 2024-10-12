import logger from '#src/logger.js';
import youtubeDl from 'youtube-dl-exec';

export default async (link) => {
    return new Promise((res) => {
        const stream = youtubeDl.exec(link, {
            extractAudio: true,
            noCheckCertificates: true,
            noWarnings: true,
            audioFormat: 'mp3',
            output: '-',
        });
        stream.catch((e) => {
            logger.error(`yt-dlpError: ${e}`);
        });
        res(stream.stdout);
    });
};
