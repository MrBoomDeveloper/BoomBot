import "dotenv/config";
import initCommon from "./logic/base/common";
import initAdmin from "./logic/base/admin";
import initRss from "./logic/rss";
import initMafia from "./logic/mafia";
import { prepareDB } from "./logic/db/unsafe";
import { finishBot, startBot } from "./logic/bot/lifecycle";
import { startLifeChecker } from "./logic/bot/life_checker";

export async function main() {
    try {
        await startLifeChecker();
        await prepareDB();
        startBot();

        initMafia();
        initRss();
        initCommon();
        initAdmin();
        
        console.info("Started everything successfully!");
    } catch(e) {
        console.error("Failed to initialize the project!");
        finishBot(e);
    }
}

main();



