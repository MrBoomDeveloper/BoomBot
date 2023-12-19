import { Message } from "node-telegram-bot-api";

export function isDebug() {
	return process.env.IS_DEBUG == "true";
}

export function isOwnerMessage(message: Message) {
	return isOwnerUserId(message.from.id);
}

export function isOwnerUserId(userId: number) {
	return userId == (process.env.OWNER as any as number);
}