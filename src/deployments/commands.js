import { REST, Routes, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';

let token = '';
if (process.env.NODE_ENV !== 'production') {
    token = process.env.DEV_DISCORD_TOKEN;
} else {
    token = process.env.DISCORD_TOKEN;
}
let clientId = '';
if (process.env.NODE_ENV !== 'production') {
    clientId = process.env.DEV_CLIENT_ID;
} else {
    clientId = process.env.CLIENT_ID;
}

const commandCollections = new Collection();
const commands = [];
const commandsPath = path.join(import.meta.dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
        commandCollections.set(command.data.name, command);
    } else {
        console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
    }
}

export { commandCollections };

const rest = new REST({ version: '10' }).setToken(token);
try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);
    const data = await rest.put(Routes.applicationCommands(clientId), {
        body: commands,
    });

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
    console.error(error);
}
