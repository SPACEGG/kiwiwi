import { VoiceManager } from '#src/classes/voiceManager.js';

// voiceManagerQueue: Map<guildId: string, VoiceManager>
const voiceManagerQueue = new Map();

export const initVoiceManager = (guild, channel) => {
    voiceManagerQueue[guild.id] = new VoiceManager(channel);
    return voiceManagerQueue[guild.id];
};

export const getVoiceManager = (guild) => {
    return voiceManagerQueue[guild.id];
};

export const destroyVoiceManager = (guild) => {
    const vm = getVoiceManager(guild);
    vm.destroy();
    delete voiceManagerQueue[guild.id];
};

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
