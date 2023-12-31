import { parseCommandArgs } from "@util/parser";
import { replyTo, resolveChatId } from "@util/reply";
import { Message } from "node-telegram-bot-api";
import { getChatFeeds } from "./backend";
import { isDebug } from "@util/common";

export async function handleRssList(message: Message) {
	const args = parseCommandArgs(message.text);

	const chatId = args.length > 0
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

	let text = "";

	for(const feed of feeds) {
		text += `${feed.url}`;
		text += " - " + (feed.isActive ? "Активна" : "Не Активна") + "\n";
	}

	replyTo(message, text);
}