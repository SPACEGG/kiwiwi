import { once, EventEmitter } from 'events';
import { joinVoiceChannel, VoiceConnectionStatus, entersState } from '@discordjs/voice';
import { KiwiwiPlayer } from '#src/classes/kiwiwiPlayer.js';
import { getKiwiwiDisplay } from '#src/queue/displayQueue.js';
import config from '#src/config.js';

export class VoiceManager {
    constructor(voiceChannel) {
        this.voiceChannel = voiceChannel;
        this.connection = null;
        this.ready = false;
        this.kiwiwiPlayer = null;
        this.event = new EventEmitter();
        this.connected = false;
        this.destroyed = false;
        this.isCountdown = false;
        this.countdownSchedule = null;
    }

    initConnection() {
        this.connection.once(VoiceConnectionStatus.Ready, async () => {});

        // reconnect
        this.connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await Promise.race([
                    entersState(this.connection, VoiceConnectionStatus.Signalling, 5_000),
                    entersState(this.connection, VoiceConnectionStatus.Connecting, 5_000),
                ]);
            } catch (error) {
                this.destroy();
            }
        });

        return once(this.connection, VoiceConnectionStatus.Ready);
    }

    async connect() {
        this.connection = joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.voiceChannel.guild.id,
            adapterCreator: this.voiceChannel.guild.voiceAdapterCreator,
        });
        await this.initConnection();
        return new Promise((resolve) => {
            getKiwiwiDisplay(this.voiceChannel.guild).then((res) => {
                this.kiwiwiPlayer = new KiwiwiPlayer(this.voiceChannel.guild, res, this);
                this.ready = true;
                this.connection.subscribe(this.kiwiwiPlayer.player);
                this.connected = true;
                this.destroyed = false;
                this.event.emit('connected');
                resolve();
            });
        });
    }

    async waitForConnect() {
        if (this.connected) return;
        return once(this.event, 'connected');
    }

    async reconnect(channel) {
        this.voiceChannel = channel;
        this.connection = joinVoiceChannel({
            channelId: this.voiceChannel.id,
            guildId: this.voiceChannel.guild.id,
            adapterCreator: this.voiceChannel.guild.voiceAdapterCreator,
        });
        await this.initConnection();
        return new Promise((resolve) => {
            getKiwiwiDisplay(this.voiceChannel.guild).then(() => {
                this.kiwiwiPlayer.reload(this);
                this.ready = true;
                this.connection.subscribe(this.kiwiwiPlayer.player);
                this.connected = true;
                this.destroyed = false;
                this.event.emit('connected');
                resolve();
            });
        });
    }

    destroy() {
        this.kiwiwiPlayer.stop();
        this.kiwiwiPlayer.clear();
        this.connection.destroy();
        this.resetCountdown();
        this.destroyed = true;
        this.connected = false;
    }

    close() {
        this.connection.destroy();
        this.resetCountdown();
        this.destroyed = true;
        this.connected = false;
    }

    startCountdown() {
        if (this.isCountdown) return;

        this.isCountdown = true;
        this.kiwiwiPlayer.pause();
        this.countdownSchedule = setInterval(() => {
            this.destroy();
        }, config.vmCountdownTimeout);
    }

    resetCountdown() {
        if (!this.isCountdown) return;

        this.isCountdown = false;
        this.kiwiwiPlayer.resume();
        clearInterval(this.countdownSchedule);
    }
}
