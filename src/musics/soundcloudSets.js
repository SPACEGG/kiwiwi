import youtubeDl from 'youtube-dl-exec';
import soundcloud from './soundcloud.js';

const getAlbumInfo = (link) =>
    youtubeDl(link, {
        dumpSingleJson: true,
        skipDownload: true,
        flatPlaylist: true,
        noWarnings: true,
        preferFreeFormats: true,
        noCheckCertificates: true,
    });

export default async (link) => {
    const infoList = (await getAlbumInfo(link)).entries;
    return Promise.all(
        infoList.map(async (i) => {
            return soundcloud(i.url);
        })
    );
};
