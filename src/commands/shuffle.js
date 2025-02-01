import { SlashCommandBuilder } from 'discord.js';
import { checkHomeChannel } from '#src/utils.js';
import { warningEmbed, confirmEmbed } from '#src/embeds.js';
import { getVoiceManager } from '#src/queue/voiceManagerQueue.js';
import config from '#src/config.js';

/**
 * /shuffle
 * + vm.kiwiwiPlayer.shuffle()
 */

export const data = new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('대기열 순서를 임의로 섞어요.');
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

    vm.kiwiwiPlayer.shuffle();
    interaction.editReply(confirmEmbed('재생목록을 순서를 임의로 섞었어요.'));
    return true;
};
