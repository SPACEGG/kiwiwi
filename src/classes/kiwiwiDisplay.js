import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { secToString } from '#src/utils.js';
import config from '#src/config.js';

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

export const baseButtonComponents = (isPlaying) => {
    const back = new ButtonBuilder()
        .setCustomId('back')
        .setLabel('⇦')
        .setStyle(ButtonStyle.Primary);
    const playPause = isPlaying
        ? new ButtonBuilder()
              .setCustomId('pause')
              .setLabel('◫')
              .setStyle(ButtonStyle.Primary)
        : new ButtonBuilder()
              .setCustomId('resume')
              .setLabel('▶')
              .setStyle(ButtonStyle.Primary);
    const next = new ButtonBuilder()
        .setCustomId('skip')
        .setLabel('⇨')
        .setStyle(ButtonStyle.Primary);
    const leave = new ButtonBuilder()
        .setCustomId('leave')
        .setLabel('■')
        .setStyle(ButtonStyle.Danger);
    const shuffle = new ButtonBuilder()
        .setCustomId('shuffle')
        .setLabel('⇌')
        .setStyle(ButtonStyle.Secondary);
    const loop = new ButtonBuilder()
        .setCustomId('loop')
        .setLabel('↻')
        .setStyle(ButtonStyle.Secondary);
    const row1 = new ActionRowBuilder().addComponents(back, playPause, next);
    const row2 = new ActionRowBuilder().addComponents(leave, shuffle, loop);

    return [row1, row2];
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
        SLEEP: { emoji: '💤', text: '  Leaving in 5 minutes...' },
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
