import path from 'path';
import config from '#src/config.js';
import logger from '#src/logger.js';
import { create } from 'youtube-dl-exec';

// Use system global yt-dlp binary
const youtubeDl = create('/usr/local/bin/yt-dlp');

/**
 * Executes yt-dlp to get an audio stream for a given link.
 * @param {string} link - The URL of the track to play.
 * @returns {Promise<import('stream').Readable & {process: import('child_process').ChildProcess}>} The stdout stream with the attached child process.
 */
export default async (link) => {
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
        paths: 'temp:/tmp',
    };

    if (config.poToken) {
        args.extractorArgs += `;po_token=mweb.gvs+${config.poToken}`;
    }

    const child = youtubeDl.exec(link, args);

    child.catch((e) => {
        // Filter out Broken pipe or Process killed errors
        if (
            e.message?.includes('Broken pipe') || 
            e.stderr?.includes('Broken pipe') ||
            e.signal === 'SIGTERM' ||
            e.signal === 'SIGKILL'
        ) {
            return;
        }

        if (e.stderr) {
            logger.warn(`yt-dlp stderr: ${e.stderr.substr(0, 2000)}`);
        } else {
            logger.warn(`defaultAudioError: ${e.shortMessage || e.message}`);
        }
    });

    /** @type {import('stream').Readable & {process: import('child_process').ChildProcess}} */
    const stream = child.stdout;
    stream.process = child; // Attach process to stream for management
    return stream;
};
