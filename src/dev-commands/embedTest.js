import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SlashCommandBuilder,
} from 'discord.js';
import config from '#src/config.js';

const secToString = (seconds) => {
    const date = new Date(seconds * 1000);
    const minutes = date.getUTCMinutes();
    const secs = date.getUTCSeconds();
    const formattedMinutes = minutes.toString();
    const formattedSeconds = secs.toString().padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
};

const current = 43;
const length = 200;
const progress = Math.ceil(((current + 1) / length) * 25);

const codeBlock = `\`\`\`ansi\n\u001b[0;32m┌────────────────────────────────┐ 🥝\n│    __    _        _        _   │  🥝\n│   / /__ (_)    __(_)    __(_)  │   🥝\n│  /  '_// / |/|/ / / |/|/ / /   └────┐\n│ /_/\\_\\/_/|__.__/_/|__.__/_/   v${
    config.version
}│\n├─────────────────────────────────────┤\n│${secToString(current)} |${'~'.repeat(
    progress - 1
)}♪${'-'.repeat(25 - progress)}| ${secToString(
    length
)}│\n└─────────────────────────────────────┘\n\n\`\`\``;

const embed = {
    title: `${config.name}가 <@123>에서 4명과 함께 음악을 듣고 있어요 🎵`,
    description: '지금 재생 중 - [음악 - 이름, 이름2](https://example.com)',
    fields: [
        {
            name: '신청자',
            value: '<@!123>',
            inline: true,
        },
        {
            name: '대기열 수',
            value: '`7개`',
            inline: true,
        },
        {
            name: '대기열 시간',
            value: '`22:10`',
            inline: true,
        },
    ],
    color: config.kiwiGreen,
    thumbnail: {
        url: 'https://i.imgur.com/lqjV8Ln.png',
    },
    footer: {
        text: `${config.name} - v${config.version}`,
    },
};

const back = new ButtonBuilder()
    .setCustomId('back')
    .setLabel('⏮')
    .setStyle(ButtonStyle.Primary);
const play = new ButtonBuilder()
    .setCustomId('play')
    .setLabel('▶')
    .setStyle(ButtonStyle.Primary);
const next = new ButtonBuilder()
    .setCustomId('next')
    .setLabel('⏭')
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
const queue = new ButtonBuilder()
    .setCustomId('queue')
    .setEmoji('📜')
    .setStyle(ButtonStyle.Secondary);
const row1 = new ActionRowBuilder().addComponents(back, play, next);
const row2 = new ActionRowBuilder().addComponents(leave, shuffle, loop, queue);

export const data = new SlashCommandBuilder()
    .setName('embedtest')
    .setDescription('[dev] test embed');
export const execute = async (interaction) => {
    // deferReply
    await interaction.deferReply({ ephemeral: true });
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout);

    await interaction.editReply({
        content: codeBlock,
        embeds: [embed],
        components: [row1, row2],
    });
};
