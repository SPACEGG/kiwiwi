import { once, EventEmitter } from 'events';
import { joinVoiceChannel, VoiceConnectionStatus, entersState, VoiceConnection } from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';
import { KiwiwiPlayer } from '#src/classes/kiwiwiPlayer.js';
import { getKiwiwiDisplay } from '#src/queue/displayQueue.js';
import config from '#src/config.js';

/**
 * Class managing voice channel connections and the player lifecycle.
 */
export class VoiceManager {
    /**
     * Creates a VoiceManager.
     * @param {VoiceChannel} voiceChannel - The voice channel to connect to.
     */
    constructor(voiceChannel) {
        /** @type {VoiceChannel} */
        this.voiceChannel = voiceChannel;
        /** @type {VoiceConnection} */
        this.connection = null;
        /** @type {boolean} */
        this.ready = false;
        /** @type {KiwiwiPlayer} */
        this.kiwiwiPlayer = null;
        /** @type {EventEmitter} */
        this.event = new EventEmitter();
        /** @type {boolean} */
        this.connected = false;
        /** @type {boolean} */
        this.destroyed = false;
        /** @type {boolean} */
        this.isCountdown = false;
        /** @type {NodeJS.Timeout} */
        this.countdownSchedule = null;
    }

    /**
     * Initializes the voice connection listeners.
     * @returns {Promise<any[]>}
     */
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

    /**
     * Connects to the voice channel.
     * @returns {Promise<void>}
     */
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

    /**
     * Waits until the connection is established.
     * @returns {Promise<any[]>|void}
     */
    async waitForConnect() {
        if (this.connected) return;
        return once(this.event, 'connected');
    }

    /**
     * Reconnects to a voice channel.
     * @param {VoiceChannel} channel - The new voice channel to connect to.
     * @returns {Promise<void>}
     */
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

    /**
     * Completely destroys the player and the connection.
     */
    destroy() {
        this.kiwiwiPlayer.stop();
        this.kiwiwiPlayer.clear();
        this.connection.destroy();
        this.resetCountdown();
        this.destroyed = true;
        this.connected = false;
    }

    /**
     * Closes the connection.
     */
    close() {
        this.connection.destroy();
        this.resetCountdown();
        this.destroyed = true;
        this.connected = false;
    }

    /**
     * Starts the idle countdown timer.
     */
    startCountdown() {
        if (this.isCountdown || !this.ready || !this.kiwiwiPlayer) return;

        this.isCountdown = true;
        try {
            this.kiwiwiPlayer.pause();
            this.countdownSchedule = setInterval(() => {
                this.destroy();
            }, config.vmCountdownTimeout);
        } catch (e) {
            this.isCountdown = false;
        }
    }

    /**
     * Resets the idle countdown timer.
     */
    resetCountdown() {
        if (!this.isCountdown) return;

        this.isCountdown = false;
        this.kiwiwiPlayer.resume();
        clearInterval(this.countdownSchedule);
    }
}
