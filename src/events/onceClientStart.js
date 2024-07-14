import { Events, ActivityType, PresenceUpdateStatus } from 'discord.js';
import config from '#src/config.js';

export const name = Events.ClientReady;
export const once = true;
export const execute = (client) => {
    client.user.setPresence({
        activities: [
            {
                name: config.activity,
                type: ActivityType.Custom,
            },
        ],
        status: PresenceUpdateStatus.Online,
    });
    console.log(`Ready! Logged in as ${client.user.tag}`);
};
