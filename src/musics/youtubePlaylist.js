import yts from 'yt-search';
import youtube from '#src/musics/youtube.js';

export default async (link) => {
    const listId = new URL(link).searchParams.get('list');

    const infoList = (await yts({ listId })).videos;
    return Promise.all(
        infoList
            .filter((i) => i.title !== '[Deleted video]' && i.title !== '[Private video]')
            .map((i) => {
                return {
                    link: `https://www.youtube.com/watch?v=${i.videoId}`,
                    audio: youtube(`https://www.youtube.com/watch?v=${i.videoId}`).audio,
                    title: i.title,
                    thumbnail: i.thumbnail,
                    duration: i.duration.seconds,
                };
            })
    );
    // return {
    //     link: result.url,
    //     audio: (await youtube(result.url)).audio,
    //     title: result.title,
    //     thumbnail: result.thumbnail,
    //     duration: result.duration.seconds,
    // };
};

// const getRawInfo = async (playlistId) => {
//     const apiKey = 'AIzaSyB-63vPrdThhKuerbB2N_l7Kwwcxj6yUAc';
//     const func = playlistId.startsWith('RD') ? 'next' : 'browse';
//     const browseId = playlistId.startsWith('RD') ? playlistId : 'VL' + playlistId;

//     const headers = {
//         'X-YouTube-Client-Name': '5',
//         'X-YouTube-Client-Version': '19.09.3',
//         'Origin': 'https://www.youtube.com',
//         'User-Agent':
//             'com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)',
//         'content-type': 'application/json',
//     };

//     const b = {
//         context: {
//             client: {
//                 clientName: 'IOS',
//                 clientVersion: '19.09.3',
//                 deviceModel: 'iPhone14,3',
//                 userAgent:
//                     'com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)',
//                 hl: 'en',
//                 timeZone: 'UTC',
//                 utcOffsetMinutes: 0,
//             },
//         },
//         browseId,
//     };

//     return await fetch(
//         `https://www.youtube.com/youtubei/v1/${func}?key${apiKey}&prettyPrint=false`,
//         { method: 'POST', body: JSON.stringify(b), headers }
//     ).then((r) => r.json());
// };

// export default async (link) => {
//     const url = new URL(link);
//     const id = url.searchParams.get('list');
//     const rawInfo = await getRawInfo(id);
//     const rawInfoList =
//         rawInfo.contents.singleColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
//             .sectionListRenderer.contents[0].itemSectionRenderer.contents[0]
//             .playlistVideoListRenderer.contents;

//     return await Promise.all(
//         rawInfoList
//             .filter((i) => i.playlistVideoRenderer?.isPlayable)
//             .map((i) =>
//                 youtube(
//                     `https://www.youtube.com/watch?v=${i.playlistVideoRenderer.videoId}`
//                 )
//             )
//     );
// };
