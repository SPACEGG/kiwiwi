import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

export default {
    name: process.env.NODE_ENV !== 'production' ? 'kiwiwi-dev' : 'kiwiwi',
    version: packageJson.version,
    kiwiGreen: 0x85b319,
    errorRed: 0xef5350,
    warnYellow: 0xffe070,
    activity: '🥝 키위위 도움말: /help',
    maxPlaylistBackup: 100,
    scheduleDuration: 7_000,
    interactionWaitingTimeout: 60_000,
    autoDeleteTimeout: 15_000,
    vmCountdownTimeout: 300_000,
    searchCommandList: 10,
    emoji: {
        kiwi: '🥝',
        play: process.env.EMOJI_PLAY || '▶',
        pause: process.env.EMOJI_PAUSE || '⏸',
        back: process.env.EMOJI_BACK || '⏮',
        next: process.env.EMOJI_NEXT || '⏭',
        stop: process.env.EMOJI_STOP || '⏹',
        shuffle: process.env.EMOJI_SHUFFLE || '🔀',
        loop: process.env.EMOJI_LOOP || '🔁',
    },
};
