import { Events } from 'discord.js';
import { getVoiceManager } from '#src/queue/voiceManagerQueue.js';
import { KiwiwiPlayer } from '#src/classes/kiwiwiPlayer.js';

export const name = Events.VoiceStateUpdate;
export const execute = async (oldState, newState) => {
    const guild = newState.guild;
    const vm = getVoiceManager(guild);

    // PASS if there is no kiwiwi
    if (!vm || vm?.destroyed) return;

    const botId = guild.members.me.id;

    // Update voiceChannel if kiwiwi is moved
    if (newState.id === botId && newState.channelId && newState.channelId !== vm.voiceChannel.id) {
        vm.voiceChannel = newState.channel;
    }

    // Check member status in the CURRENT channel
    const currentChannel = vm.voiceChannel;
    
    // Only bot is in the channel
    if (currentChannel.members.size === 1) {
        if (!vm.isCountdown) {
            vm.startCountdown();
        }
    } else {
        // Reset countdown only if the player is not IDLE (playing or paused)
        if (vm.isCountdown && vm.kiwiwiPlayer.playstatus !== KiwiwiPlayer.status.IDLE) {
            vm.resetCountdown();
        }
    }
};
