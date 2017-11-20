function postChanges(webhook, op, changes) {
	console.log(webhook, op, changes);
	return Promise.resolve();
}

module.exports = { postChanges };
