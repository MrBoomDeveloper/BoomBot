import { XMLParser, XMLBuilder, XMLValidator} from "fast-xml-parser";
import { useDB, useQuery } from "../db/common";
import { ChatId } from "node-telegram-bot-api";

const parser = new XMLParser({
    ignoreAttributes: false,
    unpairedTags: ["img"]
});

export interface Feed {
    title: string,
    items: FeedItem[],
    link?: string,
    description?: string,
    date?: string,
    image?: string
}

export interface FeedItem {
    title: string,
    description?: string,
    link?: string,
    image?: string,
    date?: string,
    tags?: string[]
}

export async function getXmlFeed(url: string) {
    const response = await fetch(url);
    const xml = await response.text();
    const data = parser.parse(xml).rss.channel;
    
    return data;
}

export async function getFeed(url: string) {
    const data = await getXmlFeed(url);
            
    const feed: Feed = {
        title: data.title,
        items: [],
        description: data.description,
        link: data.link,
        date: data.pubDate,
        image: data.image?.url
    }
            
    for(const item of data.item) {
        try {
            const imgElement = parser.parse(item.description);
            
            if("@_src" in imgElement.img) {
                item.description = null;
                item.thumb = imgElement.img["@_src"];
            }
            
            if("@_src" in imgElement?.a?.img) {
                item.thumb = imgElement.img["@_src"];
            }
        } catch(e) {}
        
        if(item.description != null) {
            item.description = item.description
                .replaceAll("</p> ", "</p>")
                .replaceAll("<p>", "")
                .replaceAll("</p>", "\n")
                .replaceAll("&nbsp;", " ")
                .replaceAll("<br>", "\n")
                .replaceAll("&rarr;", "—›");
                
            while(item.description.includes("<img ")) {
                const startIndex = item.description.indexOf("<img ");
                const a = item.description.substring(startIndex) + 2;
                const endIndex = startIndex + a.indexOf(">") + 1;
                
                const b = a.substring(a.indexOf("src=") + 3);
                const c = b.substring(0, b.indexOf("\""));
            
                item.description = item.description.substring(0, startIndex)
                    + item.description.substring(endIndex);
            }
            
            for(const char of ["\n", "\t", " "]) {
                while(item.description.includes(char + char)) {
                    item.description = item.description.replaceAll(char + char, char);
                }
            }
            
            for(const char of ["\n", "\t", " "]) {
                while(item.description.startsWith(char)) {
                    item.description = item.description.substring(1);
                }
            }
        }
        
        const feedItem: FeedItem = {
            title: item.title,
            description: item.description,
            image: item.thumb,
            link: item.link,
            tags: (item.keywords ? item.keywords.split(",") : []),
            date: item.pubDate
        }
        
        if(item.category != null) {
            feedItem.tags = [...feedItem.tags, ...item.category];
        }
        
        if(feedItem.tags.length == 0) {
            feedItem.tags = null;
        }
        
        feed.items.push(feedItem);
    }
    
    return feed;
}

export async function addFeed(chat: ChatId, url: string) {
    const response = await useQuery(`INSERT INTO rss_feeds VALUES(?, ?, true)`, [Number(chat), url]);
    return await getFeed(url);
}

export async function removeFeed(chat: ChatId, url: string) {
    return await new Promise((res, rej) => {
        rej({message: "Лента не была добавлена в канале."});
    });
}

export async function listFeeds(chat: ChatId) {
    return await new Promise((res, rej) => {
        rej({message: "На канале отсутствуют какие-либо ленты."});
    });
}



