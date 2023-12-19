import { useDB } from "./common";

export async function resetDB() {
    await useDB(db => db.query("USE fortune500; CREATE TABLE `rss_channels` (`channelId` bigint NOT NULL, `feeds` TEXT)"));
    await useDB(db => db.query("USE fortune500; CREATE TABLE `rss_feeds` (`id` bigint NOT NULL, `url` varchar(100), `isActive` boolean)"));
    return true;
}



