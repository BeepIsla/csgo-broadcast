document.addEventListener("DOMContentLoaded", () => {
	window.momentDurationFormatSetup(moment);

	fetch("/api/matches").then(r => r.json()).then((matches) => {
		setTimeout(() => {
			let ev = document.createEvent("HTMLEvents");
			ev.initEvent("DOMContentLoaded", false, true);
			document.dispatchEvent(ev);
		}, 15000);

		let live = matches.filter(m => Date.now() - (m.lastEdit * 1000) < (5 * 60 * 1000));
		let past = matches.filter(m => Date.now() - (m.lastEdit * 1000) >= (5 * 60 * 1000));
		live.sort((a,b) => (b.timestamp > a.timestamp) ? 1 : ((a.timestamp > b.timestamp) ? -1 : 0));
		past.sort((a,b) => (b.timestamp > a.timestamp) ? 1 : ((a.timestamp > b.timestamp) ? -1 : 0));

		let tbodyLive = document.getElementById("tableBodyLive");
		let tbodyPast = document.getElementById("tableBodyPast");
		[...tbodyLive.children].forEach(c => c.remove());
		[...tbodyPast.children].forEach(c => c.remove());

		if (live.length <= 0) {
			let empty = document.createElement("td");
			empty.innerText = "";

			let no = document.createElement("td");
			no.innerText = "No";

			let mtches = document.createElement("td");
			mtches.innerText = "matches";

			let available = document.createElement("td");
			available.innerText = "available";

			tbodyLive.appendChild(empty.cloneNode());
			tbodyLive.appendChild(empty.cloneNode());
			tbodyLive.appendChild(no);
			tbodyLive.appendChild(mtches);
			tbodyLive.appendChild(available);
			tbodyLive.appendChild(empty.cloneNode());
			tbodyLive.appendChild(empty.cloneNode());
		}

		if (past.length <= 0) {
			let empty = document.createElement("td");
			empty.innerText = "";

			let no = document.createElement("td");
			no.innerText = "No";

			let mtches = document.createElement("td");
			mtches.innerText = "matches";

			let available = document.createElement("td");
			available.innerText = "available";

			let status = document.createElement("td");
			status.innerText = "No download available";

			tbodyPast.appendChild(empty.cloneNode());
			tbodyPast.appendChild(no);
			tbodyPast.appendChild(mtches);
			tbodyPast.appendChild(available);
			tbodyPast.appendChild(empty.cloneNode());
			tbodyPast.appendChild(status);
		}

		for (let match of live) {
			let tr = document.createElement("tr");

			let td_Play = document.createElement("td");
			let a = document.createElement("a");
			a.href = "steam://rungame/730/76561202255233023/+playcast%20%22" + window.location.origin + "/match/" + match.token + "%22";
			a.innerText = match.token;
			td_Play.appendChild(a);

			let td_Timestamp = document.createElement("td");
			td_Timestamp.innerText = moment(match.timestamp).format("Do MMMM YYYY - HH:mm:ss");

			let td_Map = document.createElement("td");
			td_Map.innerText = match.map;

			let td_Tickrate = document.createElement("td");
			td_Tickrate.innerText = typeof match.tps !== "number" ? parseInt(match.tps) : match.tps;

			let td_Response = document.createElement("td");
			td_Response.innerText = moment.duration(Date.now() - (match.lastEdit * 1000)).format("HH:mm:ss", { trim: false });
			td_Response.id = match.lastEdit;
			td_Response.classList.add("lastResponse");

			let td_Viewers = document.createElement("td");
			td_Viewers.innerText = match.viewers;

			let td_Status = document.createElement("td");
			td_Status.innerText = Date.now() - (match.lastEdit * 1000) > (60 * 1000) ? "OFFLINE" : "LIVE";

			tr.appendChild(td_Play);
			tr.appendChild(td_Timestamp);
			tr.appendChild(td_Map);
			tr.appendChild(td_Tickrate);
			tr.appendChild(td_Response);
			tr.appendChild(td_Viewers);
			tr.appendChild(td_Status);

			tbodyLive.appendChild(tr);
		}

		for (let match of past) {
			let tr = document.createElement("tr");

			let td_Play = document.createElement("td");
			td_Play.innerText = match.token;

			let td_Timestamp = document.createElement("td");
			td_Timestamp.innerText = moment(match.timestamp).format("Do MMMM YYYY - HH:mm:ss");

			let td_Map = document.createElement("td");
			td_Map.innerText = match.map;

			let td_Tickrate = document.createElement("td");
			td_Tickrate.innerText = typeof match.tps !== "number" ? parseInt(match.tps) : match.tps;

			let td_Response = document.createElement("td");
			td_Response.innerText = moment.duration(Date.now() - (match.lastEdit * 1000)).format("HH:mm:ss", { trim: false });
			td_Response.id = match.lastEdit;
			td_Response.classList.add("lastResponse");

			let td_Status = document.createElement("td");
			if (typeof match.demo === "undefined") {
				td_Status.innerText = "No download available";
			} else {
				let a = document.createElement("a");
				a.href = match.demo;
				a.innerText = "Download";
				td_Status.appendChild(a);
			}

			tr.appendChild(td_Play);
			tr.appendChild(td_Timestamp);
			tr.appendChild(td_Map);
			tr.appendChild(td_Tickrate);
			tr.appendChild(td_Response);
			tr.appendChild(td_Status);

			tbodyPast.appendChild(tr);
		}
	});
});

setInterval(() => {
	let lastResponses = [...document.getElementsByClassName("lastResponse")];
	lastResponses.forEach((elem) => {
		elem.innerText = moment.duration(Date.now() - (parseInt(elem.id) * 1000)).format("HH:mm:ss", { trim: false });

		if (elem.parentElement.lastElementChild.id === "tableBodyLive") {
			elem.parentElement.lastElementChild.textContent = Date.now() - (parseInt(elem.id) * 1000) > (60 * 1000) ? "OFFLINE" : "LIVE";
		}
	});
}, 250);
