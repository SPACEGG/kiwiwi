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
        });
        stream.catch((e) => {
            logger.error(`defaultAudioError(${link}): ${e}`);
        });
        res(stream.stdout);
    });
};
