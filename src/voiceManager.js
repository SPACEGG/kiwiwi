import { once } from 'events';
import { joinVoiceChannel, VoiceConnectionStatus, entersState } from '@discordjs/voice';
import { KiwiwiPlayer } from '#src/kiwiwiPlayer.js';
import { getKiwiwiDisplay } from '#src/kiwiwiDisplay.js';

export class VoiceManager {
    constructor(voiceChannel) {
        this.voiceChannel = voiceChannel;
        this.connection = null;
        this.ready = false;
        this.kiwiwiPlayer = null;
    }

    initConnection() {
        this.connection.once(VoiceConnectionStatus.Ready, async () => {
            // this.kiwiwiPlayer = new KiwiwiPlayer(
            //     this.voiceChannel.guild,
            //     await getKiwiwiDisplay(this.voiceChannel.guild)
            // );
            // this.ready = true;
            // this.connection.subscribe(this.kiwiwiPlayer.player);
        });

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
                this.kiwiwiPlayer = new KiwiwiPlayer(this.voiceChannel.guild, res);
                this.ready = true;
                this.connection.subscribe(this.kiwiwiPlayer.player);
                resolve();
            });
        });
    }

    destroy() {
        this.kiwiwiPlayer.stop();
        this.kiwiwiPlayer.clear();
        this.connection.destroy();
    }
}
