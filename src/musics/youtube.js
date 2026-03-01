import path from 'path';
import config from '#src/config.js';
import youtubeDl from 'youtube-dl-exec';
import defaultAudio from './defaultAudio.js';

const getVideoLink = (url) => {
    const regex =
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    const result = match ? match[1] : null;
    return result ? `https://www.youtube.com/watch?v=${result}` : url;
};

const getInfo = (link) => {
    const args = {
        dumpSingleJson: true,
        skipDownload: true,
        noWarnings: true,
        noCheckCertificates: true,
        cookies: path.resolve('./cookies.txt'),
    };

    return youtubeDl(link, args);
};

export default async (link) => {
    const url = getVideoLink(link);
    const rawInfo = await getInfo(url);

    return {
        link,
        audio: () => defaultAudio(url),
        title: rawInfo.title,
        thumbnail: rawInfo.thumbnails ? rawInfo.thumbnails[0]?.url : '',
        duration: rawInfo.duration,
    };
};
