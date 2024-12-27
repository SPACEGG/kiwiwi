import { SlashCommandBuilder } from 'discord.js';
import { warningEmbed, confirmEmbed } from '#src/embeds.js';
import { getVoiceManager, destroyVoiceManager } from '#src/queue/voiceManagerQueue.js';
import { checkHomeChannel } from '#src/utils.js';
import config from '#src/config.js';

/**
 * /leave
 *   + vm.destroy()
 */

export const data = new SlashCommandBuilder()
    .setName('leave')
    .setDescription('대기열을 비우고 음성 채널에서 나가요.');
export const execute = async (interaction) => {
    // deferReply
    await interaction.deferReply({ ephemeral: true });
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout);

    if (!(await checkHomeChannel(interaction))) {
        return false;
    }

    const vm = getVoiceManager(interaction.guild);

    // leave voice channel
    if (!vm) {
        await interaction.editReply(
            warningEmbed(`${config.name}는 이미 음성 채널에 있지 않았어요.`)
        );
        return false;
    } else {
        // check user's channel status
        if (interaction.member.voice?.channel !== vm.voiceChannel) {
            await interaction.editReply(warningEmbed('음성 채널에 먼저 참가해주세요'));
            return false;
        }

        destroyVoiceManager(interaction.guild);

        await interaction.editReply(
            confirmEmbed('대기열을 비우고 음성 채널에서 나갔어요.')
        );
        return true;
    }
};
