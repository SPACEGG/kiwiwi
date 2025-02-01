import youtubeDl from 'youtube-dl-exec';
import defaultAudio from './defaultAudio.js';

const getInfo = (query) =>
    youtubeDl(`ytsearch:${query}`, {
        dumpSingleJson: true,
        skipDownload: true,
        noWarnings: true,
        preferFreeFormats: true,
        noCheckCertificates: true,
        flatPlaylist: true,
    });

export default async (query) => {
    const rawInfo = await getInfo(query);

    const entry = rawInfo.entries[0];

    return {
        link: entry.url,
        audio: () => defaultAudio(entry.url),
        title: entry.title,
        thumbnail: entry.thumbnails[0].url,
        duration: entry.duration,
    };
};
