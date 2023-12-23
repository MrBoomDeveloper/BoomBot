import { isDebug } from "@util/common";
import express, { Express } from "express";
import { Server } from "http";
import { readFile } from "fs/promises";
import { registerServerPaths } from "@src/web/server";

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
	lastChange = new Date();

	if(await isAnotherInstanceNewer()) {
		throw new Error("There is a newer instance already running!");
	}

	expressApp = express();

	expressApp.get("/", (req, res) => {
		res.status(200);
		res.json({
			"last_change_date": lastChange,
			"is_debug": isDebug()
		});
	});

	registerServerPaths(expressApp);
	
	expressListener = expressApp.listen(8000, () => {
		console.log("Server started!");
	});
}