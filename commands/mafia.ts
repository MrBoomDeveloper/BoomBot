import { addCommand, bot } from "..";
import { reply } from "../util/reply";

const games: Record<number, Game | null> = {};

interface Game {
	isStarted: boolean,
	startedTime: number,
	interval: NodeJS.Timeout
}

function updateMafia(chat: number) {
	bot.sendMessage(chat, "update");
}

export function initMafiaCommands() {
	addCommand("mafia", message => {
		const game = games[message.chat.id];

		if(game == null) {
			games[message.chat.id] = {
				isStarted: false,
				startedTime: Date.now(),
				interval: setInterval(() => updateMafia(message.chat.id), 1_000)
			}

			reply(message, "Ну начинаем же набор в игру \"Мафия\"!");
			return;
		}

		reply(message, "Подожди пока первая игра закончиться, а то тут будет полный бардак!");
	});

	addCommand("mafia_stop", message => {
		const game = games[message.chat.id];

		if(game == null) {
			reply(message, "Но игра даже не начиналась...");
			return;
		}
		
		reply(message, "Похоже, что нам придется отменить эту игру :(");
		games[message.chat.id] = null;

		if(game.interval != null) {
			clearInterval(game.interval);
		}
	});

	addCommand("mafia_extend", message => {
		const game = games[message.chat.id];

		if(game == null) {
			reply(message, "Как увеличить то, чего нет...");
			return;
		}

		if(game.isStarted) {
			reply(message, "Игра уже началась! Тебе придется отменить ее при помощи /mafia_stop");
			return;
		}

		game.startedTime += 30_000;
		reply(message, "Хорошо, даю вам еще +30 секунд!");
	});
}