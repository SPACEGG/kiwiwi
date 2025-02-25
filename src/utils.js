import db from '#src/database.js';
import { warningEmbed } from '#src/embeds.js';

export const secToString = (seconds) => {
    const date = new Date(seconds * 1000);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const secs = date.getUTCSeconds();
    const formattedHours = hours.toString();
    const formattedMinutes =
        formattedHours === '0' ? minutes.toString() : minutes.toString().padStart(2, '0');
    const formattedSeconds = secs.toString().padStart(2, '0');
    if (formattedHours === '0') {
        return `${formattedMinutes}:${formattedSeconds}`;
    } else {
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
};

export const isURL = (urlString) => {
    try {
        const url = new URL(urlString);
        if (url.protocol === 'https:' || url.protocol === 'http:') return true;
    } catch (e) {
        return false;
    }
    return false;
};

export const checkHomeChannel = async (interaction) => {
    // check home channel
    const home = await db.home.findOne({
        where: { guild_id: interaction.guild.id },
    });
    if (!home) {
        await interaction.editReply(
            warningEmbed(
                '키위위 홈 채널이 등록되지 않았어요. 키위위 홈 채널을 서버 관리자가 등록해주세요.'
            )
        );
        return false;
    }
    return true;
};

export const checkKiwiwiButton = async (interaction) => {
    // check home channel
    const home = await db.home.findOne({
        where: { guild_id: interaction.guild.id },
    });
    if (!home) return false;
    if (interaction.message.id !== home.kiwiwi_player_id) return false;
    return true;
};
