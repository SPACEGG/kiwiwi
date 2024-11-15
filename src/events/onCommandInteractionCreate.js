import { Events } from 'discord.js';
import { errorEmbed } from '#src/embeds.js';
import logger from '#src/logger.js';

export const name = Events.InteractionCreate;
export const execute = async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

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
