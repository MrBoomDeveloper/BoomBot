import { ChatId, Message } from "node-telegram-bot-api";
import { addFeed, removeFeed, listFeeds, getFeed, getXmlFeed } from "./backend";
import { addCommand, bot } from "../..";
import { deleteMessageFrom, messageTo, replyTo, sendMessage } from "@util/reply";
import { isUrl, parseCommandArgs, removeTelegramUrlPrefix } from "../../util/parser";
import { isDebug, isOwnerMessage } from "@util/common";

async function add(message: Message) {
    const args = parseCommandArgs(message.text);
        
    if(args.length < 1) {
        replyTo(message, "Укажите канал!");
    } else if(args.length < 2) {
        replyTo(message, "Укажите ссылку на подписку!");
    } else {
        let chatId: ChatId = args[0];
        let loadingMessage: Message;
        
        try {
            if(isUrl(chatId)) {
                chatId = removeTelegramUrlPrefix(chatId);
            }

            if(isNaN(Number(chatId))) {
                chatId = "@" + chatId;

                try {
                    const chat = await bot.getChat(chatId);
                    chatId = chat.id;
                } catch(e) {
                    replyTo(message, "Неправильный @id канала! Попробуйте скопировать его из шапки.");
                    console.error(e);

                    if(isDebug()) {
                        replyTo(message, "Ошибка: " + e);
                    }
                }
            }

            if(!isUrl(args[1])) {
                replyTo(message, "Указанна поврежденная ссылка: " + args[1]);
                return;
            }

            loadingMessage = await replyTo(message, "Добавляем ленту...");
            const feed = await addFeed(chatId, args[1]);
            
            messageTo(message, 
`Успешно добавлена RSS лента:
<b><u>${feed.title}</u></b>
 - ${feed.description}
 - ${feed.link}<a href="${feed.image}"></a>`);

            deleteMessageFrom(loadingMessage);
        } catch(e) {
            replyTo(message, e.message);
            console.error(e);

            if(loadingMessage != null) {
                deleteMessageFrom(loadingMessage);
            }
            
            if(isDebug()) {
                replyTo(message, "Ошибка: " + e);
            }
        }
    }
}

export default function initRss() {
    addCommand("rss", message => {
        messageTo(message, 
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
        replyTo(message, "Загружаем ленту...");
        
        try {
            const data = await getXmlFeed(args[0]);
            let text = JSON.stringify(data);
            
            if(text.length > 4096) {
                text = text.substring(0, 4095);
            }
            
            replyTo(message, text, { "parse_mode": "MarkdownV2" });
        } catch(e) {
            replyTo(message, "Не удалось загрузить данные");
            
            if(process.env.IS_DEBUG) {
                replyTo(message, "Ошибка: " + JSON.stringify(e));
            }
        }
    });
    
    addCommand("rss_explore", message => {
        replyTo(message, "Не доступно на данный момент");
    });
    
    addCommand("rss_remove", message => {
        replyTo(message, "Недоступно на данный момент");
    });
    
    addCommand("rss_list", message => {
        replyTo(message, "Недоступно на данный момент");
    });
    
    addCommand("rss_update", async (message) => {
        if(!isOwnerMessage(message)) return;
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
                
                messageTo(message, text, { "parse_mode": "HTML" })
                    .catch(e => {
                        if(isError) return;
                        isError = true;
                        
                        messageTo(message, "Не удалось отправить ленту");
                    
                        if(process.env.IS_DEBUG) {
                            messageTo(message,
`Ошибка:
${JSON.stringify(e)}
Элемент:
${JSON.stringify(item)}`);
                        }
                    });
            }
        } catch(e) {
            replyTo(message, e);
            
            if(process.env.IS_DEBUG) {
                replyTo(message, "Ошибка: " + JSON.stringify(e));
            }
        }
    });
    
    addCommand("rss_add", add);
}



