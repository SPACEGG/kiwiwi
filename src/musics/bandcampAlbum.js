import youtubeDl from 'youtube-dl-exec';
import bandcamp from './bandcamp.js';

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
            return bandcamp(i.url);
        })
    );
};
