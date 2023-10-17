import { addCommand, bot } from "..";
import { reply } from "../util/reply";

const games: Record<number, Game | null> = {};

interface Game {
	isStarted: boolean,
	startedTime: number,
	interval: NodeJS.Timeout,
	players: Player[]
	didWarndedBeforeStart?: boolean,
	startGameMessageId?: number
}

interface Player {
	role: Role,
	id: number,
	isAlive: boolean
}

type Role = "mafia" | "villager";

function update(chat: number) {
	const game = games[chat];

	if(game == null) {
		console.error("Interval is still alive while game doesn't exist!");
		return;
	}

	const currentTime = Date.now();

	if(currentTime - game?.startedTime > 15_000 && !game.didWarndedBeforeStart) {
		game.didWarndedBeforeStart = true;
		bot.sendMessage(chat, "Игра начинается через 15 секунд!");
	}

	if(currentTime - game?.startedTime > 30_000 && !game.isStarted) {
		if(game.players.length < 3) {
			bot.sendMessage(chat, "Как-то маловато игроков набралось... Может быть в следующий раз?");
			cancel(chat);
			return;
		}

		game.isStarted = true;
		bot.sendMessage(chat, "Игра \"Мафия\" началась!");
	}
}

function cancel(chat: number) {
	const game = games[chat];
	if(game == null) return;

	games[chat] = null;

	if(game.startGameMessageId != null) {
		bot.deleteMessage(chat, game.startGameMessageId);
	}

	if(game.interval != null) {
		clearInterval(game.interval);
	}
}

export function initMafiaCommands() {
	addCommand("mafia", message => {
		const game = games[message.chat.id];

		if(game == null) {
			const newGame: Game = {
				isStarted: false,
				startedTime: Date.now(),
				interval: setInterval(() => update(message.chat.id), 1_000),
				players: []
			}

			games[message.chat.id] = newGame;

			reply(message, "Ну начнем же набор в игру \"Мафия\"!").then(newMessage => {
				newGame.startGameMessageId = newMessage.message_id;
				bot.pinChatMessage(newMessage.chat.id, newMessage.message_id);
			});
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
		cancel(message.chat.id);
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