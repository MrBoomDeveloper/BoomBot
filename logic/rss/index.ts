import { Message } from "node-telegram-bot-api";
import { addFeed, removeFeed, listFeeds, getFeed, getXmlFeed } from "./backend";
import { addCommand } from "../..";
import { reply } from "../../util/reply";
import { parseCommandArgs } from "../../util/parser";
import { bot } from "../..";

async function add(message: Message) {
    const args = parseCommandArgs(message.text);
        
    if(args.length < 1) {
        reply(message, "Укажите канал!");
    } else if(args.length < 2) {
        reply(message, "Укажите ссылку на подписку!");
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
        bot.sendMessage(message.chat.id, 
`<b>Об RSS возможностях бота:</b>
Получайте самые последние новости благодаря недооцененной технологии RSS прямо в личные сообщения или своф Telegram канал!
Каждый час мы будем проверять ваши подписки на изменения и присылать их вам.
    
<b>Как начать пользоваться:</b>
1. Добавьте бота на канал, куда нужно присылать новые посты
2. Используйте /rss_add, чтобы подписаться на новые посты
3. Наслаждайтесь!`, {"parse_mode": "HTML"});
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
    
    addCommand("rss_explore", message => {
        reply(message, "Не доступно на данный момент");
    });
    
    addCommand("rss_remove", message => {
        reply(message, "Недоступно на данный момент");
    });
    
    addCommand("rss_list", message => {
        reply(message, "Недоступно на данный момент");
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



