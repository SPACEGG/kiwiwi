import { SlashCommandBuilder } from 'discord.js';
import { checkHomeChannel } from '#src/utils.js';
import { errorEmbed, confirmEmbed } from '#src/embeds.js';
import { voiceManagerQueue } from '#src/queue.js';
import config from '#src/config.js';

export const data = new SlashCommandBuilder()
    .setName('pause')
    .setDescription('재생하던 음악을 일시정지해요.');
export const execute = async (interaction) => {
    // deferReply
    await interaction.deferReply({ ephemeral: true });
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout);

    // check user's channel status
    if (!interaction.member.voice.channel) {
        interaction.editReply(errorEmbed('음성 채널에 먼저 참가해주세요'));
        return false;
    }
    if (!(await checkHomeChannel(interaction))) return false;

    // check if vm exsits
    const vm = voiceManagerQueue[interaction.guild.id];
    if (!vm) {
        await interaction.editReply(
            errorEmbed(`${config.name}는 음성 채널에 있지 않아요.`)
        );
        return false;
    }

    // ------------------------------

    vm.kiwiwiPlayer.pause();
    interaction.editReply(confirmEmbed('음악을 일시정지해요.'));
    return true;
};
