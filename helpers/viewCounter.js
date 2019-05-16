const fs = require("fs");

module.exports = (matchViewers) => {
	// Every 10 seconds run through all matches and viewers,
	// remove the ones which didn't request any data for 60 seconds
	setInterval(() => {
		for (let i = 0; i < matchViewers.length; i++) {
			matchViewers[i].viewers = matchViewers[i].viewers.filter(v => Date.now() - v.lastResponse < 60000);
		}
	}, 10000);

	return ((req, res, next) => {
		if (req._parsedUrl.pathname.split("/")[1] === "broadcast") {
			let token = req._parsedUrl.pathname.split("/")[2];
			if (fs.existsSync("./bin/" + token) === false) {
				return next();
			}

			let index = matchViewers.map(m => m.token).indexOf(token);
			if (index >= 0) {
				return next();
			}

			matchViewers.push({
				token: token,
				viewers: []
			});

			return next();
		}

		if (req._parsedUrl.pathname.split("/")[1] === "match") {
			let token = req._parsedUrl.pathname.split("/")[2];
			if (fs.existsSync("./bin/" + token) === false) {
				return next();
			}

			// Do not do any viewer counting if its a replay
			let stat = fs.statSync("./bin/" + token);
			if (Date.now() - stat.mtimeMs >= (5 * 60 * 1000)) {
				return next();
			}

			let index = matchViewers.map(m => m.token).indexOf(token);
			if (index <= -1) {
				return next();
			}

			let viewerIndex = matchViewers[index].viewers.map(v => v.ip).indexOf(req.ip);
			if (viewerIndex <= -1) {
				matchViewers[index].viewers.push({
					ip: req.ip,
					lastResponse: Date.now()
				});
			} else {
				matchViewers[index].viewers[viewerIndex].lastResponse = Date.now();
			}

			return next();
		}

		return next();
	});
}
