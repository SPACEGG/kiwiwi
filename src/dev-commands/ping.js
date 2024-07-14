import { SlashCommandBuilder } from 'discord.js';
import config from '#src/config.js';

const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');
const execute = async (interaction) => {
    // deferReply
    await interaction.deferReply({ ephemeral: true });
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout);

    await interaction.editReply('Pong!');
};

export { data, execute };
