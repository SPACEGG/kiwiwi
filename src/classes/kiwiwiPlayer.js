import {
    createAudioPlayer,
    AudioPlayerStatus,
    createAudioResource,
} from '@discordjs/voice';
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

export class KiwiwiPlayer {
    static repeatMode = {
        NONE: 'none',
        ONE: 'music',
        ALL: 'playlist',
    };
    static status = {
        IDLE: 'idle',
        PLAYING: 'playing',
        PAUSED: 'paused',
    };
    constructor(guild, display, vm) {
        this.player = createAudioPlayer();
        this.playlist = [];
        this.playedlist = [];
        this.guild = guild;
        this.display = display;
        this.resource = undefined;
        this.nextResource = undefined;
        this.playMode = KiwiwiPlayer.repeatMode.NONE;
        this.playstatus = KiwiwiPlayer.status.IDLE;
        this.vm = vm;

        this.initPlayer();
    }

    initPlayer() {
        // next play
        this.player.on(AudioPlayerStatus.Idle, async () => {
            // check playmode
            if (this.playMode === KiwiwiPlayer.repeatMode.ONE) {
                this.playlist.unshift(this.playlist[0]);
            } else if (this.playMode === KiwiwiPlayer.repeatMode.ALL) {
                this.add(this.playlist[0]);
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

    reload(vm) {
        this.player = createAudioPlayer();
        this.vm = vm;
        this.initPlayer();
    }

    async getResource(music) {
        try {
            const stream = await music.audio();
            return createAudioResource(stream);
        } catch (e) {
            return false;
        }
    }

    add(musics) {
        this.playlist.push(...musics);

        this.setPlaylistContent();
        this.setPlayerEmbed();

        if (this.playstatus === KiwiwiPlayer.status.IDLE) {
            this.play();
        }
    }

    async play() {
        const nowPlaying = this.playlist[0];
        if (!nowPlaying) {
            this.idle();
            this.vm.startCountdown();
            return false;
        }
        // get music resource
        this.resource = nowPlaying.resource ?? (await this.getResource(nowPlaying));
        // check resource
        if (!this.resource) {
            this.player.emit('error', `Unavailable resource: ${nowPlaying.link}`);
            return false;
        }
        // play resource
        try {
            this.player.play(this.resource);
        } catch {
            this.player.emit('error', `Resource play failed: ${nowPlaying.link}`);
            return false;
        }
        // get next music resource
        if (this.playlist[1]) {
            this.playlist[1].resource = await this.getResource(this.playlist[1]);
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
    }

    stop() {
        this.player.stop();
        this.display.status = KiwiwiDisplay.status.IDLE;
        this.resetSchedule();
        this.display.clear();
        this.display.update();
    }

    idle() {
        this.playstatus = KiwiwiPlayer.status.IDLE;
        this.display.status = KiwiwiDisplay.status.SLEEP;
        this.resetSchedule();
        this.display.clear();
        this.setPlaylistContent();
        this.display.update();
    }

    pause() {
        if (this.player.state.status === AudioPlayerStatus.Playing) {
            this.player.pause();

            this.playstatus = KiwiwiPlayer.status.PAUSED;
            this.setPlayerEmbed();
            this.display.buttonComponents = baseButtonComponents(false);
        }
    }

    resume() {
        if (this.player.state.status === AudioPlayerStatus.Paused) {
            this.player.unpause();
            this.playstatus = KiwiwiPlayer.status.PLAYING;
            this.setPlayerEmbed();
            this.display.buttonComponents = baseButtonComponents(true);
        }
    }

    skip(index = 1) {
        this.playedlist.unshift(this.playlist[0]);
        if (this.playedlist.length > config.maxPlaylistBackup) {
            this.playedlist.pop();
        }
        this.playlist = this.playlist.slice(index);
        this.play();
    }

    remove(index = this.playlist.length - 1) {
        this.playlist.splice(index, 1);
        this.setPlaylistContent();
        this.setPlayerEmbed();
    }

    next() {
        this.playedlist.unshift(this.playlist[0]);
        if (this.playedlist.length > config.maxPlaylistBackup) {
            this.playedlist.pop();
        }
        this.playlist.shift();
    }

    async back() {
        if (this.playedlist.length === 0) return false;
        this.playlist.unshift(this.playedlist[0]);
        this.playedlist.shift();

        this.playlist[0].resource = await this.getResource(this.playlist[0]);

        this.play();
        return true;
    }

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

    repeat(mode) {
        this.playMode = mode;

        this.setPlayerEmbed();
    }

    clear() {
        this.playlist = [];
        this.playedlist = [];
    }

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

    setPlayerEmbed() {
        const remainSec = this.playlist.reduce((acc, cur) => acc + cur.duration, 0);
        this.display.playerEmbeds = [
            basePlayerEmbed({
                ...this.playlist[0],
                isPlaying: this.playstatus === KiwiwiPlayer.status.PLAYING,
                playlistLeft: this.playlist.length - 1,
                remainSec: remainSec,
                playMode: this.playMode,
            }),
        ];
    }

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

    resetSchedule() {
        clearInterval(this.updateSchedule);
        this.updateSchedule = null;
    }
}
