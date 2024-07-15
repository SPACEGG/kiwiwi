import { SlashCommandBuilder } from 'discord.js';
import config from '#src/config.js';

const embed = {
    color: config.kiwiGreen,
    title: '키위위 도움말',
    fields: [
        {
            name: '/sethome',
            value: '**[관리자 명령]** 현재 채널을 키위위 홈으로 설정해요.',
        },
        {
            name: '/play `link`',
            value: '음악을 대기열에 추가해요.',
        },
        {
            name: '/leave',
            value: '대기열을 비우고 음성 채널에서 나가요.',
        },
        {
            name: '/skip `number`',
            value: '재생중인 음악 또는 특정 대기열 번호까지 넘겨요.',
        },
        {
            name: '/pause',
            value: '재생중인 음악을 멈춰요.',
        },
        {
            name: '/resume',
            value: '멈춰있던 음악을 다시 재생해요.',
        },
        {
            name: '/remove `number`',
            value: '대기열 마지막 음악 또는 특정 대기열 번호를 제외해요.',
        },
        {
            name: '/shuffle',
            value: '대기열 순서를 임의로 섞어요.',
        },
        {
            name: '/loop `mode`',
            value: '음악 반복모드를 변경해요.',
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
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout);

    await interaction.editReply({ embeds: [embed] });
};
