export default {
    name: process.env.NODE_ENV !== 'production' ? 'kiwiwi-dev' : 'kiwiwi',
    version: '0.1.0',
    kiwi: '🥝',
    kiwiGreen: 0x85b319,
    errorRed: 0xef5350,
    warnYellow: 0xffe070,
    activity: '🥝 키위위 도움말: /help',
    maxPlaylistBackup: 15,
    scheduleDuration: 7_000,
    interactionWaitingTimeout: 60_000,
    autoDeleteTimeout: 15_000,
};
