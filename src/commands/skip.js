import { SlashCommandBuilder } from 'discord.js';
import { checkHomeChannel } from '#src/utils.js';
import { voiceManagerQueue } from '#src/queue.js';
import { errorEmbed, confirmEmbed } from '#src/embeds.js';
import config from '#src/config.js';

/**
 * /skip [number]
 * - no number:
 *      + add link to playlist
 * - has number:
 *      + vm 생성
 *      + vm connect
 *      + add link to playlist
 *      + play
 */

export const data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('재생중인 음악 또는 특정 대기열 번호까지 넘겨요.')
    .addStringOption((option) =>
        option.setName('number').setDescription('대기열 번호').setRequired(false)
    );

export const execute = async (interaction) => {
    // deferReply
    await interaction.deferReply({ ephemeral: true });
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout);

    // check user's channel status
    if (!interaction.member.voice.channel) {
        await interaction.editReply(errorEmbed('음성 채널에 먼저 참가해주세요'));
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

    const number = parseInt(interaction.options.getString('number')) || 1;
    if (number < 1) {
        await interaction.editReply(
            errorEmbed(`유효하지 않은 대기열 번호에요: ${number}`)
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
