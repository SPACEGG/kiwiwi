import yts from 'yt-search';
import { isURL } from '#src/utils.js';

export const makeYoutubeURLFromId = (id) => {
    return `https://www.youtube.com/watch?v=${id}`;
};

export const getYoutubeIdFromURL = (urlString) => {
    const url = new URL(urlString);
    if (url.hostname === 'youtube.com' || url.hostname === 'www.youtube.com') {
        return url.searchParams.get('v');
    } else {
        return url.pathname.substring(1);
    }
};

export const isYoutubeURL = (urlString) => {
    if (!isURL(urlString)) return false;
    const url = new URL(urlString);
    if (
        url.hostname === 'youtube.com' ||
        url.hostname === 'youtu.be' ||
        url.hostname === 'www.youtube.com' ||
        url.hostname === 'www.youtu.be'
    )
        return true;
    return false;
};

export const isYoutubePlaylistURL = (urlString) => {
    if (!isYoutubeURL(urlString)) return false;
    const url = new URL(urlString);
    if (url.pathname === '/playlist') return true;
    return false;
};

export const getYoutubeInfo = async (urlString) => {
    if (!isYoutubeURL(urlString)) return false;
    const id = getYoutubeIdFromURL(urlString);
    return await yts({ videoId: id });
};

export const getYoutubePlaylist = async (urlString) => {
    if (!isYoutubePlaylistURL(urlString)) return false;
    const url = new URL(urlString);
    const id = url.searchParams.get('list');
    return await yts({ listId: id });
};

export const getYoutubeInfoBySearch = async (keyword) => {
    const result = await yts(keyword);
    return result.videos[0];
};
