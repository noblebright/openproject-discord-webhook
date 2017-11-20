const conf = require('./conf');
const db = require('./db');
const discord = require('./discord');

function main() {
    let config = conf.loadConfig();
    let connection = db.getConnection(config.DATABASE_URL);
    let runTimestamp = Date.now();
    db.getChanges(connection, config.LAST_RUN)
    .then(changes => { return discord.postChanges(config.WEBHOOK_URL, config.OP_URL, changes); })
    .then(() => { conf.setTimestamp(runTimestamp); })
    .then(() => connection.end())
    .catch(err => { 
    	console.error(err);
    	return connection.end();
    });
}

main();
