import youtubeDl from 'youtube-dl-exec';
import defaultAudio from './defaultAudio.js';

const getInfo = (link) => youtubeDl(link, { dumpSingleJson: true });

export default async (link) => {
    const rawInfo = await getInfo(link);

    return {
        link,
        audio: () => defaultAudio(link),
        title: rawInfo.title,
        thumbnail: rawInfo.thumbnails.find((i) => i.id === 'original').url,
        duration: Math.round(rawInfo.duration),
    };
};
