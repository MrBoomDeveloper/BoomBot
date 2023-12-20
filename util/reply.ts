import { ChatId, Message, SendMessageOptions } from "node-telegram-bot-api";
import { getBot } from "@logic/bot";

export async function deleteMessageFrom(message: Message) {
    return await deleteMessage(message.chat.id, message.message_id);
}

export async function deleteMessage(chat: number, message: number) {
    return await getBot().deleteMessage(chat, message);
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
	return await getBot().sendMessage(chatId, text, {...{
        reply_to_message_id: messageId,
        parse_mode: "HTML"
    }, ...options});
}

export async function sendMessage(chatId: ChatId, text: string, options?: SendMessageOptions) {
    return await getBot().sendMessage(chatId, text, {...{
        parse_mode: "HTML"
    }, ...options});
}