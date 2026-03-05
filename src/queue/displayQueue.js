import db from '#src/database.js';
import { KiwiwiDisplay } from '#src/classes/kiwiwiDisplay.js';
import logger from '#src/logger.js';
import { Guild, TextChannel } from 'discord.js';

/**
 * In-memory storage for KiwiwiDisplay instances.
 * @type {Map<string, KiwiwiDisplay>}
 */
const displayQueue = new Map();

/**
 * Initializes a new KiwiwiDisplay for a guild and saves it to the database.
 * @param {Guild} guild - The Discord guild.
 * @param {TextChannel} channel - The text channel to use as home.
 * @returns {Promise<KiwiwiDisplay>} The initialized display instance.
 */
export const initKiwiwiDisplay = async (guild, channel) => {
    const display = new KiwiwiDisplay(channel);
    await display.initMessage();

    displayQueue.set(guild.id, display);

    const record = await db.home.findOne({ where: { guild_id: guild.id } });

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

/**
 * Retrieves the KiwiwiDisplay for a guild, restoring it from the database if necessary.
 * @param {Guild} guild - The Discord guild.
 * @returns {Promise<KiwiwiDisplay|boolean>} The display instance, or false if channel not found.
 * @throws {string} Error message if home channel is not initialized.
 */
export const getKiwiwiDisplay = async (guild) => {
    if (displayQueue.has(guild.id)) return displayQueue.get(guild.id);

    const home = await db.home.findOne({ where: { guild_id: guild.id } });
    if (!home) throw 'Kiwiwi Home Channel is not Initialized!';
    
    /** @type {TextChannel} */
    let homeChannel;
    try {
        homeChannel = await guild.channels.fetch(home.channel_id);
        const msg = await homeChannel.messages.fetch(home.kiwiwi_player_id);
        const display = new KiwiwiDisplay(homeChannel, msg);
        displayQueue.set(guild.id, display);
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
        displayQueue.set(guild.id, display);
        return display;
    }
};

/**
 * Manually sets the KiwiwiDisplay for a guild.
 * @param {Guild} guild - The Discord guild.
 * @param {KiwiwiDisplay} display - The display instance to set.
 * @throws {string} Error message if the display channel is invalid.
 */
export const setKiwiwiDisplay = async (guild, display) => {
    const home = await db.home.findOne({ where: { guild_id: guild.id } });

    if (home.channel_id !== display.channel.id) {
        throw 'Invalid display channel';
    }
    displayQueue.set(guild.id, display);
};
