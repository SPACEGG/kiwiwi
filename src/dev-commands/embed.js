import { SlashCommandBuilder } from 'discord.js';
import { warningEmbed, confirmEmbed } from '#src/embeds.js';
import config from '#src/config.js';

/**
 * /embed [json]
 * - send json
 */

export const data = new SlashCommandBuilder()
    .setName('embed')
    .setDescription('json 포맷을 입력받아 임베드 메시지를 생성해요.')
    .addStringOption((option) =>
        option.setName('json').setDescription('embed json').setRequired(true)
    );

export const execute = async (interaction) => {
    // deferReply
    await interaction.deferReply({ ephemeral: true });
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout);

    // ------------------------------

    const input = interaction.options.getString('json');
    try {
        const embedjson = JSON.parse(input);

        if (typeof embedjson.color !== 'number') {
            const colorString = embedjson.color?.replace('#src', '');
            embedjson.color = parseInt(colorString, 16);
        }
        if (embedjson.timestamp) embedjson.timestamp = new Date().toISOString();
        const avatar = interaction.user.avatarURL();
        embedjson.footer = { text: interaction.user.username, icon_url: avatar };

        await interaction.channel.send({ embeds: [embedjson] });
        await interaction.editReply(confirmEmbed('임베드 메시지를 생성했어요.'));
        return true;
    } catch (e) {
        let errormsg;
        if (e.rawError) errormsg = e.message.split('\n').slice(0, 2);
        else errormsg = e.message.split('\n').slice(0, 2);
        await interaction.editReply(
            warningEmbed(`유효하지 않은 json 입력이에요:\n${errormsg}`)
        );
        return false;
    }
};
