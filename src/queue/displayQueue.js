import db from '#src/database.js';
import { KiwiwiDisplay } from '#src/classes/kiwiwiDisplay.js';
import logger from '#src/logger.js';

// displayQueue: Map<guildId: string, KiwiwiDisplay>
export const displayQueue = new Map();

export const initKiwiwiDisplay = async (guild, channel) => {
    const display = new KiwiwiDisplay(channel);
    await display.initMessage();

    displayQueue[guild.id] = display;

    const record = db.home.findOne({ where: { guild_id: guild.id } });

    if (record) {
        await db.home.update(
            {
                channel_id: channel.id,
                kiwiwi_player_id: display.message.id,
            },
            { where: { guild_id: guild.id } }
        );
    } else {
        await db.home.create({
            guild_id: guild.id,
            channel_id: channel.id,
            kiwiwi_player_id: display.message.id,
        });
    }
    return display;
};

export const getKiwiwiDisplay = async (guild) => {
    if (displayQueue[guild.id]) return displayQueue[guild.id];

    const home = await db.home.findOne({ where: { guild_id: guild.id } });
    if (!home) throw 'Kiwiwi Home Channel is not Initialized!';
    let homeChannel;
    try {
        homeChannel = await guild.channels.fetch(home.channel_id);
        const msg = await homeChannel.messages.fetch(home.kiwiwi_player_id);
        const display = new KiwiwiDisplay(homeChannel, msg);
        displayQueue[guild.id] = display;
        return display;
    } catch (e) {
        if (!homeChannel) return false;
        logger.warn(`message not found: ${home.kiwiwi_player_id}`);
        const display = new KiwiwiDisplay(homeChannel);
        await display.initMessage();
        await db.home.update(
            {
                kiwiwi_player_id: display.message.id,
            },
            { where: { guild_id: guild.id } }
        );
        displayQueue[guild.id] = display;
        return display;
    }
};

export const setKiwiwiDisplay = async (guild, display) => {
    const home = await db.home.findOne({ where: { guild_id: guild.id } });

    if (home.channel_id !== display.channel.id) {
        throw 'Invalid display channel';
    }
    displayQueue[guild.id] = display;
};
