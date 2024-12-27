import { Events } from 'discord.js';
import { getVoiceManager } from '#src/queue/voiceManagerQueue.js';

export const name = Events.VoiceStateUpdate;
export const execute = async (oldState, newState) => {
    const oldChannelId = oldState.channelId;
    const newChannelId = newState.channelId;
    const oldUserCount = oldState.channel?.members.size ?? 0;
    const guild = newState.guild;
    const vm = getVoiceManager(guild);

    // PASS if there is no kiwiwi
    if (!vm || vm?.destroyed) return;

    // PASS if channel is not kiwiwiChannel
    const kiwiwiChannelId = vm.voiceChannel.id;

    if (oldChannelId === kiwiwiChannelId) {
        if (oldUserCount === 1 && !vm.isCountdown) {
            vm.startCountdown();
        }
    } else if (newChannelId === kiwiwiChannelId) {
        if (vm.isCountdown) {
            vm.resetCountdown();
        }
    }
};
