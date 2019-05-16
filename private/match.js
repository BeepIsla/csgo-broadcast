// Modules
const express = require("express");
const fs = require("fs");

// Instances
const server = express();

// Pages
server.get("/:token/sync", async (req, res) => {
	if (fs.existsSync("./bin/" + req.params.token) === false) {
		res.sendStatus(404);
		return;
	}

	let stat = fs.statSync("./bin/" + req.params.token);
	const frames = fs.existsSync("./bin/" + req.params.token + "/fragments.json") ? JSON.parse(fs.readFileSync("./bin/" + req.params.token + "/fragments.json")) : [];
	const config = JSON.parse(fs.readFileSync("./bin/" + req.params.token + "/config.json"));

	if ((Date.now() - stat.mtimeMs) > (5 * 60 * 1000)) {
		// The match counts as ended - Lets send the client everything from the beginning
		res.send({
			tick: 1,
			rtdelay: 1,
			rcvage: 1,
			fragment: 0,
			signup_fragment: 0,
			tps: typeof config.tps !== "number" ? parseInt(config.tps) : config.tps,
			protocol: typeof config.protocol !== "number" ? parseInt(config.protocol) : config.protocol
		});
		return;
	}

	// If we have less than 5 fragments we 404 as not enough data is available yet
	if (frames.length < 5) {
		res.sendStatus(404);
		return;
	}

	// Use the first one, new fragments are added to the end, so the first one is always the oldest one
	// using an old one will prevent spam for the client for non-existant fragments
	const frame = frames.shift();

	res.send({
		tick: typeof frame.tick !== "number" ? parseInt(frame.tick) : frame.tick,
		rtdelay: 1,
		rcvage: 1,
		fragment: typeof frame.fragmentNumber !== "number" ? parseInt(frame.fragmentNumber) : frame.fragmentNumber,
		signup_fragment: typeof config.startFragment !== "number" ? parseInt(config.startFragment) : config.startFragment,
		tps: typeof config.tps !== "number" ? parseInt(config.tps) : config.tps,
		protocol: typeof config.protocol !== "number" ? parseInt(config.protocol) : config.protocol
	});
});

server.get("/:token/:fragmentNumber/:frameType", (req, res) => {
	if (fs.existsSync("./bin/" + req.params.token + "/" + req.params.fragmentNumber + "_" + req.params.frameType) === false) {
		res.sendStatus(404);
		return;
	}

	if (req.params.frameType === "start") {
		let stat = fs.statSync("./bin/" + req.params.token);
		if (Date.now() - stat.mtimeMs >= (5 * 60 * 1000)) {
			console.log("Start replay playcast for match " + req.params.token + " and fragment " + req.params.fragmentNumber + " with frame type " + req.params.frameType + " for user " + req.connection.remoteAddress);
		} else {
			console.log("Start live playcast for match " + req.params.token + " and fragment " + req.params.fragmentNumber + " with frame type " + req.params.frameType + " for user " + req.connection.remoteAddress);
		}
	}

	res.setHeader("Content-Type", "application/octet-stream");
	const p = fs.createReadStream("./bin/" + req.params.token + "/" + req.params.fragmentNumber + "_" + req.params.frameType);
	p.pipe(res);
});

server.get("/", (req, res) => {
	res.sendStatus(400);
});

// Main redirect
server.all("*", (req, res) => {
	res.redirect("/");
});

// Export
module.exports = server;
