import { Events } from 'discord.js';
import { errorEmbed, warningEmbed } from '#src/embeds.js';
import { checkKiwiwiButton } from '#src/utils.js';
import config from '#src/config.js';
import logger from '#src/logger.js';

export const name = Events.InteractionCreate;
export const execute = async (interaction) => {
    // check if interaction is created by button
    if (!interaction.isButton()) return false;

    // check if interaction is created at home channel
    if (!(await checkKiwiwiButton(interaction))) return false;

    // check if user is in voice channel
    if (
        !interaction.member.voice.channel ||
        interaction.member.guild.id !== interaction.guild.id
    ) {
        await interaction.reply(warningEmbed('음성 채널에 먼저 참가해주세요'));
        setTimeout(() => {
            interaction.deleteReply();
        }, config.autoDeleteTimeout);
        return false;
    }

    const command = interaction.client.commands.get(interaction.customId);

    if (!command) {
        logger.error(`CommandNotFoundError: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        logger.error(`CommandExecuteError: ${error}`);
        if (error.code == 10062) return;
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(errorEmbed('명령 오류가 발생했어요.'));
        } else {
            await interaction.reply(errorEmbed('명령 오류가 발생했어요.'));
        }
    }
};
