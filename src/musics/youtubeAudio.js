import youtubeDl from 'youtube-dl-exec';

// const getInfo = (url) => youtubeDl(url, { dumpSingleJson: true });
const getStream = (link) => {
    return youtubeDl.exec(link, {
        extractAudio: true,
        noCheckCertificates: true,
        noWarnings: true,
        audioFormat: 'mp3',
        output: '-',
    });
};

export default (link) => {
    return () =>
        new Promise((res) => {
            const stream = getStream(link);
            stream.catch(() => {});
            res(stream.stdout);
        });
};
