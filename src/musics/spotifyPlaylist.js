import fetch from 'isomorphic-unfetch';
import spotifyUrlInfo from 'spotify-url-info';
const { getDetails } = spotifyUrlInfo(fetch);
import youtubeSearch from './youtubeSearch.js';

export default async (link) => {
    const rawInfo = await getDetails(link);

    return await Promise.all(
        rawInfo.tracks.map(async (track) => {
            const query = `${track.artist} - ${track.name}`;
            return youtubeSearch(query);
        })
    );
};
