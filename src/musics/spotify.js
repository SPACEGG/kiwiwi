import fetch from 'isomorphic-unfetch';
import spotifyUrlInfo from 'spotify-url-info';
const { getDetails } = spotifyUrlInfo(fetch);
import youtubeSearch from './youtubeSearch.js';

export default async (link) => {
    const rawInfo = await getDetails(link);
    const track = rawInfo.tracks[0];
    const query = `${track.artist} - ${track.name}`;

    return youtubeSearch(query);
};
