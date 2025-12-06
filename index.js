import '#src/env.js';
import { Collection } from 'discord.js';
import db from '#src/database.js';
import client from '#src/client.js';
import logger from '#src/logger.js';
import config from '#src/config.js';
import getCookies from '#src/cookies.js';
import { getPOT } from '#src/utils.js';

import { commandCollections } from '#src/deployments/commands.js';
// import { devCommandCollections } from '#src/deployments/dev-commands.js';
import '#src/deployments/events.js';

// cookies
try {
    await getCookies();
    logger.info('Successfully generated cookies.');
} catch (e) {
    logger.error(`CookiesError: ${e}`);
}

// PO Token
// try {
//     config.poToken = await getPOT();
//     logger.info('Successfully generated PO Token.');
// } catch (e) {
//     logger.error(`POTError: ${e}`);
// }

// database
try {
    await db.sequelize.sync();
    logger.info('Successfully synchronized database.');
} catch (e) {
    logger.error(`DatabaseError: ${e}`);
}

// set commands
if (process.env.NODE_ENV !== 'production') {
    // client.commands = new Collection([...commandCollections, ...devCommandCollections]);
    client.commands = new Collection(commandCollections);
} else {
    client.commands = new Collection(commandCollections);
}

// client login
let token = '';
if (process.env.NODE_ENV !== 'production') {
    token = process.env.DEV_DISCORD_TOKEN;
} else {
    token = process.env.DISCORD_TOKEN;
}
client.login(token);
