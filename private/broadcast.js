// Modules
const express = require("express");
const fs = require("fs");

// Instances
const server = express();

// Pages
server.get("/", (req, res) => {
	res.sendStatus(400);
});

server.post("/reset/:token", (req, res) => {
	if (fs.existsSync("./bin/" + req.params.token) === false) {
		res.sendStatus(200);
		return;
	}

	let files = fs.readdirSync("./bin/" + req.params.token);
	for (let file of files) {
		fs.unlinkSync("./bin/" + req.params.token + "/" + file);
	}

	fs.unlinkSync("./bin/" + req.params.token);
	res.sendStatus(200);
});

server.post("/:token/:fragmentNumber/:frameType", (req, res) => {
	if (req.params.frameType === "start") {
		console.log("Starting broadcast with token " + req.params.token + " and fragment number " + req.params.fragmentNumber);

		fs.mkdirSync("./bin/" + req.params.token);
		fs.writeFileSync("./bin/" + req.params.token + "/config.json", JSON.stringify({
			tick: req.query.tick,
			tps: req.query.tps,
			map: req.query.map,
			protocol: req.query.protocol,

			token: req.params.token,
			timestamp: Date.now(),
			auth: req.headers["x-origin-auth"],
			startFragment: req.params.fragment_number
		}));
	}

	if (fs.existsSync("./bin/" + req.params.token) === false) {
		res.sendStatus(205);
		return;
	}

	const p = fs.createWriteStream("./bin/" + req.params.token + "/" + req.params.fragmentNumber + "_" + req.params.frameType);
	req.pipe(p);

	if (req.params.frameType === "full") {
		console.log("Got fragment " + req.params.fragmentNumber + " for match " + req.params.token + " at tick " + req.query.tick);

		const json = fs.existsSync("./bin/" + req.params.token + "/fragments.json") ? JSON.parse(fs.readFileSync("./bin/" + req.params.token + "/fragments.json")) : [];
		json.push({
			fragmentNumber: req.params.fragmentNumber,
			tick: req.query.tick
		});

		if (json.length > 5) {
			json.shift();
		}

		fs.writeFileSync("./bin/" + req.params.token + "/fragments.json", JSON.stringify(json));
	}

	res.sendStatus(200);
});

// Main redirect
server.all("*", (req, res) => {
	res.redirect("/");
});

// Export
module.exports = server;
