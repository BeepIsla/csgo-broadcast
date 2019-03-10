module.exports = (matchViewers) => {
	// Modules
	const express = require("express");
	const fs = require("fs");

	// Instances
	const server = express();

	// Pages
	server.get("/matches", (req, res) => {
		let matches = fs.readdirSync("./bin");
		let response = [];

		for (let match of matches) {
			let stat = fs.statSync("./bin/" + match);
			if (stat.isDirectory() === false) {
				continue;
			}

			if (fs.existsSync("./bin/" + match + "/config.json") === false) {
				console.log("Match " + match + " not ready - Skipping");
				continue;
			}

			if ((Date.now() - stat.mtimeMs) > (14 * 24 * 60 * 60 * 1000)) {
				console.log("Match " + match + " is too old");
				continue;
			}

			let json = JSON.parse(fs.readFileSync("./bin/" + match + "/config.json"));
			json.lastEdit = Math.floor(stat.mtimeMs / 1000);
			delete json.auth;

			let index = matchViewers.map(m => m.token).indexOf(match);
			if (index <= -1) {
				json.viewers = 0;
			} else {
				json.viewers = matchViewers[index].viewers.length;
			}

			response.push(json);
		}

		res.send(response);
	});

	// Main redirect
	server.all("*", (req, res) => {
		res.redirect("/");
	});

	// Export
	return server;
}
