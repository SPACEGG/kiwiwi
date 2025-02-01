import { SlashCommandBuilder } from 'discord.js';
import logger from '#src/logger.js';
import { checkHomeChannel } from '#src/utils.js';
import { getVoiceManager, addElements } from '#src/queue/voiceManagerQueue.js';
import { errorEmbed, warningEmbed, confirmEmbed } from '#src/embeds.js';
import getMusics from '#src/musics/getMusics.js';
import config from '#src/config.js';

/**
 * /play [link]
 * - VoiceManager exsits:
 *      + get music info elements
 *      + vm.kiwiwiPlayer.add(elements)
 * - VoiceManager not exsits:
 *      + get music info elements
 *      + create vm
 *      + vm.connect()
 *      + vm.kiwiwiPlayer.add(elements)
 *      + vm.kiwiwiPlayer.play()
 */

export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('입력한 주소 또는 키워드에 해당하는 음악을 대기열에 추가해요.')
    .addStringOption((option) =>
        option
            .setName('keyword')
            .setDescription('음악 링크 또는 검색 키워드')
            .setRequired(true)
    );

export const execute = async (interaction) => {
    const guild = interaction.guild;
    const voiceChannel = interaction.member.voice.channel;
    let vm = getVoiceManager(guild);

    // deferReply
    await interaction.deferReply({ ephemeral: true });
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout);

    if (!(await checkHomeChannel(interaction))) return false;

    // check user's channel status
    if (!voiceChannel || (vm && voiceChannel !== vm.voiceChannel)) {
        await interaction.editReply(warningEmbed('음성 채널에 먼저 참가해주세요'));
        return false;
    }

    // get music info
    let elements = [];
    const keyword = interaction.options?.getString('keyword');

    try {
        elements = await getMusics(keyword, interaction);
    } catch (e) {
        logger.error(`MusicKeywordError: ${e}`);
        await interaction.editReply(
            errorEmbed(`유효하지 않은 입력이에요: \`${keyword}\``)
        );
        return;
    }

    // connect or add
    await addElements(vm, guild, voiceChannel, elements);

    await interaction.editReply(
        confirmEmbed(`음악 ${elements.length}개를 대기열에 추가했어요.`)
    );
};
