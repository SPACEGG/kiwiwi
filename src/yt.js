import { getYoutubeIdFromURL } from '#src/youtubeUtils.js';

// code from https://github.com/fent/node-ytdl-core/issues/1289#srcissuecomment-2181891237
const getInfo = async (videoId) => {
    // hard-coded from https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/youtube.py
    const apiKey = 'AIzaSyB-63vPrdThhKuerbB2N_l7Kwwcxj6yUAc';

    const headers = {
        'X-YouTube-Client-Name': '5',
        'X-YouTube-Client-Version': '19.09.3',
        'Origin': 'https://www.youtube.com',
        'User-Agent':
            'com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)',
        'content-type': 'application/json',
    };

    const b = {
        context: {
            client: {
                clientName: 'IOS',
                clientVersion: '19.09.3',
                deviceModel: 'iPhone14,3',
                userAgent:
                    'com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)',
                hl: 'en',
                timeZone: 'UTC',
                utcOffsetMinutes: 0,
            },
        },
        videoId,
        playbackContext: {
            contentPlaybackContext: { html5Preference: 'HTML5_PREF_WANTS' },
        },
        contentCheckOk: true,
        racyCheckOk: true,
    };

    return fetch(
        `https://www.youtube.com/youtubei/v1/player?key${apiKey}&prettyPrint=false`,
        { method: 'POST', body: JSON.stringify(b), headers }
    ).then((r) => r.json());
};

const getAudio = (info) => {
    const list = info.streamingData.adaptiveFormats;
    return list.reduce((high, current) => {
        if (!current.mimeType?.includes('audio/mp4')) return high;
        if ((high.bitrate || -Infinity) < current.bitrate) return current;
        return high;
    }, {}).url;
};

const getThumbnail = (info) =>
    info.videoDetails.thumbnail.thumbnails[
        info.videoDetails.thumbnail.thumbnails.length - 1
    ].url;

export default async (link) => {
    const info = await getInfo(getYoutubeIdFromURL(link));
    if (info.playabilityStatus.status !== 'OK') {
        throw info.playabilityStatus.reason;
    }
    return {
        info: info,
        audio: getAudio(info),
        title: info.videoDetails.title,
        thumbnail: getThumbnail(info),
        duration: info.videoDetails.lengthSeconds,
    };
};
