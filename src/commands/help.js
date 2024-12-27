import { SlashCommandBuilder } from 'discord.js';
import config from '#src/config.js';

const embed = {
    color: config.kiwiGreen,
    title: '키위위 도움말',
    fields: [
        {
            name: '/play `link or keyword`',
            value: '입력한 주소 또는 키워드에 해당하는 음악을 대기열에 추가해요.',
            inline: true,
        },
        {
            name: '/pause',
            value: '음악을 일시정지해요.',
            inline: true,
        },
        {
            name: '/resume',
            value: '음악을 다시 재생해요.',
            inline: true,
        },
        {
            name: '/leave',
            value: '대기열을 비우고 음성 채널에서 나가요.',
            inline: true,
        },
        {
            name: '/shuffle',
            value: '대기열 순서를 임의로 섞어요.',
            inline: true,
        },
        {
            name: '/loop `mode`',
            value: '음악 반복모드를 변경해요.',
            inline: true,
        },
        {
            name: '/queue',
            value: '대기열 전체 목록을 보여줘요.',
            inline: true,
        },
        {
            name: '/skip `number`',
            value: '다음 대기열 음악 또는 선택한 번호에 해당하는 음악을 바로 재생해요.',
            inline: true,
        },
        {
            name: '/remove `number`',
            value: '대기열 마지막 음악 또는 선택한 번호에 해당하는 음악을 제외해요.',
            inline: true,
        },
        {
            name: '/search `query`',
            value: '유튜브 기반 검색으로 음악을 대기열에 추가해요.',
            inline: true,
        },
    ],
    footer: {
        text: `${config.name} - v${config.version}`,
    },
};

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('키위위 도움말을 보여줘요.');
export const execute = async (interaction) => {
    // deferReply
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ embeds: [embed] });
};
