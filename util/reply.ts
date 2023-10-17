import { Message } from "node-telegram-bot-api";
import { bot } from "..";

export function reply(message: Message, text: string) {
	return bot.sendMessage(message.chat.id, text, {
        reply_to_message_id: message.message_id,
        parse_mode: "HTML"
    });
}