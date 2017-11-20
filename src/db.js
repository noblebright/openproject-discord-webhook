const mysql = require('mysql');

class PromiseConnection {
	constructor(connection) {
		this._conn = connection;
	}

	end() {
	    return new Promise((resolve, reject) => {
	        this._conn.end(err => { err ? reject() : resolve(); });
	    });
	}

	query(string, values = []) {
		return new Promise((resolve, reject) => {
			this._conn.query(string, values, (err, results, fields) => {
				err ? reject(err) : resolve({ results, fields });
			});
		});
	}
}

//mysql2://user:password@127.0.0.1:3306/database
const connectionPattern = /^([^:]+):\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?\/(.+)/;
function getConnection(url) {
	const match = connectionPattern.exec(url);
	if(!match) {
	    console.error('Unable to parse database url: ', url);
	    process.exit(1);
	}
	const connection = mysql.createConnection({
	    host: match[4],
	    user: match[2],
	    password: match[3],
	    port: match[5] || 3306,
	    database: match[6]
	});
	return new PromiseConnection(connection);
}

const JOURNAL_SQL = 'SELECT activity_type, journable_id, login FROM journals, users WHERE users.id = user_id AND created_at > ?';
function getChanges(conn, lastRun) {
	return conn.query(JOURNAL_SQL, [new Date(lastRun)])
	.then(({results, fields}) => {
		const changeMap = {};
		results.forEach(row => {
			const key = `${row.activity_type}/${row.journable_id}`;
			changeMap[key] = row.login;
		});
		return changeMap;
	});
}

module.exports = { getConnection, getChanges };
