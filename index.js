import '#src/env.js';
import { Collection } from 'discord.js';
import db from '#src/database.js';
import client from '#src/client.js';

import { commandCollections } from '#src/deployments/commands.js';
import { devCommandCollections } from '#src/deployments/dev-commands.js';
import '#src/deployments/events.js';

// database
try {
    await db.sequelize.sync();
    console.log('Successfully synchronized database.');
} catch (error) {
    console.error(error);
}

// set commands
client.commands = new Collection([...commandCollections, ...devCommandCollections]);

// client login
let token = '';
if (process.env.NODE_ENV !== 'production') {
    token = process.env.DEV_DISCORD_TOKEN;
} else {
    token = process.env.DISCORD_TOKEN;
}
client.login(token);
