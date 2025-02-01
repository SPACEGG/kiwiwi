import { Events } from 'discord.js';
import db from '#src/database.js';
import { getVoiceManager, addElements } from '#src/queue/voiceManagerQueue.js';
import { confirmEmbed, errorEmbed, warningEmbed } from '#src/embeds.js';
import getMusics from '#src/musics/getMusics.js';
import config from '#src/config.js';
import logger from '#src/logger.js';

export const name = Events.MessageCreate;
export const execute = async (message) => {
    const guild = message.guild;
    const textChannel = message.channel;
    const voiceChannel = message.member.voice.channel;
    let vm = getVoiceManager(guild);

    // check if message is sent at home channel
    const home = await db.home.findOne({
        where: { guild_id: message.guildId },
    });
    if (!home) return;
    if (message.channelId !== home.channel_id) return;

    // check if message is sent by user
    if (message.author.bot) return;

    // auto delete message
    setTimeout(() => {
        message.delete().catch(() => {
            message.reply(
                warningEmbed(`${config.name}가 메시지 관리 권한을 가지고 있지 않아 메시지를 자동 삭제할 수 없어요!
${config.name}가 <#${textChannel.id}>의 **메시지 관리 권한**을 가질 수 있도록 서버 관리자에게 요청해주세요.`)
            );
        });
    }, config.autoDeleteTimeout);

    // check user's channel status
    if (!voiceChannel) {
        const repliedMsg = await message.reply(
            warningEmbed('음성 채널에 먼저 참가해주세요')
        );
        setTimeout(() => {
            repliedMsg.delete();
        }, config.autoDeleteTimeout);
        return false;
    }

    // get music by keyword
    const keyword = message.content;
    let elements = [];

    try {
        elements = await getMusics(keyword, message);
        // connect or add
        await addElements(vm, guild, voiceChannel, elements);
    } catch (e) {
        logger.error(`MusicKeywordError: ${e}`);
        const repliedMsg = await message.reply(
            errorEmbed(`유효하지 않은 입력이에요: \`${keyword}\``)
        );
        setTimeout(() => {
            repliedMsg.delete();
        }, config.autoDeleteTimeout);
        return;
    }

    try {
        const msgFetch = await textChannel.messages.fetch(message.id);
        const replyMessage = await msgFetch.reply(
            confirmEmbed(`음악 ${elements.length}개를 대기열에 추가했어요.`)
        );
        setTimeout(() => {
            replyMessage.delete();
        }, config.autoDeleteTimeout);
    } catch (e) {
        logger.warn('message already deleted!');
    }
    return;
};
