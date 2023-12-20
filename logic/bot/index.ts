import TelegramBot, { CallbackQuery, Message } from "node-telegram-bot-api";
import { registerBotCallbacks } from "./lifecycle";

let _bot: TelegramBot = null;
let _didInit = false;

export let textCommands: Record<string, (message: Message) => void> = {};
export let queryCallbacks: Record<string, (data: string, query: CallbackQuery) => void> = {};

export function addTextCommand(name: string, command: (message: Message) => void) {
    textCommands[name] = command;
}

export function addQueryCallback(name: string, callbackQuery: (data: string, callbackQuery: CallbackQuery) => void) {
    queryCallbacks[name] = callbackQuery;
}

export function setBot(bot: TelegramBot) {
	textCommands = {};
	queryCallbacks = {};

	_bot = bot;
	registerBotCallbacks(bot);
	_didInit = bot != null;
}

export function getBot() {
	return _bot;
}

export function didInit() {
	return _didInit;
}

export enum errors {
	CLONE_INSTANCE = "ETELEGRAM: 409 Conflict: terminated by other getUpdates request; make sure that only one bot instance is running"
}

export const credentials = {
    token: process.env.TELEGRAM_BOT_TOKEN,
    username: process.env.TELEGRAM_BOT_USERNAME
}