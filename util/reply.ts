import { ChatId, Message, SendMessageOptions } from "node-telegram-bot-api";
import { bot } from "..";

export async function deleteMessageFrom(message: Message) {
    return await bot.deleteMessage(message.chat.id, message.message_id);
}

export async function dmTo(message: Message, text: string, options?: SendMessageOptions) {
	return await sendMessage(message.from.id, text, options);
}

export async function replyTo(message: Message, text: string, options?: SendMessageOptions) {
	return await sendReply(message.chat.id, message.message_id, text, options);
}

export async function messageTo(message: Message, text: string, options?: SendMessageOptions) {
	return await sendMessage(message.chat.id, text, options);
}

export async function sendReply(chatId: ChatId, messageId: number, text: string, options?: SendMessageOptions) {
	return await bot.sendMessage(chatId, text, {...{
        reply_to_message_id: messageId,
        parse_mode: "HTML"
    }, ...options});
}

export async function sendMessage(chatId: ChatId, text: string, options?: SendMessageOptions) {
    return await bot.sendMessage(chatId, text, {...{
        parse_mode: "HTML"
    }, ...options});
}