import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.NODE_ENV !== 'production'
        ? process.env.DEV_DATABASE_NAME
        : process.env.DATABASE_NAME,
    process.env.NODE_ENV !== 'production'
        ? process.env.DEV_DATABASE_USER
        : process.env.DATABASE_USER,
    process.env.NODE_ENV !== 'production'
        ? process.env.DEV_DATABASE_PASSWORD
        : process.env.DATABASE_PASSWORD,
    {
        host:
            process.env.NODE_ENV !== 'production'
                ? process.env.DEV_DATABASE_HOST
                : process.env.DATABASE_HOST,
        logging: false,
        dialect: 'mariadb',
        define: { freezeTableName: true },
    }
);

// define models
const global = sequelize.define('global', {
    key: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    value: {
        type: Sequelize.TEXT,
    },
});

const guilds = sequelize.define('guilds', {
    guild_id: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    is_initialized: {
        type: Sequelize.BOOLEAN,
    },
});

const home = sequelize.define('home', {
    guild_id: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    channel_id: {
        type: Sequelize.STRING,
    },
    kiwiwi_player_id: {
        type: Sequelize.STRING,
    },
});

// export
const db = {
    sequelize,
    guilds,
    global,
    home,
};

export default db;
