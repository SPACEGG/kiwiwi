import { SlashCommandBuilder } from 'discord.js';
import logger from '#src/logger.js';
import { checkHomeChannel } from '#src/utils.js';
import { VoiceManager } from '#src/classes/voiceManager.js';
import { voiceManagerQueue } from '#src/queue/voiceManagerQueue.js';
import { errorEmbed, confirmEmbed } from '#src/embeds.js';
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
    .setDescription('음악을 대기열에 추가해요.')
    .addStringOption((option) =>
        option
            .setName('keyword')
            .setDescription('음악 링크 또는 검색 키워드')
            .setRequired(true)
    );

export const execute = async (interaction) => {
    // deferReply
    await interaction.deferReply({ ephemeral: true });
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout);

    if (!(await checkHomeChannel(interaction))) return false;

    // check user's channel status
    if (
        !interaction.member.voice.channel ||
        (voiceManagerQueue[interaction.guild.id] &&
            interaction.member.voice.channel !==
                voiceManagerQueue[interaction.guild.id].voiceChannel)
    ) {
        await interaction.editReply(errorEmbed('음성 채널에 먼저 참가해주세요'));
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
    let vm = voiceManagerQueue[interaction.guild.id];
    if (!vm) {
        vm = new VoiceManager(interaction.member.voice.channel);
        voiceManagerQueue[interaction.guild.id] = vm;
        await vm.connect();
        vm.kiwiwiPlayer.add(elements);
        vm.kiwiwiPlayer.play();
    } else if (vm.destroyed) {
        await vm.reconnect();
        vm.kiwiwiPlayer.add(elements);
        vm.kiwiwiPlayer.play();
    } else {
        await vm.waitForConnect();
        vm.kiwiwiPlayer.add(elements);
    }

    await interaction.editReply(
        confirmEmbed(`음악 ${elements.length}개를 대기열에 추가했어요.`)
    );
};
