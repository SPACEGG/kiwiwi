import {
    createAudioPlayer,
    AudioPlayerStatus,
    createAudioResource,
} from '@discordjs/voice';
// import ytdl from 'ytdl-core';
import yt from '#src/yt.js';
import {
    KiwiwiDisplay,
    baseStatusContent,
    basePlayerEmbed,
    basePlaylistContent,
    musicProgress,
} from '#src/kiwiwiDisplay.js';
import config from '#src/config.js';

export class KiwiwiPlayer {
    static repeatMode = {
        NONE: 'none',
        ONE: 'music',
        ALL: 'playlist',
    };
    constructor(guild, display) {
        this.player = createAudioPlayer();
        this.playlist = [];
        this.playedlist = [];
        this.guild = guild;
        this.display = display;
        this.resource = undefined;
        this.playMode = KiwiwiPlayer.repeatMode.NONE;
        this.playstatus = 'IDLE';

        this.initPlayer();
    }

    initPlayer() {
        // next play
        this.player.on(AudioPlayerStatus.Idle, async () => {
            // if (oldState.status !== AudioPlayerStatus.Playing) return;

            // check playmode
            if (this.playMode === KiwiwiPlayer.repeatMode.ONE) {
                this.playlist.unshift(this.playlist[0]);
            } else if (this.playMode === KiwiwiPlayer.repeatMode.ALL) {
                this.add(this.playlist[0]);
            }

            this.next();
            this.play();
        });

        // error
        this.player.on('error', (e) => {
            // TODO: display: e.message
            console.error(e);
            this.next();
            this.play();
        });
    }

    async getResource(music) {
        try {
            const ytInfo = await yt(music.link);
            return createAudioResource((await fetch(ytInfo.audio)).body);
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    add(links) {
        this.playlist.push(...links);

        this.setPlaylistContent();
        this.setPlayerEmbed();
        this.display.update();
    }

    async play() {
        // if playlist empty
        if (!this.playlist[0]) {
            this.stop();
            return false;
        }

        // get music resource
        this.resource =
            this.playlist[0].resource ?? (await this.getResource(this.playlist[0]));
        // check resource
        if (!this.resource) {
            this.player.emit('error', `Unavailable resource: ${this.playlist[0].link}`);
            return false;
        }
        // play resource
        this.player.play(this.resource);
        // get next music resource
        if (this.playlist[1]) {
            this.playlist[1].resource = await this.getResource(this.playlist[1]);
        }

        // update display - playlist
        this.setPlaylistContent();

        // update display - progress
        this.display.statusContent = baseStatusContent(
            musicProgress(0, this.playlist[0].duration),
            KiwiwiDisplay.status.PLAYING.emoji
        );

        // update display - playerEmbeds
        this.display.status = KiwiwiDisplay.status.PLAYING;
        this.playstatus = 'PLAYING';
        this.setPlayerEmbed();

        this.display.update();

        this.updateSchedule =
            this.updateSchedule ??
            setInterval(() => {
                this.display.statusContent = baseStatusContent(
                    musicProgress(
                        Math.round(this.resource.playbackDuration / 1000),
                        this.playlist[0].duration
                    ),
                    KiwiwiDisplay.status.PLAYING.emoji
                );
                this.display.update();
            }, config.scheduleDuration);
        return true;
    }

    stop() {
        this.player.stop();
        this.display.status = KiwiwiDisplay.status.IDLE;
        clearInterval(this.updateSchedule);
        this.updateSchedule = null;
        this.display.clear();
        this.display.update();
    }

    pause() {
        if (this.player.state.status === AudioPlayerStatus.Playing) {
            this.player.pause();

            this.playstatus = 'PAUSED';
            this.setPlayerEmbed();
            this.display.update();
        }
    }

    resume() {
        if (this.player.state.status === AudioPlayerStatus.Paused) {
            this.player.unpause();

            this.playstatus = 'PLAYING';
            this.setPlayerEmbed();
            this.display.update();
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

    next() {
        this.playedlist.unshift(this.playlist[0]);
        if (this.playedlist.length > config.maxPlaylistBackup) {
            this.playedlist.pop();
        }
        this.playlist.shift();
    }

    back() {
        if (this.playedlist.length === 0) return false;
        this.playlist.unshift(this.playedlist[0]);
        this.playedlist.shift();

        this.play();
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
        this.display.update();
    }

    repeat(mode) {
        this.playMode = mode;

        this.setPlayerEmbed();
        this.display.update();
    }

    clear() {
        this.playlist = [];
        this.playedlist = [];
    }

    setPlaylistContent() {
        // playedlist*3 + playlist*10
        const prev = this.playedlist
            .slice(0, 3)
            .reverse()
            .map((i) => i.title);
        const current = this.playlist[0].title;
        const next = this.playlist.slice(1, 10).map((i) => i.title);
        this.display.playlistContent = basePlaylistContent(prev, current, next);
    }

    setPlayerEmbed() {
        const remainSec = this.playlist.reduce((acc, cur) => acc + cur.duration, 0);
        this.display.playerEmbeds = [
            basePlayerEmbed({
                ...this.playlist[0],
                isPlaying: this.playstatus === 'PLAYING',
                playlistLeft: this.playlist.length - 1,
                remainSec: remainSec,
                playMode: this.playMode,
            }),
        ];
    }
}