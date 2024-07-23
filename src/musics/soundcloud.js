import { create } from 'soundcloud-downloader';

const scdl = create();

export default async (link) => {
    const rawInfo = await scdl.getInfo(link);

    return {
        link,
        audio: () => scdl.download(link),
        title: rawInfo.title,
        thumbnail: rawInfo.artwork_url,
        duration: Math.round(rawInfo.duration / 1000),
    };
};
