import { Chat, ChatId, Message, SendMessageOptions } from "node-telegram-bot-api";
import { getBot } from "@logic/bot";
import { isUrl } from "./parser";
import { removeTelegramUrlPrefix } from "./format";

async function getChat(chatId: ChatId) {
    try {
        return await getBot().getChat(chatId);
    } catch(e) {
        return null;
    }
}

export async function resolveChatId(chatId: any) {
    if(chatId == null) return null;

    if(!isNaN(chatId)) {
        if(chatId.startsWith("-100")) {
            return chatId;
        }
        
        const chat = await getChat(chatId);
        return chat?.id;
    }

    if(isUrl(chatId)) {
        chatId = removeTelegramUrlPrefix(chatId);
    }

    if(!chatId.startsWith("@")) {
        chatId = "@" + chatId;
    }

    const chat = await getChat(chatId);
    return chat?.id;
}

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