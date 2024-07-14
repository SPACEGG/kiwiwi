import { Events } from 'discord.js';
import db from '#src/database.js';
import { VoiceManager } from '#src/voiceManager.js';
import { voiceManagerQueue } from '#src/queue.js';
import { confirmEmbed, errorEmbed } from '#src/embeds.js';
import { isURL } from '#src/utils.js';
import {
    isYoutubePlaylistURL,
    getYoutubePlaylist,
    getYoutubeInfo,
    makeYoutubeURLFromId,
} from '#src/youtubeUtils.js';
import config from '#src/config.js';

export const name = Events.MessageCreate;
export const execute = async (message) => {
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
                errorEmbed(`${config.name}가 메시지 관리 권한을 가지고 있지 않아 메시지를 자동 삭제할 수 없어요!
${config.name}가 <#${message.channel.id}>의 **메시지 관리 권한**을 가질 수 있도록 서버 관리자에게 요청해주세요.`)
            );
        });
    }, config.autoDeleteTimeout);

    // check if user is in voice channel
    if (!message.member.voice.channel) {
        const repliedMsg = await message.reply(
            errorEmbed('음성 채널에 먼저 참가해주세요')
        );
        setTimeout(() => {
            repliedMsg.delete();
        }, config.autoDeleteTimeout);
        return false;
    }

    // play
    const link = message.content;
    if (!isURL(link)) {
        const repliedMsg = await message.reply(
            errorEmbed(`유효하지 않은 링크에요: \`${link}\``)
        );
        setTimeout(() => {
            repliedMsg.delete();
        }, config.autoDeleteTimeout);
        return;
    }
    try {
        // get music info
        let elements = [];
        if (isYoutubePlaylistURL(link)) {
            const ytPlaylist = await getYoutubePlaylist(link);
            elements = ytPlaylist.videos.map((i) => {
                return {
                    link: makeYoutubeURLFromId(i.videoId),
                    title: i.title,
                    duration: i.duration.seconds,
                    thumbnail: i.thumbnail,
                    userId: message.author.id,
                    channelId: message.member.voice.channel.id,
                };
            });
        } else {
            const ytInfo = await getYoutubeInfo(link);
            elements = [
                {
                    link: link,
                    title: ytInfo.title,
                    duration: ytInfo.duration.seconds,
                    thumbnail: ytInfo.thumbnail,
                    userId: message.author.id,
                    channelId: message.member.voice.channel.id,
                },
            ];
        }

        // connect or add
        let vm = voiceManagerQueue[message.guild.id];
        if (!vm) {
            vm = new VoiceManager(message.member.voice.channel);
            voiceManagerQueue[message.guild.id] = vm;
            await vm.connect();
            vm.kiwiwiPlayer.add(elements);
            vm.kiwiwiPlayer.play();
        } else {
            vm.kiwiwiPlayer.add(elements);
        }

        const repliedMsg = await message.reply(
            confirmEmbed(`음악 ${elements.length}개를 대기열에 추가했어요.`)
        );
        setTimeout(() => {
            repliedMsg.delete();
        }, config.autoDeleteTimeout);
    } catch (e) {
        const repliedMsg = await message.reply(
            errorEmbed(`유효하지 않은 링크에요: \`${link}\``)
        );
        setTimeout(() => {
            repliedMsg.delete();
        }, config.autoDeleteTimeout);
    }
    return;
};
