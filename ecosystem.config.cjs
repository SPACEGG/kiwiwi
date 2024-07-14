module.exports = {
    apps: [
        {
            name: 'kiwiwi',
            script: './index.js',
            env: {},
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};
