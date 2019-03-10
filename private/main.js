// Modules
const express = require("express");
const path = require("path");

// Instances
const server = express();

// Pages
server.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "..", "public", "html", "index.html"));
});

server.get("/faq", (req, res) => {
	res.sendFile(path.join(__dirname, "..", "public", "html", "faq.html"));
});

server.get("/autoexec", (req, res) => {
	res.download(path.join(__dirname, "..", "public", "other", "autoexec.cfg"));
});

// Main redirect
server.all("*", (req, res) => {
	res.redirect("/");
});

// Export
module.exports = server;
