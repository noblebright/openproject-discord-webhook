const mysql = require('mysql');
const util = require('./util');

class PromiseConnection {
    constructor(connection) {
        this._conn = connection;
    }

    end() {
        return new Promise((resolve, reject) => {
            this._conn.end(err => {
                err ? reject() : resolve();
            });
        });
    }

    query(string, values = []) {
        return new Promise((resolve, reject) => {
            this._conn.query(string, values, (err, results, fields) => {
                err ? reject(err) : resolve({results, fields});
            });
        });
    }
}

//mysql2://user:password@127.0.0.1:3306/database
const connectionPattern = /^([^:]+):\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?\/(.+)/;
function getConnection(url) {
    const match = connectionPattern.exec(url);
    if (!match) {
        console.error('Unable to parse database url: ', url);
        process.exit(1);
    }
    const connection = mysql.createConnection({
        host: match[4],
        user: match[2],
        password: match[3],
        port: match[5] || 3306,
        database: match[6],
        timezone: 'Z'
    });
    return new PromiseConnection(connection);
}

const JOURNAL_SQL = 'SELECT activity_type, journable_id, login FROM journals, users WHERE users.id = user_id AND created_at > ? ORDER BY created_at';
function getChanges(conn, lastRun) {
    return conn.query(JOURNAL_SQL, [new Date(lastRun)])
        .then(({results, fields}) => {
            const changeMap = {};
            const entityLookups = {};
            results.forEach(row => {
                const key = `${row.activity_type}/${row.journable_id}`;
                if(!entityLookups[row.activity_type]) {
                    entityLookups[row.activity_type] = new Set();
                }
                entityLookups[row.activity_type].add(row.journable_id);
                changeMap[key] = row.login;
            });
            let changeList = Object.keys(changeMap).map(key => {
                return {
                    key,
                    user: changeMap[key]
                };
            });
            return {changeList, entityLookups};
        })
        .then(({changeList, entityLookups}) => {
            let subjects = {};
            const fn = type => {
                let SQL = `SELECT id, subject FROM ${type} WHERE id in (${entityLookups[type].join(',')})`;
                return conn.query(SQL)
                    .then(({results, fields}) => {
                        results.forEach(row => {
                            const key = `${type}/${row.id}`;
                            subjects[key] = row.subject;
                        });
                    });
            };
            return util.promiseMap(Object.keys(entityLookups), fn)
                .then(() => {
                    changeList.forEach(change => {
                        change.name = subjects[change.key];
                    });
                    return changeList;
                });
        });
}

module.exports = {getConnection, getChanges};
