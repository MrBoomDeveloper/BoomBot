import TelegramBot, { CallbackQuery, Message } from "node-telegram-bot-api";
import express from "express";
import "dotenv/config";
import { parseCommandName } from "./util/parser";
import initCommon from "./logic/base/common";
import initAdmin from "./logic/base/admin";
import initRss from "./logic/rss";
import initMafia from "./logic/mafia";
import { reply } from "./util/reply";

export const credentials = {
    token: process.env.TELEGRAM_BOT_TOKEN,
    username: process.env.TELEGRAM_BOT_USERNAME
}

/** START A BOT **/

export const bot = new TelegramBot(credentials.token, { polling: true });
console.info("Bot started!");

/** REGISTER COMMANDS **/

const commands: Record<string, (message: Message) => void> = {};

export function addCommand(name: string, command: (message: Message) => void) {
    commands[name] = command;
}

bot.on("message", message => {
    if(message.text == null) return;

    console.debug(`Received message: ${message.from?.first_name}: ${message.text}`);

    const commandName = parseCommandName(message.text);
    
    if(commandName != null) {
        const command = commands[commandName];
        const isAtCommand = message.text.split(" ")[0].endsWith(`@${credentials.username}`);
        const isPersonalCommand = isAtCommand || (message.chat.type == "private");
        
        if(!isPersonalCommand) return;
    
        if(command != null) {
            command(message);
            return;
        }
        
        reply(message, "Неизвестная команда! Попробуйте использовать: /help");
        return;
    }
});


/** REGISTER QUERY CALLBACKS **/

const queryCallbacks: Record<string, (data: string, query: CallbackQuery) => void> = {};

export function addQueryCallback(name: string, callbackQuery: (data: string, callbackQuery: CallbackQuery) => void) {
    queryCallbacks[name] = callbackQuery;
}

bot.on("callback_query", query => {
    if(query.data == null) return;

    const parsedAction = JSON.parse(query.data);
    const callback = queryCallbacks[parsedAction.action];

    if(callback != null) {
        callback(parsedAction.data, query);
    }
});

bot.on("polling_error", error => {
    console.error(`Polling error ${error.name}! ${error.message} at ${error.stack}`);
});

/* Start a empty server to pass a "healthy" check */

const app = express();

app.use((req, res, next) => {
	console.log("New request at: " + Date.now());
	next();
});

app.get("*", handleUnknown);
app.post("*", handleUnknown);

function handleUnknown(req, res) {
    console.warn("Bot has been checked through the api endpoint.");
    
	res.status(200);
	res.send("Bot is alive!");
}

app.listen(8000, () => {
	console.log("Server started!");
});


/** START EVERYTHING **/

initMafia();
initRss();
initCommon();
initAdmin();



