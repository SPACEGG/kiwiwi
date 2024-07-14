import db from '#src/database.js';
import { displayQueue } from '#src/queue.js';
import { secToString } from '#src/utils.js';
import config from '#src/config.js';

export const initKiwiwiDisplay = async (guild, channel) => {
    const display = new KiwiwiDisplay(channel);
    await display.initMessage();

    displayQueue[guild.id] = display;

    await db.home.create({
        guild_id: guild.id,
        channel_id: channel.id,
        kiwiwi_player_id: display.message.id,
    });
    return display;
};

export const getKiwiwiDisplay = async (guild) => {
    if (displayQueue[guild.id]) return displayQueue[guild.id];

    const home = await db.home.findOne({ where: { guild_id: guild.id } });
    if (!home) throw 'Kiwiwi Home Channel is not Initialized!';
    const homeChannel = await guild.channels.fetch(home.channel_id);
    try {
        const msg = await homeChannel.messages.fetch(home.kiwiwi_player_id);
        const display = new KiwiwiDisplay(homeChannel, msg);
        displayQueue[guild.id] = display;
        return display;
    } catch (e) {
        console.log(`message not found: ${home.kiwiwi_player_id}\n\t${e}`);
        const display = new KiwiwiDisplay(homeChannel);
        await display.initMessage();
        await db.home.update(
            {
                kiwiwi_player_id: display.message.id,
            },
            { where: { guild_id: guild.id } }
        );
        displayQueue[guild.id] = display;
        return display;
    }
};

export const setKiwiwiDisplay = async (guild, display) => {
    const home = await db.home.findOne({ where: { guild_id: guild.id } });

    if (home.channel_id !== display.channel.id) {
        throw 'Invalid display channel';
    }
    displayQueue[guild.id] = display;
};

// --------------------------------------------------

export const baseStatusContent = (
    text,
    status
) => `┌────────────────────────────────┐ ${status}
│    __    _        _        _   │  ${status}
│   / /__ (_)    __(_)    __(_)  │   ${status}
│  /  '_// / |/|/ / / |/|/ / /   └────┐
│ /_/\\_\\/_/|__,__/_/|__,__/_/${('v' + config.version).padStart(9, ' ')}│
├─────────────────────────────────────┤
│${text.padEnd(37, ' ')}│
└─────────────────────────────────────┘`;

export const basePlaylistContent = (prev, curr, next) => {
    let sc = ` ═══════════════PLAYLIST═══════════════`;
    for (let i of prev) {
        sc += `\n\u001b[0;30m   ${i.padEnd(37, ' ').slice(0, 35)}\u001b[0m\u001b[0;32m`;
    }
    sc += `\n\u001b[0;40;37m > ${curr.padEnd(37, ' ').slice(0, 35)}\u001b[0m\u001b[0;32m`;
    let index = 1;
    for (let i of next) {
        sc += `\n\u001b[0;36m ${index++} ${i
            .padEnd(37, ' ')
            .slice(0, 35)}\u001b[0m\u001b[0;32m`;
    }
    return sc;
};

export const basePlayerEmbed = (info) => {
    const playingText = info.isPlaying ? '음악을 듣고 있어요' : '음악을 잠시 멈췄어요';
    return {
        title: `${config.name}가 <#${info.channelId}>에서 ${playingText} 🎵`,
        description: `지금 재생 중 - [${info.title}](${info.link})`,
        fields: [
            {
                name: '신청자',
                value: `<@${info.userId}>`,
                inline: true,
            },
            {
                name: '대기열 수',
                value: `\`${info.playlistLeft}개\``,
                inline: true,
            },
            {
                name: '대기열 시간',
                value: `\`${secToString(info.remainSec)}\``,
                inline: true,
            },
            {
                name: '반복모드',
                value: `\`${info.playMode}\``,
                inline: true,
            },
        ],
        color: config.kiwiGreen,
        thumbnail: {
            url: info.thumbnail,
        },
        footer: {
            text: `${config.name} - v${config.version}`,
        },
    };
};

export const musicProgress = (current, length) => {
    const progress = Math.ceil((current / length) * 25);
    return `${secToString(current).padEnd(5, ' ')}|\u001b[0;40;37m${'·'.repeat(
        progress - 1 < 0 ? 0 : progress - 1
    )}${'♪'.repeat(progress - 1 < 0 ? 0 : 1)}\u001b[0;46m${' '.repeat(
        25 - progress
    )}\u001b[0m\u001b[0;32m|${secToString(length).padStart(5, ' ')}`;
};

// --------------------------------------------------

export class KiwiwiDisplay {
    static status = {
        IDLE: { emoji: '🥝', text: '  Waiting for music links...' },
        PLAYING: { emoji: '💚', text: '' },
        SLEEP: { emoji: '💤', text: '  kiwiwi is sleeping...' },
        UNHEALTHY: { emoji: '💥', text: '  kiwiwi is not available...' },
    };

    constructor(ch, msg) {
        this.status = KiwiwiDisplay.status.IDLE;
        this.channel = ch;
        this.message = msg;
        this.statusContent = baseStatusContent(this.status.text, this.status.emoji);
        this.playlistContent = '';
        this.playerEmbeds = [];
        this.buttonComponents = [];
    }

    clear() {
        this.statusContent = baseStatusContent(this.status.text, this.status.emoji);
        this.playerEmbeds = [];
        this.buttonComponents = [];
        this.playlistContent = '';
    }

    async initMessage() {
        this.message = await this.channel.send({
            content:
                '```ansi\n\u001b[0;32m' +
                this.statusContent +
                '\n' +
                this.playlistContent +
                '```',
            embeds: this.playerEmbeds,
            components: this.buttonComponents,
        });
    }

    async moveChannel(newChannel) {
        this.message.delete();
        this.channel = newChannel;
        await this.initMessage();
    }

    update() {
        this.message.edit({
            content:
                '```ansi\n\u001b[0;32m' +
                this.statusContent +
                '\n' +
                this.playlistContent +
                '```',
            embeds: this.playerEmbeds,
            components: this.buttonComponents,
        });
    }
}
