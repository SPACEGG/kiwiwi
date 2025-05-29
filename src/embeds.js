import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '#src/config.js';

export const errorEmbed = (message) => {
    return {
        embeds: [
            {
                title: config.emoji.kiwi + '😨',
                description: message,
                color: config.errorRed,
            },
        ],
        components: [],
        flags: 'Ephemeral',
        allowedMentions: {
            repliedUser: false,
        },
    };
};

export const confirmEmbed = (message) => {
    return {
        embeds: [
            {
                title: config.emoji.kiwi + '😊',
                description: message,
                color: config.kiwiGreen,
            },
        ],
        components: [],
        flags: 'Ephemeral',
        allowedMentions: {
            repliedUser: false,
        },
    };
};

export const warningEmbed = (message) => {
    return {
        embeds: [
            {
                title: config.emoji.kiwi + '😕',
                description: message,
                color: config.warnYellow,
            },
        ],
        components: [],
        flags: 'Ephemeral',
        allowedMentions: {
            repliedUser: false,
        },
    };
};

const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId('yes')
        .setLabel('네')
        .setEmoji(config.emoji.kiwi)
        .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
        .setCustomId('no')
        .setLabel('아니요')
        .setEmoji('✖')
        .setStyle(ButtonStyle.Danger)
);

export const checkEmbed = (message) => {
    return {
        embeds: [
            {
                description: message,
                color: config.kiwiGreen,
            },
        ],
        components: [actionRow],
        flags: 'Ephemeral',
        allowedMentions: {
            repliedUser: false,
        },
    };
};
