import { useDB, useQuery } from "./common";

export async function prepareDB() {
    await useQuery(`CREATE TABLE IF NOT EXISTS rss_channels(channelId bigint NOT NULL, feeds TEXT);
        CREATE TABLE IF NOT EXISTS rss_feeds(id bigint NOT NULL PRIMARY KEY, url varchar(100), isActive boolean)`);
}

export async function resetDB() {
    console.warn("DATABASE WAS RESET!");

    try {
        await useQuery(`DROP TABLE IF EXISTS rss_channels, rss_feeds`);
    } catch(e) {
        console.error(e);
    }

    await prepareDB();
}



