import {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import { checkHomeChannel } from '#src/utils.js';
import { getVoiceManager, addElements } from '#src/queue/voiceManagerQueue.js';
import { warningEmbed, confirmEmbed } from '#src/embeds.js';
import youtubeDl from 'youtube-dl-exec';
import getMusics from '#src/musics/getMusics.js';
import config from '#src/config.js';

/**
 * /search [query]
 * - search selectlist ui
 * - vm.kiwiwiPlayer.add()
 */

const getInfo = (query, count) =>
    youtubeDl(`ytsearch${count}:${query}`, {
        dumpSingleJson: true,
        skipDownload: true,
        noWarnings: true,
        preferFreeFormats: true,
        noCheckCertificates: true,
        flatPlaylist: true,
    });

const formatNumber = (num) => {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    } else if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1_000) {
        return (num / 1_000).toFixed(0) + 'K';
    } else {
        return num.toString();
    }
};

export const data = new SlashCommandBuilder()
    .setName('search')
    .setDescription('유튜브 기반 검색으로 음악을 대기열에 추가해요.')
    .addStringOption((option) =>
        option.setName('query').setDescription('검색어').setRequired(true)
    );

export const execute = async (interaction) => {
    const guild = interaction.guild;
    const voiceChannel = interaction.member.voice.channel;
    let vm = getVoiceManager(guild);

    // deferReply
    await interaction.deferReply({ ephemeral: true });

    if (!(await checkHomeChannel(interaction))) return false;

    // check user's channel status
    if (!voiceChannel || (vm && voiceChannel !== vm.voiceChannel)) {
        await interaction.editReply(warningEmbed('음성 채널에 먼저 참가해주세요'));
        setTimeout(() => {
            interaction.deleteReply();
        }, config.autoDeleteTimeout);
        return false;
    }

    // ------------------------------

    // Build ActionRow UI
    const query = interaction.options.getString('query');
    const entries = (await getInfo(query, config.searchCommandList)).entries;
    const options = entries.map((entry) => {
        return new StringSelectMenuOptionBuilder()
            .setLabel(entry.title)
            .setValue(entry.url)
            .setDescription(
                `${entry.channel} / 조회수: ${formatNumber(entry.view_count)}`
            );
    });
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('searchResult')
        .setPlaceholder(`${config.emoji.kiwi} 검색 결과를 선택하세요.`)
        .addOptions(options);
    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Interaction
    const res = await interaction.editReply({ components: [row] });
    const collectorFilter = (i) => i.user.id === interaction.user.id;
    try {
        const confirmation = await res.awaitMessageComponent({
            filter: collectorFilter,
            time: config.interactionWaitingTimeout,
        });

        // response
        if (confirmation.customId === 'searchResult') {
            await confirmation.update(confirmEmbed('선택한 음악을 대기열에 추가했어요.'));
            setTimeout(() => {
                interaction.deleteReply();
            }, config.autoDeleteTimeout);

            const link = confirmation.values[0];
            const elements = await getMusics(link, interaction);

            // connect or add
            await addElements(vm, guild, voiceChannel, elements);
        }
    } catch (e) {
        if (e.name === 'InteractionCollectorError') {
            await interaction.editReply(
                warningEmbed('사용자 입력이 없어 작업이 취소되었어요.')
            );
            setTimeout(() => {
                interaction.deleteReply();
            }, config.autoDeleteTimeout);
        }
    }

    return true;
};
