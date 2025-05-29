import {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import { getVoiceManager } from '#src/queue/voiceManagerQueue.js';
import { warningEmbed, confirmEmbed } from '#src/embeds.js';
import config from '#src/config.js';

/**
 * /queue [number]
 *   + reply  playlist
 */

export const data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('대기열 전체 목록을 보여줘요.');

export const execute = async (interaction) => {
    await interaction.deferReply({ flags: 'Ephemeral' });

    // check if vm exsits
    const vm = getVoiceManager(interaction.guild);
    if (!vm) {
        await interaction.editReply(
            warningEmbed(`${config.name}는 음성 채널에 있지 않아요.`)
        );
        return false;
    }

    // ------------------------------

    const playedlist = vm.kiwiwiPlayer.playedlist;
    const playlist = vm.kiwiwiPlayer.playlist;
    const getMember = (id) =>
        interaction.guild.members.cache.find((user) => user.id === id);

    // make select menu options from playedlist+playlist
    const options = [
        ...playedlist.reverse().map((info, i) => {
            return new StringSelectMenuOptionBuilder()
                .setLabel(`${i - playedlist.length}: ${info.title}`)
                .setValue(info.link)
                .setDescription(`신청자: ${getMember(info.userId).displayName}`);
        }),
        ...playlist.map((info, i) => {
            return new StringSelectMenuOptionBuilder()
                .setLabel(`${i}: ${info.title}`)
                .setValue(info.link)
                .setDescription(`신청자: ${getMember(info.userId).displayName}`);
        }),
    ];

    // select menu actionrow
    const makeSelectList = (startIndex, endIndex, currentPage, endPage) =>
        new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('queue')
                .setPlaceholder(`🧊 재생목록 (${currentPage}/${endPage}) 🥝`)
                .addOptions(options.slice(startIndex, endIndex))
        );

    // button actionrow
    const makeButtons = (prev, next, link) => {
        const buttons = [
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('⇦')
                .setStyle(ButtonStyle.Success)
                .setDisabled(!prev),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('⇨')
                .setStyle(ButtonStyle.Success)
                .setDisabled(!next),
        ];

        if (link) {
            buttons.push(
                new ButtonBuilder().setEmoji('🌐').setStyle(ButtonStyle.Link).setURL(link)
            );
        }
        return new ActionRowBuilder().addComponents(...buttons);
    };

    // max options limit: 25
    let start = 0;
    let end = 25;
    let currPage = 1;
    const endPage = Math.ceil(options.length / 25);
    let menuRow = makeSelectList(start, end, currPage, endPage);
    let buttonRow = makeButtons(currPage !== 1, currPage !== endPage);

    // define recursive response function
    const queueResponse = async (interaction) => {
        const res = await interaction.editReply({
            components: [menuRow, buttonRow],
        });

        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await res.awaitMessageComponent({
                filter: collectorFilter,
                time: config.interactionWaitingTimeout,
            });

            // interaction response

            if (confirmation.customId === 'queue') {
                const link = confirmation.values[0];
                buttonRow = makeButtons(currPage !== 1, currPage !== endPage, link);
                await confirmation.update(confirmEmbed('링크 버튼을 생성했어요.'));
            } else if (confirmation.customId === 'prev') {
                start -= 25;
                end -= 25;
                menuRow = makeSelectList(start, end, --currPage, endPage);
                buttonRow = makeButtons(currPage !== 1, currPage !== endPage);
                await confirmation.update(confirmEmbed('이전 페이지로 넘겼어요.'));
            } else if (confirmation.customId === 'next') {
                start += 25;
                end += 25;
                menuRow = makeSelectList(start, end, ++currPage, endPage);
                buttonRow = makeButtons(currPage !== 1, currPage !== endPage);
                await confirmation.update(confirmEmbed('다음 페이지로 넘겼어요.'));
            }
            await queueResponse(confirmation);
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
    };

    await queueResponse(interaction);

    return true;
};
