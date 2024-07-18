import yts from 'yt-search';
import youtube from '#src/musics/youtube.js';

export default async (link) => {
    const listId = new URL(link).searchParams.get('list');

    const infoList = (await yts({ listId })).videos;
    return Promise.all(
        infoList
            .filter((i) => i.title !== '[Deleted video]' && i.title !== '[Private video]')
            .map(async (i) => {
                return {
                    link: `https://www.youtube.com/watch?v=${i.videoId}`,
                    audio: (await youtube(`https://www.youtube.com/watch?v=${i.videoId}`))
                        .audio,
                    title: i.title,
                    thumbnail: i.thumbnail,
                    duration: i.duration.seconds,
                };
            })
    );
};
