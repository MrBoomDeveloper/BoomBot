import { isUrl, parseCommandArgs } from "@util/parser";
import { deleteMessageFrom, messageTo, replyTo, resolveChatId } from "@util/reply";
import { ChatId, Message } from "node-telegram-bot-api";
import { Feed, getFeed } from "./backend";
import { isDebug } from "@util/common";
import { useQuery } from "../db/common";
import { removeSideLetters } from "@util/format";

export async function handleRssAdd(message: Message) {
    let isError = false;
    const args = parseCommandArgs(message.text);

	if(args.length == 0) {
		replyTo(message, "Укажите ссылку на подписку!");
		return;
	}

	const chatId = args.length > 1 
		? await resolveChatId(args[0])
		: message.chat.id;

	if(chatId == null) {
		replyTo(message, "Вы указали неправильный чат!");
		return;
	}
        
	let loadingMessage: Message;

	if(chatId == null) {
		replyTo(message, "Неправильный @id канала! Попробуйте скопировать его из шапки.");
		return;
	}
	
	try {
		if(!isUrl(args[1])) {
			replyTo(message, "Указанна поврежденная ссылка: " + args[1]);
			return;
		}
		
		let feed: Feed;
		
		try {
			loadingMessage = await replyTo(message, "Добавляем ленту...");
			feed = await addFeed(chatId, args[1]);
		} catch(e) {
			if(isError) return;
			isError = true;
				
			console.error(e);
			replyTo(message, "Не удалось получить ленту");
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
    const feed = await getFeed(url);

    await useQuery(`INSERT INTO rssfeeds VALUES(?, ?, true)`, [Number(chat), url]);
    return feed;
}



