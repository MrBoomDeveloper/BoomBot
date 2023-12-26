import { isUrl, parseCommandArgs } from "@util/parser";
import { deleteMessageFrom, messageTo, replyTo, resolveChatId } from "@util/reply";
import { ChatId, Message } from "node-telegram-bot-api";
import { Feed, getFeed } from "./backend";
import { isDebug } from "@util/common";
import { useQuery } from "../db/common";
import { removeSideLetters } from "@util/format";

export async function handleRssAdd(message: Message) {
    const args = parseCommandArgs(message.text);
    
    const url = args.length == 1
        ? args[0] : args[1];

	if(url == null) {
		replyTo(message, "Укажите ссылку на подписку!");
		return;
	}

	const chatId = args.length > 1 
		? await resolveChatId(args[0])
		: message.chat.id;
        
	let loadingMessage: Message;
	let feed: Feed;

	if(chatId == null) {
		replyTo(message, "Неправильный @id канала! Попробуйте скопировать его из шапки.");
		return;
	}
	
	if(!isUrl(url)) {
		replyTo(message, "Указанна поврежденная ссылка: " + url);
		return;
	}
	
	try {
	    feed = await getFeed(url);
	} catch(e) {
	    replyTo(message, "Не удалось получить ленту, проверьте целостность ссылки.");
	    return;
	}
	
	try {
		try {
			loadingMessage = await replyTo(message, "Добавляем ленту...");
			await addFeed(chatId, url);
		} catch(e) {
			console.error(e);
			replyTo(message, "Лента уже добавлена!");
			return;
		}
		
		messageTo(message, 
`Успешно добавлена RSS лента:
<b><u>${feed.title}</u></b>
- ${feed.description}
- ${feed.link}<a href="${feed.image}"></a>`);

		deleteMessageFrom(loadingMessage);
	} catch(e) {
		if(isError) return;
		isError = true;
				
		console.error(e);
		replyTo(message, "Произошла ошибка во время добавления ленты!");

		if(loadingMessage != null) {
			deleteMessageFrom(loadingMessage);
		}
		
		if(isDebug()) {
			replyTo(message, "Ошибка: " + e);
		}
	}
}

async function addFeed(chat: ChatId, url: string) {
	url = removeSideLetters(url, ["/", "#", "?", "&"]);
    return await useQuery(`INSERT INTO rssfeeds VALUES(?, ?, true)`, [Number(chat), url]);
}



