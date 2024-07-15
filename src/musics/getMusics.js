// import { getMusicInputType, MUSIC_INPUT_TYPE } from '#src/utils.js';
import youtube from '#src/musics/youtube.js';
import youtubePlaylist from '#src/musics/youtubePlaylist.js';
import youtubeSearch from '#src/musics/youtubeSearch.js';

const MUSIC_INPUT_TYPE = {
    KEYWORD: 'keyword',
    YOUTUBE: 'youtube',
    YOUTUBE_PLAYLIST: 'youtube playlist',
    SOUNDCLOUD: 'soundcloud',
    SOUNDCLOUD_PLAYLIST: 'soundcloud playlist',
    SPOTIFY: 'spotify',
    SPOTIFY_PLAYLIST: 'spotify playlist',
};

const getMusicInputType = (input) => {
    const youtubePattern =
        /https?:\/\/([a-zA-Z0-9-]+\.)*youtube\.com(?!\/playlist)(\/.*)?|https?:\/\/youtu\.be(?!\/playlist)(\/.*)?/;
    const youtubePlaylistPattern =
        /https?:\/\/([a-zA-Z0-9-]+\.)*youtube\.com\/playlist(\/.*)?/;
    const spotifyPattern = /https?:\/\/open\.spotify\.com\/track(\/.*)?/;
    const spotifyPlaylistPattern =
        /https?:\/\/open\.spotify\.com\/(playlist|album)(\/.*)?/;
    const soundcloudPattern = /https?:\/\/([a-zA-Z0-9-]+\.)*soundcloud\.com\/\w+\/\w+/;

    if (input.match(youtubePattern)) return MUSIC_INPUT_TYPE.YOUTUBE;
    if (input.match(youtubePlaylistPattern)) return MUSIC_INPUT_TYPE.YOUTUBE_PLAYLIST;
    if (input.match(spotifyPattern)) return MUSIC_INPUT_TYPE.SPOTIFY;
    if (input.match(spotifyPlaylistPattern)) return MUSIC_INPUT_TYPE.SPOTIFY_PLAYLIST;
    if (input.match(soundcloudPattern)) return MUSIC_INPUT_TYPE.SOUNDCLOUD;

    return MUSIC_INPUT_TYPE.KEYWORD;
};

export default async (keyword, channelInput) => {
    const userId = channelInput.author?.id ?? channelInput.user.id;
    switch (getMusicInputType(keyword)) {
        case MUSIC_INPUT_TYPE.YOUTUBE: {
            const ytInfo = await youtube(keyword);
            return [
                {
                    ...ytInfo,
                    userId,
                    channelId: channelInput.member.voice.channel.id,
                },
            ];
        }
        case MUSIC_INPUT_TYPE.YOUTUBE_PLAYLIST: {
            const ytPlaylist = await youtubePlaylist(keyword);
            return await ytPlaylist.map((i) => {
                return {
                    ...i,
                    userId,
                    channelId: channelInput.member.voice.channel.id,
                };
            });
        }

        // MUSIC_INPUT_TYPE.KEYWORD
        default: {
            const info = await youtubeSearch(keyword);
            return [
                {
                    ...info,
                    userId,
                    channelId: channelInput.member.voice.channel.id,
                },
            ];
        }
    }
};
