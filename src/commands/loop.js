import { SlashCommandBuilder } from 'discord.js';
import { checkHomeChannel } from '#src/utils.js';
import { errorEmbed, confirmEmbed } from '#src/embeds.js';
import { KiwiwiPlayer } from '#src/classes/kiwiwiPlayer.js';
import { voiceManagerQueue } from '#src/queue/voiceManagerQueue.js';
import config from '#src/config.js';

/**
 * /loop [mode]
 *   - mode exsits
 *      + vm.kiwiwiPlayer.repeat(mode)
 *   - mode not exsits
 *      + change mode to ONE -> ALL -> NONE
 *      + vm.kiwiwiPlayer.repeat(mode)
 */

export const data = new SlashCommandBuilder()
    .setName('loop')
    .setDescription('음악 반복모드를 변경해요.')
    .addStringOption((option) =>
        option
            .setName('mode')
            .setDescription('반복 모드')
            .setRequired(true)
            .addChoices(
                { name: '재생중인 음악 반복', value: 'song' },
                { name: '재생목록 전체 반복', value: 'queue' },
                { name: '반복 끄기', value: 'none' }
            )
    );
export const execute = async (interaction) => {
    // deferReply
    await interaction.deferReply({ ephemeral: true });
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout);

    if (!(await checkHomeChannel(interaction))) return false;

    // check if vm exsits
    const vm = voiceManagerQueue[interaction.guild.id];
    if (!vm) {
        await interaction.editReply(
            errorEmbed(`${config.name}는 음성 채널에 있지 않아요.`)
        );
        return false;
    }

    // check user's channel status
    if (interaction.member.voice?.channel !== vm.voiceChannel) {
        await interaction.editReply(errorEmbed('음성 채널에 먼저 참가해주세요'));
        return false;
    }

    // ------------------------------

    const mode = interaction.options?.getString('mode');
    if (mode) {
        switch (mode) {
            case 'song':
                vm.kiwiwiPlayer.repeat(KiwiwiPlayer.repeatMode.ONE);
                interaction.editReply(confirmEmbed('재생중인 음악을 반복해요.'));
                break;
            case 'queue':
                vm.kiwiwiPlayer.repeat(KiwiwiPlayer.repeatMode.ALL);
                interaction.editReply(confirmEmbed('재생목록 전체를 반복해요.'));
                break;
            case 'none':
                vm.kiwiwiPlayer.repeat(KiwiwiPlayer.repeatMode.NONE);
                interaction.editReply(confirmEmbed('음악을 반복하지 않아요.'));
                break;
        }
    } else {
        // ONE -> ALL -> NONE
        switch (vm.kiwiwiPlayer.playMode) {
            case KiwiwiPlayer.repeatMode.NONE:
                vm.kiwiwiPlayer.repeat(KiwiwiPlayer.repeatMode.ONE);
                interaction.editReply(confirmEmbed('재생중인 음악을 반복해요.'));
                break;
            case KiwiwiPlayer.repeatMode.ONE:
                vm.kiwiwiPlayer.repeat(KiwiwiPlayer.repeatMode.ALL);
                interaction.editReply(confirmEmbed('재생목록 전체를 반복해요.'));
                break;
            case KiwiwiPlayer.repeatMode.ALL:
                vm.kiwiwiPlayer.repeat(KiwiwiPlayer.repeatMode.NONE);
                interaction.editReply(confirmEmbed('음악을 반복하지 않아요.'));
                break;
        }
    }
    return true;
};
