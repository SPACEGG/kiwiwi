import yts from 'yt-search';
import youtube from '#src/musics/youtube.js';

export default async (keyword) => {
    const result = (await yts(keyword)).videos[0];
    return {
        link: result.url,
        audio: (await youtube(result.url)).audio,
        title: result.title,
        thumbnail: result.thumbnail,
        duration: result.duration.seconds,
    };
};
