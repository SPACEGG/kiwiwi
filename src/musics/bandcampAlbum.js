import youtubeDl from 'youtube-dl-exec';
import defaultAudio from './defaultAudio.js';

const getAlbumInfo = (link) => youtubeDl(link, { dumpSingleJson: true });

export default async (link) => {
    const infoList = (await getAlbumInfo(link)).entries;
    return Promise.all(
        infoList.map(async (i) => {
            return {
                link: i.original_url,
                audio: () => defaultAudio(i.original_url),
                title: i.title,
                thumbnail: i.thumbnail,
                duration: Math.round(i.duration),
            };
        })
    );
};
