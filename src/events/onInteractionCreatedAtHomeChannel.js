import { Events } from 'discord.js';

export const name = Events.InteractionCreate;
export const execute = async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // check if interaction is created at home channel
    // check if interaction is created by button
    // check if user is in voice channel
};
