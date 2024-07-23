import youtubeAudio from './youtubeAudio.js';
import yts from 'yt-search';

const getYouTubeVideoId = (url) => {
    const pattern =
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(pattern);
    return match ? match[1] : null;
};

export default async (link) => {
    const info = await yts({ videoId: getYouTubeVideoId(link) });

    return {
        link,
        audio: youtubeAudio(link),
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration.seconds,
    };
};
