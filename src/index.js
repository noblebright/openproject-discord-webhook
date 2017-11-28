const conf = require('./conf');
const db = require('./db');
const discord = require('./discord');

function main() {
    let config = conf.loadConfig();
    let connection = db.getConnection(config.DATABASE_URL);
    let runTimestamp = Date.now();
    let test = !isNaN(process.argv[2]) && process.argv[2] * 1;
    if(test) {
        console.log('test mode!');
        console.log('hook url: ', config.TESTHOOK_URL);
        console.log('timestamp: ', test);
    }
    db.getChanges(connection, test || config.LAST_RUN)
    .then(changes => { return discord.postChanges(test ? config.TESTHOOK_URL : config.WEBHOOK_URL, config.OP_URL, changes); })
    .then(() => { if(!test) { conf.setTimestamp(runTimestamp); } })
    .then(() => connection.end())
    .catch(err => { 
    	console.error(err);
    	return connection.end();
    });
}

main();
