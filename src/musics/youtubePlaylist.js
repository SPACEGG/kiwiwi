import yts from 'yt-search';
import youtubeAudio from './youtubeAudio.js';

export default async (link) => {
    const listId = new URL(link).searchParams.get('list');

    const infoList = (await yts({ listId })).videos;
    return Promise.all(
        infoList
            .filter((i) => i.title !== '[Deleted video]' && i.title !== '[Private video]')
            .map(async (i) => {
                const videoLink = `https://www.youtube.com/watch?v=${i.videoId}`;
                return {
                    link: videoLink,
                    audio: youtubeAudio(videoLink),
                    title: i.title,
                    thumbnail: i.thumbnail,
                    duration: i.duration.seconds,
                };
            })
    );
};
