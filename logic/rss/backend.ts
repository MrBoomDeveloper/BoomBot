import { XMLParser, XMLBuilder, XMLValidator} from "fast-xml-parser";

const parser = new XMLParser({
    ignoreAttributes: false,
    unpairedTags: ["img"]
});

interface Feed {
    title: string,
    items: FeedItem[],
    link?: string,
    description?: string,
    date?: string
}

interface FeedItem {
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

export function getFeed(url: string) {
    const promise = new Promise(async (res, rej) => {
        try {
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
                        .replaceAll("<br>", "\n");
                        
                    while(item.description.includes("<img ")) {
                        const startIndex = item.description.indexOf("<img ");
                        const a = item.description.substring(startIndex) + 2;
                        const endIndex = startIndex + a.indexOf(">") + 1;
                        
                        const b = a.substring(a.indexOf("src=") + 3);
                        const c = b.substring(0, b.indexOf("\""));
                    
                        item.description = item.description.substring(0, startIndex)
                            + item.description.substring(endIndex);
                        
                        console.error(item.description);
                    }
                    
                    while(item.description.startsWith("\n")) {
                        item.description = item.description.substring(1);
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
            
            res(feed);
        } catch(e) {
            rej({message: "Не удалось получить ленту."});
            console.error(e);
        }
    });
    
    return promise;
}

export async function addFeed(channel: string, url: string) {
    return await getFeed(url);
}

export function removeFeed(channel: string, url: string) {
    const promise = new Promise((res, rej) => {
        rej({message: "Лента не была добавлена в канале."});
    });
    
    return promise;
}

export function listFeeds(channel: string) {
    const promise = new Promise((res, rej) => {
        rej({message: "На канале отсутствуют какие-либо ленты."});
    });
    
    return promise;
}



