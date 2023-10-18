import TelegramBot, { CallbackQuery, Message } from "node-telegram-bot-api";
import { initMafia } from "./commands/mafia";
import { parseCommandName } from "./util/parser";
import { initBaseCommands } from "./commands/base";
import { initReactions } from "./special/reactions";

export const credentials = {
    token: "6592082705:AAHLxRYP5y_w__k4yw_avvXzftvxy3h1mXg",
    username: "mrboomdev_boombot"
}

/** START BOT **/

export const bot = new TelegramBot(credentials.token, { polling: true });
console.info("Bot started!");


/** REGISTER REACTIONS **/

const reactions: Record<string, (message: Message) => void> = {};

export function addReaction(name: string, reaction: (message: Message) => void) {
    reactions[name] = reaction;
}

/** REGISTER COMMANDS **/

const commands: Record<string, (message: Message) => void> = {};

export function addCommand(name: string, command: (message: Message) => void) {
    commands[name] = command;
}

bot.on("message", message => {
    if(message.text == null) return;

    console.debug(`Received message: ${message.from?.first_name}: ${message.text}`)

    const commandName = parseCommandName(message.text);
    
    if(commandName != null) {
        const command = commands[commandName];
    
        if(command != null) {
            command(message);
            return;
        }
    }
    
    for(const [name, command] of Object.entries(reactions)) {
        if(message.text.toLowerCase().includes(name.toLowerCase())) {
            command(message);
            return;
        }
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


/** START EVERYTHING **/

initMafia();
initBaseCommands();
initReactions();