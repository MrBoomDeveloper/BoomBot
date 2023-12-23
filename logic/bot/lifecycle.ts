import TelegramBot from "node-telegram-bot-api";
import { getBot, credentials, didInit, errors, queryCallbacks, setBot, textCommands } from ".";
import { replyTo } from "@util/reply";
import { parseCommandName } from "@util/parser";
import { main } from "@src/index";
import { isDebug } from "@util/common";
import { finishLifeChecker, isAnotherInstanceNewer } from "./life_checker";

const MAX_RETRIES_PER_MINUTE = 5;
let retriesCount = 0;

export function startBot() {
	setBot(new TelegramBot(credentials.token, { polling: true }))
}

export function registerBotCallbacks(bot: TelegramBot) {
	bot.on("polling_error", async (e) => {
		console.error(`Polling error "${e.name}"! "${e.message}" at ${e.stack}`);
	
		if(e.message == errors.CLONE_INSTANCE) {
			if(await isAnotherInstanceNewer()) {
				console.warn("Finish this instance because there is a more recent one!");
				finishBot(new Error("Another bot instance is already running! Finishing...."));
				return;
			}
			
			console.warn("Please, turn off the other instance!!!");
		}
	});
	
	bot.addListener("error", e => {
		console.error(`Bot error "${e.name}"! "${e.message}" at ${e.stack}`);
	});

	bot.on("callback_query", query => {
		if(query.data == null) return;
	
		const parsedAction = JSON.parse(query.data);
		const callback = queryCallbacks[parsedAction.action];
	
		if(callback != null) {
			callback(parsedAction.data, query);
		}
	});

	bot.on("message", message => {
		if(message.text == null) return;
	
		console.debug(`Received message: ${message.from?.first_name}: ${message.text}`);
	
		if(!didInit()) {
			replyTo(message, "Я немного запутался, повторите еще раз через минуту.");
			return;
		}
	
		const commandName = parseCommandName(message.text);
		
		if(commandName != null) {
			const command = textCommands[commandName];
			const isAtCommand = message.text.split(" ")[0].endsWith(`@${credentials.username}`);
			const isPersonalCommand = isAtCommand || (message.chat.type == "private");
			
			if(!isPersonalCommand) return;
		
			if(command != null) {
				if(message.text.trim().includes("\n")) {
					replyTo(message, "Извините, но я сильно путаюсь когда вижу новые строчки :(");
					return;
				}
	
				command(message);
				return;
			}
			
			replyTo(message, "Неизвестная команда! Попробуйте использовать: /help");
			return;
		}
	});
}

export async function finishBot(e?: Error) {
	if(e != null) {
        console.error("A fatal exception has happened!");
        console.error(e);
    }

	try {
		await getBot().stopPolling();
	} catch(e) {
		console.error("Failed to stop pooling!");
	}

	finishLifeChecker();
	
	if(isDebug()) {
		if(e != null) {
			console.error("We don't give a fuck, because this isn't a production.")
		}
		
		giveUp();
		return;
	}

	if(e != null) {
		console.info("Going quiet to respawn after some time...");
		setTimeout(() => tryToReturnFromDead(), 10_000);
	}
}

function incrementRetrieCount() {
	setTimeout(() => {
		retriesCount--;
	}, 60_000);

	retriesCount++;
}

async function tryToReturnFromDead() {
	if(retriesCount >= MAX_RETRIES_PER_MINUTE) {
		console.error("This is so fucked up, that we tried to bring this shit from dead for a minute! God, please bless this server.");
		giveUp();
		return;
	}

	try {
		console.info("Checking if new instance is dead, so we can reuse this one.");
		const isAnotherNewer = await isAnotherInstanceNewer();

		if(isAnotherNewer) {
			console.error("\"If the other me is better than me, why do i have to exist?\"");
			giveUp();
			return;
		}

		console.info("Trying to reuse a current instance.");
		incrementRetrieCount();
		main();
	} catch(e) {
		incrementRetrieCount();
		main();
	}
}

function giveUp() {
	console.error("Fuck everything, this instance is dead!");
	process.exit(0);
}