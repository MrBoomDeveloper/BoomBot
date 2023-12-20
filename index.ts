import express from "express";
import "dotenv/config";
import initCommon from "./logic/base/common";
import initAdmin from "./logic/base/admin";
import initRss from "./logic/rss";
import initMafia from "./logic/mafia";
import { prepareDB } from "./logic/db/unsafe";
import { finishBot, startBot } from "./logic/bot/lifecycle";

/* Start an empty server to pass a "healthy" check */

export const expressApp = express();

expressApp.get("*", (req, res) => {
    console.warn("Bot has been checked through the api endpoint.");
    
	res.status(200);
	res.send("Bot is alive!");
});

expressApp.listen(8000, () => {
	console.log("Server started!");
});


/* START EVERYTHING */

export async function main() {
    try {
        await prepareDB();
        startBot();

        initMafia();
        initRss();
        initCommon();
        initAdmin();
        
        console.debug("Started everything successfully!");
    } catch(e) {
        finishBot(e);
    }
}

main();



