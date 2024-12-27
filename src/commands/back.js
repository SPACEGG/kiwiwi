import { SlashCommandBuilder } from 'discord.js';
import { checkHomeChannel } from '#src/utils.js';
import { getVoiceManager } from '#src/queue/voiceManagerQueue.js';
import { warningEmbed, confirmEmbed } from '#src/embeds.js';
import config from '#src/config.js';

/**
 * /back
 *   + vm.kiwiwiPlayer.back()
 */

export const data = new SlashCommandBuilder()
    .setName('back')
    .setDescription('이전 재생목록 음악을 재생해요.');
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

    (await vm.kiwiwiPlayer.back())
        ? interaction.editReply(confirmEmbed('이전 음악을 다시 재생해요.'))
        : interaction.editReply(warningEmbed('이전 음악이 존재하지 않아요.'));
    return true;
};
