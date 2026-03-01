import path from 'path';
import config from '#src/config.js';
import youtubeDl from 'youtube-dl-exec';
import defaultAudio from './defaultAudio.js';

const getAlbumInfo = (link) => {
    const args = {
        dumpSingleJson: true,
        skipDownload: true,
        flatPlaylist: true,
        noWarnings: true,
        noCheckCertificates: true,
        cookies: path.resolve('./cookies.txt'),
        jsRuntimes: 'node',
        extractorArgs: `youtube:player-client=web_embedded;lang=${config.lang}`,
    };

    return youtubeDl(link, args);
};

export default async (link) => {
    const infoList = (await getAlbumInfo(link)).entries;

    return Promise.all(
        infoList
            .filter((i) => i.title !== '[Deleted video]' && i.title !== '[Private video]')
            .map(async (i) => {
                return {
                    link: i.url,
                    audio: () => defaultAudio(i.url),
                    title: i.title,
                    thumbnail: i.thumbnails[0].url,
                    duration: i.duration,
                };
            })
    );
};
