import { addCommand, addQueryCallback, bot } from "..";
import { reply } from "../util/reply";

const games: Record<number, Game | null> = {};

interface Game {
	isStarted: boolean,
	startedTime: number,
	interval: NodeJS.Timeout,
	players: Player[]
	didWarndedBeforeStart?: boolean,

	startGameMessageId?: number,
	joinedMessageId?: number
}

interface Player {
	name: string,
	role: string,
	id: number,
	isAlive: boolean
}

const roles = {
	"mafia": { name: "Мафия" },
	"villager": { name: "Житель" },
	"homeless": { name: "Бомж" },
	"don": { name: "Дон" },
	"doctor": { name: "Врач" },
	"beauty": { name: "Красотка" },
	"unknown": { name: "Азат" }
}

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

		start(chat);
	}
}

function start(chat: number) {
	const game = games[chat] as Game;
	if(game == null) return;

	if(game.startGameMessageId != null) {
		bot.deleteMessage(chat, game.startGameMessageId);
	}

	game.isStarted = true;
	bot.sendMessage(chat, "Игра \"Мафия\" началась!");
	bot.sendMessage(chat, "Сказал-бы я если-бы она еще и была доделанна...");
	cancel(chat);
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

function getFancyPlayersList(players: Player[]) {
	let result = "Текущие игроки: [ ";

	for(let i = 0; i < players.length; i++) {
		if(i > 0) result += ", ";
		result += players[i].name;
	}

	result += " ]";

	return result;
}

export function initMafia() {
	addQueryCallback("join_game", (data, query) => {
		const game = games[data] as Game;

		if(game == null) {
			bot.answerCallbackQuery(query.id, {
				text: "Игра не найдена :(",
				show_alert: true
			});

			return;
		}

		if(game.isStarted) {
			bot.answerCallbackQuery(query.id, {
				text: "Игра уже началась :(",
				show_alert: true
			});

			return;
		}

		bot.answerCallbackQuery(query.id, {
			text: "Ты присоединился!"
		});

		game.players.push({
			name: `${query.from.first_name} - @${query.from.username}`,
			id: query.from.id,
			role: "unknown",
			isAlive: true
		});

		if(game.joinedMessageId != null) {
			bot.editMessageText("Current players: " + getFancyPlayersList(game.players), {
				message_id: game.joinedMessageId,
				chat_id: data
			});
		} else {
			bot.sendMessage(query.message?.chat.id || 0, getFancyPlayersList(game.players));
		}
	});

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

			reply(message, "Ну начнем же набор в игру \"Мафия\"!", {
				reply_markup: {
					inline_keyboard: [[{
						text: "Присоединиться",
						callback_data: JSON.stringify({
							action: "join_game",
							data: message.chat.id
						})
					}]]
				}
			}).then(newMessage => {
				newGame.startGameMessageId = newMessage.message_id;
				bot.pinChatMessage(newMessage.chat.id, newMessage.message_id);
			});
			return;
		}

		reply(message, "Подожди пока первая игра закончиться, а то тут будет полный бардак!");
	});

	addCommand("mafia_start", message => {
		if(games[message.chat.id] == null) {
			reply(message, "Я что-то не вижу здесь начинающихся игр...");
			return;
		}

		start(message.chat.id);
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