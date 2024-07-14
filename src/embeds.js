import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import config from '#src/config.js';

export const errorEmbed = (message) => {
    return {
        embeds: [
            {
                title: config.kiwi + '🤮',
                description: message,
                color: config.errorRed,
            },
        ],
        ephemeral: true,
    };
};

export const confirmEmbed = (message) => {
    return {
        embeds: [
            {
                title: config.kiwi + '😊',
                description: message,
                color: config.kiwiGreen,
            },
        ],
        ephemeral: true,
    };
};

export const warningEmbed = (message) => {
    return {
        embeds: [
            {
                title: config.kiwi + '😕',
                description: message,
                color: config.warnYellow,
            },
        ],
        ephemeral: true,
    };
};

const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId('yes')
        .setLabel('네')
        .setEmoji(config.kiwi)
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
        ephemeral: true,
    };
};
