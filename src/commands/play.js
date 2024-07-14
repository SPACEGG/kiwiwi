import { SlashCommandBuilder } from 'discord.js';
import { checkHomeChannel } from '#src/utils.js';
import { VoiceManager } from '#src/voiceManager.js';
import { voiceManagerQueue } from '#src/queue.js';
import { errorEmbed, confirmEmbed } from '#src/embeds.js';
import { isURL } from '#src/utils.js';
import {
    isYoutubePlaylistURL,
    getYoutubePlaylist,
    getYoutubeInfo,
    makeYoutubeURLFromId,
} from '#src/youtubeUtils.js';
import config from '#src/config.js';

/**
 * /play [link]
 * - VoiceManager exsits:
 *      + add link to playlist
 * - VoiceManager not exsits:
 *      + vm 생성
 *      + vm connect
 *      + add link to playlist
 *      + play
 */

export const data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('음악을 대기열에 추가해요.')
    .addStringOption((option) =>
        option.setName('link').setDescription('음악 링크 url').setRequired(true)
    );

export const execute = async (interaction) => {
    // deferReply
    await interaction.deferReply({ ephemeral: true });
    setTimeout(() => {
        interaction.deleteReply();
    }, config.autoDeleteTimeout);

    // check user's channel status
    if (!interaction.member.voice.channel) {
        await interaction.editReply(errorEmbed('음성 채널에 먼저 참가해주세요'));
        return false;
    }
    if (!(await checkHomeChannel(interaction))) return false;

    const link = interaction.options.getString('link');
    if (!isURL(link)) {
        await interaction.editReply(errorEmbed(`유효하지 않은 링크에요: \`${link}\``));
        return;
    }

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
                userId: interaction.user.id,
                channelId: interaction.member.voice.channel.id,
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
                userId: interaction.user.id,
                channelId: interaction.member.voice.channel.id,
            },
        ];
    }

    // connect or add
    let vm = voiceManagerQueue[interaction.guild.id];
    if (!vm) {
        vm = new VoiceManager(interaction.member.voice.channel);
        voiceManagerQueue[interaction.guild.id] = vm;
        await vm.connect();
        vm.kiwiwiPlayer.add(elements);
        vm.kiwiwiPlayer.play();
    } else {
        vm.kiwiwiPlayer.add(elements);
    }

    await interaction.editReply(
        confirmEmbed(`음악 ${elements.length}개를 대기열에 추가했어요.`)
    );
};
