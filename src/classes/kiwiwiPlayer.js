import {
    createAudioPlayer,
    AudioPlayerStatus,
    createAudioResource,
    AudioPlayer,
    AudioResource,
} from '@discordjs/voice';
import { Guild } from 'discord.js';
import logger from '#src/logger.js';
import {
    KiwiwiDisplay,
    baseStatusContent,
    basePlayerEmbed,
    basePlaylistContent,
    baseButtonComponents,
    musicProgress,
} from '#src/classes/kiwiwiDisplay.js';
import { errorEmbed } from '#src/embeds.js';
import config from '#src/config.js';

/**
 * @typedef {Object} Music
 * @property {string} link - The URL of the track.
 * @property {function(): Promise<import('stream').Readable & {process: import('child_process').ChildProcess}>} audio - Function that returns the audio stream with its process.
 * @property {string} title - Track title.
 * @property {string} thumbnail - Track thumbnail URL.
 * @property {number} duration - Track duration in seconds.
 * @property {string} userId - ID of the user who added the track.
 * @property {string} channelId - ID of the channel where the track was added.
 * @property {AudioResource} [resource] - Pre-loaded audio resource.
 */

/**
 * Class managing music playback and queue logic.
 */
export class KiwiwiPlayer {
    /** @type {Object.<string, string>} */
    static repeatMode = {
        NONE: 'none',
        ONE: 'music',
        ALL: 'playlist',
    };
    /** @type {Object.<string, string>} */
    static status = {
        IDLE: 'idle',
        PLAYING: 'playing',
        PAUSED: 'paused',
    };

    /**
     * Creates a KiwiwiPlayer.
     * @param {Guild} guild - The Discord guild.
     * @param {KiwiwiDisplay} display - The display manager instance.
     * @param {import('./voiceManager.js').VoiceManager} vm - The VoiceManager instance.
     */
    constructor(guild, display, vm) {
        /** @type {AudioPlayer} */
        this.player = createAudioPlayer();
        /** @type {Music[]} */
        this.playlist = [];
        /** @type {Music[]} */
        this.playedlist = [];
        /** @type {Guild} */
        this.guild = guild;
        /** @type {KiwiwiDisplay} */
        this.display = display;
        /** @type {AudioResource} */
        this.resource = undefined;
        /** @type {AudioResource} */
        this.nextResource = undefined;
        /** @type {string} */
        this.playMode = KiwiwiPlayer.repeatMode.NONE;
        /** @type {string} */
        this.playstatus = KiwiwiPlayer.status.IDLE;
        /** @type {import('./voiceManager.js').VoiceManager} */
        this.vm = vm;
        /** @type {number} */
        this.playlistDuration = 0;
        /** @type {boolean} */
        this.playLock = false;

        this.initPlayer();
    }

    /**
     * Initializes player event listeners.
     */
    initPlayer() {
        // next play
        this.player.on(AudioPlayerStatus.Idle, async () => {
            // check playmode
            if (this.playMode === KiwiwiPlayer.repeatMode.ONE) {
                this.playlistDuration += this.playlist[0].duration;
                this.playlist.unshift(this.playlist[0]);
            } else if (this.playMode === KiwiwiPlayer.repeatMode.ALL) {
                this.playlistDuration += this.playlist[0].duration;
                this.playlist.push(this.playlist[0]);
            }

            this.next();

            // if playlist empty
            if (!this.playlist[0]) {
                this.idle();
                this.vm.startCountdown();
            } else {
                this.play();
            }
        });

        // error
        this.player.on('error', (e) => {
            logger.error(`KiwiwiPlayerError: ${e}`);
            this.display.sendMessage(
                errorEmbed(
                    `재생 중 오류가 발생하여 다음 음악으로 넘겼어요:\nKiwiwiPlayerError: ${e}`
                )
            );
            this.next();
            this.play();
        });
    }

    /**
     * Reloads the player instance.
     * @param {import('./voiceManager.js').VoiceManager} vm - The VoiceManager instance.
     */
    reload(vm) {
        this.player = createAudioPlayer();
        this.vm = vm;
        this.initPlayer();
    }

    /**
     * Retrieves an audio resource for a track.
     * @param {Music} music - The music object.
     * @returns {Promise<AudioResource|boolean>} The audio resource or false on failure.
     */
    async getResource(music) {
        try {
            const stream = await music.audio();
            return createAudioResource(stream);
        } catch (e) {
            return false;
        }
    }

    /**
     * Adds tracks to the queue.
     * @param {Music[]} musics - Array of music objects to add.
     */
    add(musics) {
        this.playlist.push(...musics);
        musics.forEach((m) => (this.playlistDuration += m.duration));

        this.setPlaylistContent();
        this.setPlayerEmbed();

        if (this.playstatus === KiwiwiPlayer.status.IDLE) {
            this.play();
        }
    }

    /**
     * Starts or resumes playback.
     * @returns {Promise<boolean>}
     */
    async play() {
        if (this.playLock) return;
        this.playLock = true;

        const nowPlaying = this.playlist[0];
        if (!nowPlaying) {
            this.idle();
            this.vm.startCountdown();
            this.playLock = false;
            return false;
        }

        // Kill previous process if exists
        if (this.resource?.playStream?.process) {
            try {
                this.resource.playStream.process.kill();
            } catch (e) {
                /* already dead */
            }
        }

        // get music resource (Always fetch a fresh stream URL)
        this.resource = await this.getResource(nowPlaying);

        // check resource
        if (!this.resource) {
            this.player.emit('error', `Unavailable resource: ${nowPlaying.link}`);
            this.playLock = false;
            return false;
        }

        // play resource
        try {
            this.player.play(this.resource);
        } catch {
            this.player.emit('error', `Resource play failed: ${nowPlaying.link}`);
            this.playLock = false;
            return false;
        }

        // update display - playlist
        this.setPlaylistContent();

        // update display - buttonComponents
        this.display.buttonComponents = baseButtonComponents(true);

        // update display - progress
        this.display.statusContent = baseStatusContent(
            musicProgress(0, nowPlaying.duration),
            KiwiwiDisplay.status.PLAYING.emoji
        );

        // update display - playerEmbeds
        this.display.status = KiwiwiDisplay.status.PLAYING;
        this.playstatus = KiwiwiPlayer.status.PLAYING;
        this.setPlayerEmbed();

        // set updateSchedule
        this.setSchedule();
        this.vm.resetCountdown();

        this.playLock = false;
    }

    /**
     * Stops playback and clears resources.
     */
    stop() {
        if (this.resource?.playStream?.process) {
            try {
                this.resource.playStream.process.kill();
            } catch (e) {
                /* already dead */
            }
        }
        this.player.stop();
        this.display.status = KiwiwiDisplay.status.IDLE;
        this.resetSchedule();
        this.display.clear();
        this.display.update();
    }

    /**
     * Sets the player to idle state.
     */
    idle() {
        this.playstatus = KiwiwiPlayer.status.IDLE;
        this.display.status = KiwiwiDisplay.status.SLEEP;
        this.resetSchedule();
        this.display.clear();
        this.setPlaylistContent();
        this.display.update();
    }

    /**
     * Pauses playback.
     */
    pause() {
        if (this.player.state.status === AudioPlayerStatus.Playing) {
            this.player.pause();

            this.playstatus = KiwiwiPlayer.status.PAUSED;
            this.setPlayerEmbed();
            this.display.buttonComponents = baseButtonComponents(false);
        }
    }

    /**
     * Resumes playback.
     */
    resume() {
        if (this.player.state.status === AudioPlayerStatus.Paused) {
            this.player.unpause();
            this.playstatus = KiwiwiPlayer.status.PLAYING;
            this.setPlayerEmbed();
            this.display.buttonComponents = baseButtonComponents(true);
        }
    }

    /**
     * Skips tracks in the queue.
     * @param {number} [index=1] - Number of tracks to skip.
     */
    skip(index = 1) {
        this.playedlist.unshift(this.playlist[0]);
        if (this.playedlist.length > config.maxPlaylistBackup) {
            this.playedlist.pop();
        }

        const skipped = this.playlist.slice(0, index);
        skipped.forEach((m) => (this.playlistDuration -= m.duration));

        this.playlist = this.playlist.slice(index);
        this.play();
    }

    /**
     * Removes a track from the queue.
     * @param {number} [index=this.playlist.length - 1] - Index of the track to remove.
     */
    remove(index = this.playlist.length - 1) {
        this.playlistDuration -= this.playlist[index].duration;
        this.playlist.splice(index, 1);
        this.setPlaylistContent();
        this.setPlayerEmbed();
    }

    /**
     * Advances to the next track without starting playback.
     */
    next() {
        this.playedlist.unshift(this.playlist[0]);
        if (this.playedlist.length > config.maxPlaylistBackup) {
            this.playedlist.pop();
        }
        this.playlistDuration -= this.playlist[0]?.duration ?? 0;
        this.playlist.shift();
    }

    /**
     * Goes back to the previous track.
     * @returns {Promise<boolean>}
     */
    async back() {
        if (this.playedlist.length === 0) return false;
        this.playlist.unshift(this.playedlist[0]);
        this.playlistDuration += this.playedlist[0].duration;
        this.playedlist.shift();

        this.playlist[0].resource = await this.getResource(this.playlist[0]);

        this.play();
        return true;
    }

    /**
     * Shuffles the current queue.
     */
    shuffle() {
        const first = this.playlist[0];
        this.playlist.shift();
        for (let i = this.playlist.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
        }
        this.playlist.unshift(first);

        this.setPlaylistContent();
        this.setPlayerEmbed();
    }

    /**
     * Sets the repeat mode.
     * @param {string} mode - The repeat mode to set.
     */
    repeat(mode) {
        this.playMode = mode;

        this.setPlayerEmbed();
    }

    /**
     * Clears the playlist and played history.
     */
    clear() {
        this.playlist = [];
        this.playedlist = [];
        this.playlistDuration = 0;
    }

    /**
     * Updates the playlist text content for display.
     */
    setPlaylistContent() {
        try {
            // playedlist*3 + playlist*10
            const prev = this.playedlist
                .slice(0, 3)
                .reverse()
                .map((i) => i.title);
            const current = this.playlist[0]?.title ?? '';
            const next = this.playlist.slice(1, 10).map((i) => i.title);
            this.display.playlistContent = basePlaylistContent(prev, current, next);
        } catch (e) {
            logger.error(`KiwiwiPlayerPlaylistError: ${e}`);
        }
    }

    /**
     * Updates the player embed for display.
     */
    setPlayerEmbed() {
        this.display.playerEmbeds = [
            basePlayerEmbed({
                ...this.playlist[0],
                channelId: this.vm.voiceChannel.id,
                isPlaying: this.playstatus === KiwiwiPlayer.status.PLAYING,
                playlistLeft: this.playlist.length - 1,
                remainSec: this.playlistDuration,
                playMode: this.playMode,
            }),
        ];
    }

    /**
     * Starts the periodic UI update schedule.
     */
    setSchedule() {
        this.updateSchedule =
            this.updateSchedule ??
            setInterval(() => {
                if (!this.playlist[0]) return;

                this.display.statusContent = baseStatusContent(
                    musicProgress(
                        Math.round(this.resource.playbackDuration / 1000),
                        this.playlist[0].duration
                    ),
                    KiwiwiDisplay.status.PLAYING.emoji
                );
                this.display.update();
            }, config.scheduleDuration);
    }

    /**
     * Stops the periodic UI update schedule.
     */
    resetSchedule() {
        clearInterval(this.updateSchedule);
        this.updateSchedule = null;
    }
}
