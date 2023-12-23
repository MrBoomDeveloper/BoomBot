import { isDebug, isOwnerMessage } from "@util/common";
import { parseCommandArgs } from "@util/parser";
import { messageTo, replyTo, resolveChatId } from "@util/reply";
import { Message } from "node-telegram-bot-api";
import { getChatFeeds, getFeed } from "./backend";

export async function handleRssUpdate(message: Message) {
	if(!isOwnerMessage(message)) return;
	const args = parseCommandArgs(message.text);

	const chatId = args.length > 1 
		? await resolveChatId(args[0])
		: message.chat.id;
	
	if(chatId == null) {
		replyTo(message, "Вы указали неправильный чат!");
		return;
	}

	const feeds = await getChatFeeds(chatId);
	
	if(feeds.length == 0) {
		replyTo(message, "Вы еще не добавили ни одной ленты.");
		return;
	}

	for(const feedInfo of feeds) {
		try {
			if(!feedInfo.isActive) continue;
			const feed = await getFeed(feedInfo.url);

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

				try {
					await messageTo(message, text);
				} catch(e) {
					messageTo(message, "Не удалось отправить ленту");
					
					if(isDebug()) {
						messageTo(message, `Ошибка: ${JSON.stringify(e)}, Элемент: ${JSON.stringify(item)}`);
					}
				}
			}
		} catch(e) {
			replyTo(message, `Не удалось получить ленту ${feedInfo.url}.`);
		}
	}
}



