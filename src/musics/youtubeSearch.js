import yts from 'yt-search';
import defaultAudio from './defaultAudio.js';

export default async (keyword) => {
    const result = (await yts(keyword)).videos[0];
    return {
        link: result.url,
        audio: () => defaultAudio(result.url),
        title: result.title,
        thumbnail: result.thumbnail,
        duration: result.duration.seconds,
    };
};
