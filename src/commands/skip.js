import { SlashCommandBuilder } from 'discord.js';
import { checkHomeChannel } from '#src/utils.js';
import { getVoiceManager } from '#src/queue/voiceManagerQueue.js';
import { confirmEmbed, warningEmbed } from '#src/embeds.js';
import config from '#src/config.js';

/**
 * /skip [number]
 * - no number:
 *      + vm.kiwiwiPlayer.skip(1)
 * - has number:
 *      + vm.kiwiwiPlayer.skip(number)
 */

export const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('다음 대기열 음악 또는 선택한 번호에 해당하는 음악을 바로 재생해요.')
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

    const number = parseInt(interaction.options?.getString('number')) || 1;
    if (number < 1) {
        await interaction.editReply(
            warningEmbed(`유효하지 않은 대기열 번호에요: ${number}`)
        );
        return false;
    }

    // skip
    vm.kiwiwiPlayer.skip(number);
    if (number === 1) {
        await interaction.editReply(confirmEmbed('다음 곡으로 넘겼어요.'));
    } else {
        await interaction.editReply(confirmEmbed(`대기열을 ${number}곡 넘겼어요.`));
    }
    return true;
};
