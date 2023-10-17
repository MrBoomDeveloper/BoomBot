import TelegramBot, { Message } from "node-telegram-bot-api";
import { initMafiaCommands } from "./commands/mafia";
import { parseCommandName } from "./util/parser";
import { initBaseCommands } from "./commands/base";

export const credentials = {
    token: "6592082705:AAHLxRYP5y_w__k4yw_avvXzftvxy3h1mXg",
    username: "mrboomdev_boombot"
}

export const bot = new TelegramBot(credentials.token, { polling: true });

const commands: Record<string, (Message) => void> = {};

export function addCommand(name: string, command: (message: Message) => void) {
    commands[name] = command;
}

bot.on("message", message => {
    if(message.text == null) return;

    console.debug(`Received message: ${message.from?.first_name}: ${message.text}`)

    const commandName = parseCommandName(message.text);
    if(commandName == null) return;

    const command = commands[commandName];
    command?.(message);
});

bot.on("polling_error", error => {
    console.error(`Polling error ${error.name}! ${error.message} at ${error.stack}`);
});

console.info("Bot started!");

initMafiaCommands();
initBaseCommands();