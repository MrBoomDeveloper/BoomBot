import { getFeed, getXmlFeed, getChatFeeds } from "./backend";
import { addTextCommand } from "@logic/bot";
import { messageTo, replyTo, resolveChatId } from "@util/reply";
import { parseCommandArgs } from "@util/parser";
import { isDebug, isOwnerMessage } from "@util/common";
import { handleRssAdd } from "./add";
import { handleRssUpdate } from "./update";
import { handleRssList } from "./list";

export default function initRss() {
    addTextCommand("rss", message => {
        messageTo(message, 
`<b>Об RSS возможностях бота:</b>
Получайте самые последние новости благодаря недооцененной технологии RSS прямо в личные сообщения или своф Telegram канал!
Каждый час мы будем проверять ваши подписки на изменения и присылать их вам.
    
<b>Как начать пользоваться:</b>
1. Добавьте бота на канал, куда нужно присылать новые посты
2. Используйте /rss_add, чтобы подписаться на новые посты
3. Наслаждайтесь!`, {"parse_mode": "HTML"});
    });
    
    addTextCommand("rss_source", async (message) => {
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
            
            if(isDebug()) {
                replyTo(message, "Ошибка: " + JSON.stringify(e));
            }
        }
    });
    
    addTextCommand("rss_remove", message => {
        replyTo(message, "Недоступно на данный момент");
    });
    
    addTextCommand("rss_list", handleRssList);
    addTextCommand("rss_update", handleRssUpdate);
    addTextCommand("rss_add", handleRssAdd);
}



