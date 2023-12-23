import { isDebug } from "@util/common";
import express, { Express } from "express";
import { Server } from "http";
import { stat as fileStat } from "fs/promises";
import { resolve as resolvePath } from "path";

let expressApp: Express;
let expressListener: Server;
let lastChange: Date;

export async function isAnotherInstanceNewer() {
	const instance = await getAnotherInstanceRunning();
	if(instance == null) return false;

	const plainDate = instance["last_change_date"];
	if(plainDate == null) return false;

	const date = new Date(plainDate);
	return date.getTime() > lastChange.getTime();
}

export async function getAnotherInstanceRunning() {
	if(isDebug() || process.env.HOST == null || process.env.HOST == "") {
		return null;
	}

	try {
		const response = await fetch(process.env.HOST);
		return await response.json();
	} catch(e) {
		return null;
	}
}

export async function finishLifeChecker() {
	expressListener.close();
	expressListener.closeAllConnections();

	expressApp = null;
	expressListener = null;
}

export async function startLifeChecker() {
	const path = resolvePath("./");
	const stats = await fileStat(path);
	lastChange = stats.mtime;

	if(await isAnotherInstanceNewer()) {
		throw new Error("There is a newer instance already running!");
	}

	expressApp = express();

	expressApp.get("*", (req, res) => {
		res.status(200);
		res.json({
			"root_path": path,
			"last_change_date": lastChange
		});
	});
	
	expressListener = expressApp.listen(8000, () => {
		console.log("Server started!");
	});
}