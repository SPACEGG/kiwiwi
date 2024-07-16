import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import logger from '#src/logger.js';
import { checkEmbed, confirmEmbed, warningEmbed } from '#src/embeds.js';
import {
    initKiwiwiDisplay,
    getKiwiwiDisplay,
    setKiwiwiDisplay,
} from '#src/queue/displayQueue.js';
import config from '#src/config.js';
import db from '#src/database.js';

/**
 * /sethome
 *   + find home record from db
 *   + checkEmbed(Y/N)
 *   - Y:
 *      + update record
 *      + move/create kiwiwiDisplay
 *      + confirmEmbed
 *   - N:
 *      + cancel
 *      + warnigEmbed
 *   - no input for interactionWaitingTimeout:
 *      + cancel
 *      + warnigEmbed
 */

const data = new SlashCommandBuilder()
    .setName('sethome')
    .setDescription('[관리자 명령] 현재 채널을 키위위 홈으로 설정해요.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

const execute = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout + config.interactionWaitingTimeout);

    // find prev record
    const prevHome = await db.home.findOne({ where: { guild_id: interaction.guildId } });
    // change / initialize
    if (prevHome) {
        const res = await interaction.editReply(
            checkEmbed(
                `키위위 홈 채널을 <#${prevHome.channel_id}>에서 <#${interaction.channelId}>(으)로 변경할까요?`
            )
        );

        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await res.awaitMessageComponent({
                filter: collectorFilter,
                time: config.interactionWaitingTimeout,
            });

            // update record & move kiwiwi display
            if (confirmation.customId === 'yes') {
                // move display msg
                const display = await getKiwiwiDisplay(interaction.guild);
                if (!display) {
                    await initKiwiwiDisplay(interaction.guild, interaction.channel);
                } else {
                    await display.moveChannel(interaction.channel);
                    // update record
                    await db.home.update(
                        {
                            channel_id: interaction.channelId,
                            kiwiwi_player_id: display.message.id,
                        },
                        { where: { guild_id: interaction.guildId } }
                    );
                    // update to queue
                    await setKiwiwiDisplay(interaction.guild, display);
                }
                await confirmation.update(
                    confirmEmbed(
                        `키위위 홈 채널을 <#${interaction.channelId}>(으)로 변경했어요!`
                    )
                );
                return true;
            } else if (confirmation.customId === 'no') {
                await confirmation.update(warningEmbed('작업이 취소되었어요.'));
                return false;
            }
        } catch (e) {
            if (e.name === 'InteractionCollectorError') {
                await interaction.editReply(
                    warningEmbed('사용자 입력이 없어 작업이 취소되었어요.')
                );
            } else {
                logger.error(`SetHomeError: ${e}`);
            }
            return false;
        }
    } else {
        const res = await interaction.editReply(
            checkEmbed(`키위위 홈 채널을 <#${interaction.channelId}>(으)로 등록할까요?`)
        );

        const collectorFilter = (i) => i.user.id === interaction.user.id;
        try {
            const confirmation = await res.awaitMessageComponent({
                filter: collectorFilter,
                time: 60_000,
            });

            // create record && create kiwiwi display
            if (confirmation.customId === 'yes') {
                const display = await initKiwiwiDisplay(
                    interaction.guild,
                    interaction.channel
                );
                // create initialize record
                await db.guilds.create({
                    guild_id: interaction.guildId,
                    is_initialized: true,
                });
                await setKiwiwiDisplay(interaction.guild, display);
                await confirmation.update(
                    confirmEmbed(
                        `키위위 홈 채널을 <#${interaction.channelId}>(으)로 등록했어요!`
                    )
                );
                return true;
            } else if (confirmation.customId === 'no') {
                await confirmation.update(warningEmbed('작업이 취소되었어요.'));
                return false;
            }
        } catch (e) {
            if (e.name === 'InteractionCollectorError') {
                await interaction.editReply(
                    warningEmbed('사용자 입력이 없어 작업이 취소되었어요.')
                );
            } else {
                logger.error(`SetHomeError: ${e}`);
            }
            return false;
        }
    }
};

export { data, execute };
