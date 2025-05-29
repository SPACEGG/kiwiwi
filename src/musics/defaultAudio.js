import path from 'path';
import logger from '#src/logger.js';
import youtubeDl from 'youtube-dl-exec';
import { generate } from 'youtube-po-token-generator';

export default async (link) => {
    const extractorArgs = await extractorArgsWithPOT();
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
            extractorArgs: extractorArgs,
            // cookiesFromBrowser:
            //     'chrome:~/.cache/puppeteer/chrome/linux-136.0.7103.94/chrome-linux64/chrome',
        });

        // eslint-disable-next-line no-unused-vars
        stream.stdout.on('data', (_) => {});

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

const extractorArgsWithPOT = async () => {
    const poToken = (await generate()).poToken;
    return `youtube:player-client=default,mweb;po_token=mweb.gvs+${poToken}`;
};
