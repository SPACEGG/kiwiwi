import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel, Message } from 'discord.js';
import { secToString } from '#src/utils.js';
import config from '#src/config.js';
import logger from '#src/logger.js';

/**
 * Returns the formatted base status ASCII art content.
 * @param {string} text - The status text to display.
 * @param {string} status - The status emoji or icon.
 * @returns {string} The ANSI formatted status string.
 */
export const baseStatusContent = (text, status) => {
    const space = text.length < 66 ? 37 : 40;
    return `┌────────────────────────────────┐ ${status}
│    __    _        _        _   │  ${status}
│   / /__ (_)    __(_)    __(_)  │   ${status}
│  /  '_// / |/|/ / / |/|/ / /   └${'─'.repeat(space - 33)}┐
│ /_/\\_\\/_/|__,__/_/|__,__/_/${('v' + config.version).padStart(space - 28, ' ')}│
├${'─'.repeat(space)}┤
│${text.padEnd(space, ' ')}│
└${'─'.repeat(space)}┘`;
};

/**
 * Returns a music progress bar string.
 * @param {number} current - Current playback position in seconds.
 * @param {number} length - Total duration in seconds.
 * @returns {string} ANSI formatted progress bar.
 */
export const musicProgress = (current, length) => {
    const space = length < 3600 ? 37 : 40;
    const progressSteps = space < 40 ? 25 : 24;
    const timeSpace = space < 40 ? space - 32 : space - 33;
    const progress = Math.ceil((current / length) * progressSteps);

    const result = `${secToString(current).padEnd(timeSpace, ' ')}|\u001b[0;40;37m${'·'.repeat(
        progress - 1 < 0 ? 0 : progress - 1
    )}${'♪'.repeat(progress - 1 < 0 ? 0 : 1)}\u001b[0;46m${' '.repeat(
        progressSteps - progress > 0 ? progressSteps - progress : 0
    )}\u001b[0m\u001b[0;32m|${secToString(length).padStart(timeSpace, ' ')}`;
    return result;
};

/**
 * Returns the playlist content string.
 * @param {string[]} prev - Array of previous track titles.
 * @param {string} curr - Current track title.
 * @param {string[]} next - Array of next track titles.
 * @returns {string} Formatted playlist string.
 */
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

/**
 * Creates the player embed object.
 * @param {Object} info - Player information.
 * @param {boolean} info.isPlaying - Whether music is currently playing.
 * @param {string} info.channelId - ID of the voice channel.
 * @param {string} info.title - Track title.
 * @param {string} info.link - Track URL.
 * @param {string} info.userId - User ID of the requester.
 * @param {number} info.playlistLeft - Number of tracks remaining in queue.
 * @param {number} info.remainSec - Remaining duration in seconds.
 * @param {string} info.playMode - Current repeat mode.
 * @param {string} info.thumbnail - Track thumbnail URL.
 * @returns {import('discord.js').APIEmbed} Discord embed data.
 */
export const basePlayerEmbed = (info) => {
    const playingText = info.isPlaying
        ? `${config.name}와 <#${info.channelId}>에서 함께 음악 들어요 🎵`
        : `${config.name}가 <#${info.channelId}>에서 음악을 잠시 멈췄어요 🎵`;
    return {
        title: playingText,
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

/**
 * Generates action row components with control buttons.
 * @param {boolean} isPlaying - Current playback state.
 * @returns {ActionRowBuilder<ButtonBuilder>[]} Array of action rows containing buttons.
 */
export const baseButtonComponents = (isPlaying) => {
    const back = new ButtonBuilder()
        .setCustomId('back')
        .setEmoji(config.emoji.back)
        .setStyle(ButtonStyle.Primary);
    const playPause = isPlaying
        ? new ButtonBuilder()
              .setCustomId('pause')
              .setEmoji(config.emoji.pause)
              .setStyle(ButtonStyle.Primary)
        : new ButtonBuilder()
              .setCustomId('resume')
              .setEmoji(config.emoji.play)
              .setStyle(ButtonStyle.Primary);
    const next = new ButtonBuilder()
        .setCustomId('skip')
        .setEmoji(config.emoji.next)
        .setStyle(ButtonStyle.Primary);
    const leave = new ButtonBuilder()
        .setCustomId('leave')
        .setEmoji(config.emoji.stop)
        .setStyle(ButtonStyle.Danger);
    const shuffle = new ButtonBuilder()
        .setCustomId('shuffle')
        .setEmoji(config.emoji.shuffle)
        .setStyle(ButtonStyle.Secondary);
    const loop = new ButtonBuilder()
        .setCustomId('loop')
        .setEmoji(config.emoji.loop)
        .setStyle(ButtonStyle.Secondary);
    const row1 = new ActionRowBuilder().addComponents(back, playPause, next);
    const row2 = new ActionRowBuilder().addComponents(leave, shuffle, loop);

    return [row1, row2];
};

// --------------------------------------------------

/**
 * Class representing the UI display for a guild.
 */
export class KiwiwiDisplay {
    /**
     * Display status configurations.
     * @type {Object.<string, {emoji: string, text: string}>}
     */
    static status = {
        IDLE: { emoji: '🥝', text: '  Waiting for music links...' },
        PLAYING: { emoji: '💚', text: '' },
        SLEEP: { emoji: '💤', text: '  kiwiwi is sleeping...' },
    };

    /**
     * Creates a KiwiwiDisplay.
     * @param {TextChannel} ch - The text channel to send messages to.
     * @param {Message} msg - The existing message to manage.
     */
    constructor(ch, msg) {
        /** @type {{emoji: string, text: string}} */
        this.status = KiwiwiDisplay.status.IDLE;
        /** @type {TextChannel} */
        this.channel = ch;
        /** @type {Message} */
        this.message = msg;
        /** @type {string} */
        this.statusContent = baseStatusContent(this.status.text, this.status.emoji);
        /** @type {string} */
        this.playlistContent = '';
        /** @type {Object[]} */
        this.playerEmbeds = [];
        /** @type {ActionRowBuilder<ButtonBuilder>[]} */
        this.buttonComponents = [];
    }

    /**
     * Resets the display data.
     */
    clear() {
        this.statusContent = baseStatusContent(this.status.text, this.status.emoji);
        this.playerEmbeds = [];
        this.buttonComponents = [];
        this.playlistContent = '';
    }

    /**
     * Initializes the display message in the channel.
     * @returns {Promise<void>}
     */
    async initMessage() {
        try {
            await this.message.delete();
        } catch (e) {
            /* empty */
        }
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

    /**
     * Moves the display to a different text channel.
     * @param {TextChannel} newChannel - The new channel to display in.
     * @returns {Promise<void>}
     */
    async moveChannel(newChannel) {
        try {
            await this.message.delete();
        } catch (e) {
            /* empty */
        }
        this.channel = newChannel;
        await this.initMessage();
    }

    /**
     * Updates the existing display message.
     * @returns {Promise<void>}
     */
    async update() {
        try {
            await this.message.edit({
                content:
                    '```ansi\n\u001b[0;32m' +
                    this.statusContent +
                    '\n' +
                    this.playlistContent +
                    '```',
                embeds: this.playerEmbeds,
                components: this.buttonComponents,
            });
        } catch (e) {
            if (e.code === 10008) {
                logger.warn('KiwiwiDisplay not found - send new display...');
                await this.initMessage();
            }
        }
    }

    /**
     * Sends a temporary message to the channel.
     * @param {import('discord.js').BaseMessageOptions|string} msgContent - The message content to send.
     * @returns {Promise<void>}
     */
    async sendMessage(msgContent) {
        const msg = await this.channel.send(msgContent);
        setTimeout(() => {
            msg.delete();
        }, config.autoDeleteTimeout);
    }
}
