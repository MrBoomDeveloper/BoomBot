import { addCommand, addQueryCallback, bot } from "..";
import { reply } from "../util/reply";

const games: Record<number, Game | null> = {};

interface Game {
	isStarted: boolean,
	didWarndedBeforeStart?: boolean,
	
	startedTime: number,
	duration: number,
	
	interval: NodeJS.Timeout,
	players: Player[]

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
	"mafia": { name: "Мафия", team: 1 },
	"killer": { name: "Маньяк", team: 2 },
	"villager": { name: "Житель", team: 3 },
	"homeless": { name: "Бомж", team: 3 },
	"don": { name: "Дон", team: 1 },
	"doctor": { name: "Врач", team: 3 },
	"beauty": { name: "Красотка", team: 3 },
	"azat": { name: "Азат", team: 4 }
}

function update(chat: number) {
	const game = games[chat];

	if(game == null) {
		console.error("Interval is still alive while game doesn't exist!");
		return;
	}

	const currentTime = Date.now();

	if(currentTime > game?.startedTime + game.duration - 15_000 && !game.didWarndedBeforeStart) {
		game.didWarndedBeforeStart = true;
		bot.sendMessage(chat, "Игра начинается через 15 секунд!");
	}

	if(currentTime > game?.startedTime + game.duration && !game.isStarted) {
		if(game.players.length < 3) {
			bot.sendMessage(chat, "Как-то маловато игроков набралось... Может быть в следующий раз?");
			cancel(chat);
			return;
		}

		start(chat);
	}
}

function giveRoles(chat: number) {
    const game = games[chat];
    
    let mafiasCount = Math.round(game.players.length / 4);
    console.info("У нас будет: " + mafiasCount + " мафий.")
    
    while(mafiasCount > 0) {
        const playerId = Math.min(game.players.length - 1, Math.round(Math.random() * game.players.length));
        const player = game.players[playerId];
        if(player.role != "azat") continue;
        
        player.role = "mafia";
        mafiasCount--;
    }
}

function start(chat: number) {
	const game = games[chat] as Game;
	if(game == null) return;

	if(game.startGameMessageId != null) {
		bot.deleteMessage(chat, game.startGameMessageId);
		game.startGameMessageId = null;
	}

	game.isStarted = true;
	bot.sendMessage(chat, "Игра \"Мафия\" началась!");
	giveRoles(chat);
	
	for(const player of game.players) {
	    bot.sendMessage(player.id, "Твоя роль: " + roles[player.role].name);
	}
	
	bot.sendMessage(chat, "Сказал-бы я если-бы она еще и была доделанна...");
	cancel(chat);
}

function cancel(chat: number) {
	const game = games[chat];
	if(game == null) return;

	games[chat] = null;

	if(game.startGameMessageId != null) {
		bot.deleteMessage(chat, game.startGameMessageId);
		game.startGameMessageId = null;
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

function prepareGame(message: any) {
    const game = games[message.chat.id];
		
	const time = message.text.includes(" ")
        ? message.text.split(" ")[1]
		: 30;

	if(game == null) {
		const newGame: Game = {
			isStarted: false,
			startedTime: Date.now(),
			duration: time * 1000,
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
			role: "azat",
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

	addCommand("mafia_start", message => {
		if(games[message.chat.id] == null) {
			prepareGame(message);
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