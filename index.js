// Modules
const express = require("express");
const path = require("path");
const fs = require("fs");

// Instances
const server = express();
const matches = [];

// Middlewares
server.use(require("./helpers/viewCounter.js")(matches));

// Utility Routes
server.get(/\w+\.(css|js|png|ico|svg)$/, (req, res) => {
	let match = req._parsedUrl.path.split("/").pop().match(/^\w+\.(css|js|png|ico|svg)$/);
	if (match.length < 2) {
		res.redirect("/");
		return;
	}

	let filePath = path.join(__dirname, "public", [ "png", "ico", "svg" ].includes(match[1]) ? "images" : match[1], match[0]);
	if (fs.existsSync(filePath) === false) {
		res.sendStatus(404);
		return;
	}

	res.sendFile(filePath);
});

// Routes
server.use("/broadcast", require("./private/broadcast.js"));
server.use("/match", require("./private/match.js"));
server.use("/api", require("./private/api.js")(matches));
server.use("/" , require("./private/main.js"));

// Main redirect
server.all("*", (req, res) => {
	res.redirect("/");
});

// Start listening!
server.listen(8181, () => {
	console.log("Listening to 8181");
});
