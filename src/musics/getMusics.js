import youtube from '#src/musics/youtube.js';
import youtubePlaylist from '#src/musics/youtubePlaylist.js';
import youtubeSearch from '#src/musics/youtubeSearch.js';
import soundcloud from '#src/musics/soundcloud.js';
import soundcloudSets from '#src/musics/soundcloudSets.js';
import bandcamp from '#src/musics/bandcamp.js';
import bandcampAlbum from '#src/musics/bandcampAlbum.js';
import spotify from '#src/musics/spotify.js';
import spotifyPlaylist from '#src/musics/spotifyPlaylist.js';

const MUSIC_INPUT_TYPE = {
    KEYWORD: 'keyword',
    YOUTUBE: 'youtube',
    YOUTUBE_PLAYLIST: 'youtube playlist',
    SOUNDCLOUD: 'soundcloud',
    SOUNDCLOUD_SETS: 'soundcloud sets',
    SPOTIFY: 'spotify',
    SPOTIFY_PLAYLIST: 'spotify playlist',
    BANDCAMP: 'bandcamp',
    BANDCAMP_ALBUM: 'bandcamp album',
};

const getMusicInputType = (input) => {
    const youtubePattern =
        /https?:\/\/([a-zA-Z0-9-]+\.)*youtube\.com(?!\/playlist)(\/.*)?|https?:\/\/youtu\.be(?!\/playlist)(\/.*)?/;
    const youtubePlaylistPattern =
        /https?:\/\/([a-zA-Z0-9-]+\.)*youtube\.com\/playlist(\/.*)?/;
    const spotifyPattern = /https?:\/\/open\.spotify\.com\/track(\/.*)?/;
    const spotifyPlaylistPattern =
        /https?:\/\/open\.spotify\.com\/(playlist|album)(\/.*)?/;
    const soundcloudPattern =
        /https?:\/\/([a-zA-Z0-9-]+\.)*soundcloud\.com\/[a-zA-Z0-9-_]+\/(?!sets)[a-zA-Z0-9-_]+/;
    const soundcloudSetsPattern =
        /https?:\/\/soundcloud\.com\/[a-zA-Z0-9-_]+\/sets\/[a-zA-Z0-9-_]+/;
    const bandcampPattern =
        /https?:\/\/([a-zA-Z0-9-]+\.)*bandcamp\.com\/track\/[a-zA-Z0-9-_]+/;
    const bandcampAlbumPattern =
        /https?:\/\/([a-zA-Z0-9-]+\.)*bandcamp\.com\/album\/[a-zA-Z0-9-_]+/;

    if (input.match(youtubePattern)) return MUSIC_INPUT_TYPE.YOUTUBE;
    if (input.match(youtubePlaylistPattern)) return MUSIC_INPUT_TYPE.YOUTUBE_PLAYLIST;
    if (input.match(soundcloudPattern)) return MUSIC_INPUT_TYPE.SOUNDCLOUD;
    if (input.match(soundcloudSetsPattern)) return MUSIC_INPUT_TYPE.SOUNDCLOUD_SETS;
    if (input.match(bandcampPattern)) return MUSIC_INPUT_TYPE.BANDCAMP;
    if (input.match(bandcampAlbumPattern)) return MUSIC_INPUT_TYPE.BANDCAMP_ALBUM;
    if (input.match(spotifyPattern)) return MUSIC_INPUT_TYPE.SPOTIFY;
    if (input.match(spotifyPlaylistPattern)) return MUSIC_INPUT_TYPE.SPOTIFY_PLAYLIST;

    return MUSIC_INPUT_TYPE.KEYWORD;
};

// multiple urls line input
export default async (text, channelInput) => {
    const userId = channelInput.author?.id ?? channelInput.user.id;
    const channelId = channelInput.member.voice.channel.id;
    const splitedKeywords = text.split('\n');
    return (
        await Promise.all(
            splitedKeywords.map(
                async (keyword) => await music(keyword, userId, channelId)
            )
        )
    ).flat();
};

const music = async (keyword, userId, channelId) => {
    switch (getMusicInputType(keyword)) {
        case MUSIC_INPUT_TYPE.YOUTUBE: {
            const info = await youtube(keyword);
            return [
                {
                    ...info,
                    userId,
                    channelId,
                },
            ];
        }
        case MUSIC_INPUT_TYPE.YOUTUBE_PLAYLIST: {
            const entries = await youtubePlaylist(keyword);
            return entries.map((i) => {
                return {
                    ...i,
                    userId,
                    channelId,
                };
            });
        }
        case MUSIC_INPUT_TYPE.SOUNDCLOUD: {
            const info = await soundcloud(keyword);
            return [
                {
                    ...info,
                    userId,
                    channelId,
                },
            ];
        }
        case MUSIC_INPUT_TYPE.SOUNDCLOUD_SETS: {
            const entries = await soundcloudSets(keyword);
            return entries.map((i) => {
                return {
                    ...i,
                    userId,
                    channelId,
                };
            });
        }
        case MUSIC_INPUT_TYPE.BANDCAMP: {
            const info = await bandcamp(keyword);
            return [
                {
                    ...info,
                    userId,
                    channelId,
                },
            ];
        }
        case MUSIC_INPUT_TYPE.BANDCAMP_ALBUM: {
            const entries = await bandcampAlbum(keyword);
            return entries.map((i) => {
                return {
                    ...i,
                    userId,
                    channelId,
                };
            });
        }
        case MUSIC_INPUT_TYPE.SPOTIFY: {
            const info = await spotify(keyword);
            return [
                {
                    ...info,
                    userId,
                    channelId,
                },
            ];
        }
        case MUSIC_INPUT_TYPE.SPOTIFY_PLAYLIST: {
            const entries = await spotifyPlaylist(keyword);
            return entries.map((i) => {
                return {
                    ...i,
                    userId,
                    channelId,
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
                    channelId,
                },
            ];
        }
    }
};
