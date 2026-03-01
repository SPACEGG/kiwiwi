import youtubeDl from 'youtube-dl-exec';
import youtube from './youtube.js';

const getInfo = (query) => {
    const args = {
        dumpSingleJson: true,
        skipDownload: true,
        noWarnings: true,
        flatPlaylist: true,
    };

    return youtubeDl(`ytsearch:${query}`, args);
};

export default async (query) => {
    const rawInfo = await getInfo(query);

    const entry = rawInfo.entries[0];

    return entry ? await youtube(entry.url) : undefined;
};
