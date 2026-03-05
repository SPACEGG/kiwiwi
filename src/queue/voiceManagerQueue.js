import { VoiceManager } from '#src/classes/voiceManager.js';
import { Guild, VoiceChannel } from 'discord.js';

/**
 * In-memory storage for VoiceManager instances.
 * @type {Map<string, VoiceManager>}
 */
const voiceManagerQueue = new Map();

/**
 * Initializes a new VoiceManager for a guild.
 * @param {Guild} guild - The Discord guild.
 * @param {VoiceChannel} channel - The voice channel to connect to.
 * @returns {VoiceManager} The initialized VoiceManager instance.
 */
export const initVoiceManager = (guild, channel) => {
    const vm = new VoiceManager(channel);
    voiceManagerQueue.set(guild.id, vm);
    return vm;
};

/**
 * Retrieves the VoiceManager for a guild.
 * @param {Guild} guild - The Discord guild.
 * @returns {VoiceManager} The VoiceManager instance.
 */
export const getVoiceManager = (guild) => {
    return voiceManagerQueue.get(guild.id);
};

/**
 * Destroys and removes the VoiceManager for a guild.
 * @param {Guild} guild - The Discord guild.
 */
export const destroyVoiceManager = (guild) => {
    const vm = getVoiceManager(guild);
    if (vm) {
        vm.destroy();
        voiceManagerQueue.delete(guild.id);
    }
};

/**
 * High-level helper to add music elements to a guild's player, handling connection and state.
 * @param {VoiceManager} vm - The existing VoiceManager (can be null).
 * @param {Guild} guild - The Discord guild.
 * @param {VoiceChannel} voiceChannel - The voice channel to ensure connection.
 * @param {import('#src/classes/kiwiwiPlayer.js').Music[]} elements - Array of tracks to add.
 * @returns {Promise<void>}
 */
export const addElements = async (vm, guild, voiceChannel, elements) => {
    // connect or add
    if (!vm) {
        vm = initVoiceManager(guild, voiceChannel);
        await vm.connect();
        vm.kiwiwiPlayer.add(elements);
        vm.kiwiwiPlayer.play();
    } else if (vm.destroyed) {
        await vm.reconnect(voiceChannel);
        vm.kiwiwiPlayer.add(elements);
        vm.kiwiwiPlayer.play();
    } else {
        await vm.waitForConnect();
        vm.kiwiwiPlayer.add(elements);
    }
};
