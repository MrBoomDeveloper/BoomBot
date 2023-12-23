import { useDB, useQuery } from "./common";

export async function prepareDB() {
    await useQuery(`CREATE TABLE IF NOT EXISTS rssfeeds (`
        + `chat BIGINT NOT NULL, `
        + `url VARCHAR(512) NOT NULL, `
        + `isActive BOOLEAN NOT NULL, `
        + `PRIMARY KEY (chat, url), UNIQUE(chat), UNIQUE(url))`);
}

export async function resetDB() {
    console.warn("DATABASE WAS RESET!");

    try {
        await useQuery(`DROP TABLE IF EXISTS rssfeeds`);
    } catch(e) {
        console.error(e);
    }

    await prepareDB();
}



