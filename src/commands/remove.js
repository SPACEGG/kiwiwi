import { SlashCommandBuilder } from 'discord.js';
import { checkHomeChannel } from '#src/utils.js';
import { getVoiceManager } from '#src/queue/voiceManagerQueue.js';
import { warningEmbed, confirmEmbed } from '#src/embeds.js';
import config from '#src/config.js';

/**
 * /remove [number]
 *   + vm.kiwiwiPlayer.remove(number)
 */

export const data = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('대기열 마지막 음악 또는 선택한 번호에 해당하는 음악을 제외해요.')
    .addStringOption((option) =>
        option.setName('number').setDescription('대기열 번호').setRequired(false)
    );

export const execute = async (interaction) => {
    // deferReply
    await interaction.deferReply({ ephemeral: true });
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout);

    if (!(await checkHomeChannel(interaction))) return false;

    // check if vm exsits
    const vm = getVoiceManager(interaction.guild);
    if (!vm) {
        await interaction.editReply(
            warningEmbed(`${config.name}는 음성 채널에 있지 않아요.`)
        );
        return false;
    }

    // check user's channel status
    if (interaction.member.voice?.channel !== vm.voiceChannel) {
        await interaction.editReply(warningEmbed('음성 채널에 먼저 참가해주세요'));
        return false;
    }

    // ------------------------------

    const number = parseInt(interaction.options?.getString('number')) || 0;

    // skip
    if (number < 1) {
        vm.kiwiwiPlayer.remove();
        await interaction.editReply(confirmEmbed('마지막 음악을 제외했어요.'));
    } else {
        vm.kiwiwiPlayer.remove(number);
        await interaction.editReply(confirmEmbed(`${number}번째 음악을 제외했어요.`));
    }

    return true;
};
