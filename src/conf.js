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

function setTimestamp() {
}

module.exports = { loadConfig, setTimestamp };
