const fs = require('fs');

let config;

function loadConfig(path = '/var/run/openproject-discord.json') {
    try {
        const rawConfig = fs.readFileSync(path, 'utf8');
        config = JSON.parse(rawConfig);
        return config;
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

function setTimestamp(stamp, path = '/var/run/openproject-discord.json') {
    let newConfig = JSON.parse(JSON.stringify(config));
    newConfig.LAST_RUN = stamp;
    fs.writeFileSync(path, JSON.stringify(newConfig, null, 4), 'utf8');
}

module.exports = {loadConfig, setTimestamp};
