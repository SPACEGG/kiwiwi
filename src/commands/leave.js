import { SlashCommandBuilder } from 'discord.js';
import { errorEmbed, confirmEmbed } from '#src/embeds.js';
import { voiceManagerQueue } from '#src/queue/voiceManagerQueue.js';
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

    const vm = voiceManagerQueue[interaction.guild.id];

    // leave voice channel
    if (!vm) {
        await interaction.editReply(
            errorEmbed(`${config.name}는 이미 음성 채널에 있지 않았어요.`)
        );
        return false;
    } else {
        // check user's channel status
        if (interaction.member.voice?.channel !== vm.voiceChannel) {
            await interaction.editReply(errorEmbed('음성 채널에 먼저 참가해주세요'));
            return false;
        }

        vm.destroy();
        delete voiceManagerQueue[interaction.guild.id];
        await interaction.editReply(
            confirmEmbed('대기열을 비우고 음성 채널에서 나갔어요.')
        );
        return true;
    }
};
