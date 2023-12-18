import { Message } from "node-telegram-bot-api";
import { addFeed, removeFeed, listFeeds, getFeed, getXmlFeed } from "./backend";
import { addCommand } from "../..";
import { reply } from "../../util/reply";
import { parseCommandArgs } from "../../util/parser";
import { bot } from "../..";

async function add(message: Message) {
    const args = parseCommandArgs(message.text);
        
    if(args.length < 1) {
        //Suggest to pick a channel
    } else if(args.length < 2) {
        //Suggest to write out a Rss url
    } else {
        reply(message, "Добавляем ленту...");
        
        try {
            const feed = await addFeed(args[0], args[1]);
            
            bot.sendMessage(message.chat.id, 
`Успешно добавлена RSS лента:<a href="${feed.image}"></a>
<b>${feed.title}</b>
${feed.description}
${feed.link}`, { "parse_mode": "HTML" });
        } catch(e) {
            reply(message, e.message);
            
            if(process.env.IS_DEBUG) {
                reply(message, "Ошибка: " + JSON.stringify(e));
            }
        }
    }
}

export default function initRss() {
    addCommand("rss", message => {
        reply(message, "Не доступно на данный момент.");
    });
    
    addCommand("rss_source", async (message) => {
        const args = parseCommandArgs(message.text);
        reply(message, "Загружаем ленту...");
        
        try {
            const data = await getXmlFeed(args[0]);
            let text = JSON.stringify(data);
            
            if(text.length > 4096) {
                text = text.substring(0, 4095);
            }
            
            reply(message, text, { "parse_mode": "markdown" });
        } catch(e) {
            reply(message, "Не удалось загрузить данные");
            
            if(process.env.IS_DEBUG) {
                reply(message, "Ошибка: " + JSON.stringify(e));
            }
        }
    });
    
    addCommand("rss_update", async (message) => {
        if(!process.env.IS_DEBUG) return;
        const args = parseCommandArgs(message.text);
        let isError = false;
        
        try {
            const feed = await getFeed(args[0]);
            
            for(const item of feed.items) {
                let text = `<b>${feed.title}</b>\n`;
                text += `<u><a href="${item.link}">${item.title}</a></u>\n`;
                
                if(item.description != null) {
                    text += `\n${item.description.trim()}`;
                }
                
                if(item.image != null) {
                    text += `<a href="${item.image}"></a>`;
                }
                
                text += "\n";
                
                if(item.tags != null) {
                    text += `\nТеги: #${item.tags.join(", #")}. `;
                }
                
                if(item.date != null) {
                    try {
                        const date = new Date(item.date);
                        
                        text += `\nДата публикации: `;
                        text += `${date.getDate()}-`;
                        text += `${date.getMonth()}-`;
                        text += `${date.getFullYear()}. `;
                    } catch(e) {
                        text += `\n${item.date}.`;
                    }
                }
                
                bot.sendMessage(message.chat.id, text, { "parse_mode": "HTML" })
                    .catch(e => {
                        if(isError) return;
                        isError = true;
                        
                        bot.sendMessage(message.chat.id, "Не удалось отправить ленту");
                    
                        if(process.env.IS_DEBUG) {
                            bot.sendMessage(message.chat.id, 
`Ошибка:
${JSON.stringify(e)}
Элемент:
${JSON.stringify(item)}`);
                        }
                    });
            }
        } catch(e) {
            reply(message, e);
            
            if(process.env.IS_DEBUG) {
                reply(message, "Ошибка: " + JSON.stringify(e));
            }
        }
    });
    
    addCommand("rss_add", add);
}



