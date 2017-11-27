const request = require('superagent');
const util = require('./util');

function postChanges(webhook, op, changes) {
    console.log(webhook, op, changes);
    let mapChange = change => rateLimitPost(webhook, op, change);
    return util.promiseMap(changes, mapChange);
}

function postChange(webhook, op, change) {
    console.log('postChange: ', change);
    return request.post(webhook)
        .set('Content-Type', 'application/json')
        .query({wait: true})
        .send({
            content: `${change.name || change.key} updated`,
            embeds: [{title: `Open in OpenProject`, url: `${op}${change.key}`}]
        });
}
function rateLimitPost(webhook, op, change) {
    return postChange(webhook, op, change)
        .catch(err => {
            console.log('*******');
            console.log(err.response.body);
            console.log('*******');
            if (err.status === 429) {
                let d = util.defer();
                setTimeout(() => d.resolve(rateLimitPost(webhook, op, change)), err.response.body.retry_after);
                return d.promise;
            } else {
                Promise.reject(err);
            }
        });
}

module.exports = {postChanges};
