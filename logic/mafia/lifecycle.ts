import { addCommand, addQueryCallback, bot } from "../..";
import { reply } from "../../util/reply";

const games: Record<number, Game | null> = {};

interface Game {
	isStarted: boolean,
	didWarndedBeforeStart?: boolean,
	
	startedTime: number,
	
	interval: NodeJS.Timeout,
	players: Player[],
	
	step: number,
	ticksUntilNextStep: number,

	startGameMessageId?: number,
	joinedMessageId?: number
}

interface Player {
	name: string,
	role: string,
	id: number,
	
	isAlive: boolean,
	gotVotes: number,
	didVote: boolean
}

const roles = {
	"mafia": { 
	    name: "Мафия", 
	    description: "Ну чтож джентельмены, пришло время очистить этот город от мусора.",
	    team: 1 
	},
	
	"killer": { 
	    name: "Маньяк", 
	    description: "Устрой мясорубку и переей всех! И мафию и жителей! РЕЗНЯ!",
	    team: 2 
	},
	
	"villager": { 
	    name: "Житель", 
	    description: "Ну чтож засоня, ночью тебе будут сниться приятные сны и надеюсь, что с тобой все будет впорядке ;)",
	    team: 3 
	},
	
	"homeless": { 
	    name: "Бомж", 
	    description: "Предложи незнакомцу бутылку пойла, и он тебе расскажет обо всем.",
	    team: 3 
	},
	
	"don": { 
	    name: "Дон", 
	    description: "Тебе выбирать, кто завтра не проснется",
	    team: 1 
	},
	
	"doctor": { 
	    name: "Врач", 
	    description: "Ты будешь по ночам лечить кого-то одного, либо себя",
	    team: 3 
	},
	
	"beauty": { 
	    name: "Красотка", 
	    description: "Каждая ночь будет бурной как ураган в океане, что аж твои партнеры будут терять дар речи на день.",
	    team: 3 
	},
	
	"azat": { 
	    name: "Азат", 
	    description: "самоубийца.",
	    team: 4 
	},
	
	"none": { 
	    name: "???",
	    description: "???",
	    team: -1
	}
}

function update(chat: number) {
	const game = games[chat];

	if(game == null) {
		console.error("Interval is still alive while game doesn't exist!");
		return;
	}
    
	game.ticksUntilNextStep -= 1_000;

    if(game.step == 0) {
        if(game.ticksUntilNextStep <= 15_000 && !game.didWarndedBeforeStart) {
	    	game.didWarndedBeforeStart = true;
	    	bot.sendMessage(chat, "Игра начинается через 15 секунд!");
	    }

	    if(game.ticksUntilNextStep <= 0 && !game.isStarted) {
	    	if(game.players.length < 3) {
			    bot.sendMessage(chat, "Как-то маловато игроков набралось... Может быть в следующий раз?");
			    cancel(chat);
			    return;
		    }

            game.ticksUntilNextStep = 4_000;
            game.step = 1;
		    start(chat);
    	}
    }
    
    if(game.step == 1 && game.ticksUntilNextStep <= 0) {
        bot.sendMessage(chat, "Ночь началсь, а это значит, всем пора спать! Но всем ли?", {
            reply_markup: {
				inline_keyboard: [[{
				    text: "Перейти к боту",
				    callback_data: null
				}]]
			}
        });
        
        game.ticksUntilNextStep = 5_000;
        game.step = 2;
    }
    
    if(game.step == 2 && game.ticksUntilNextStep <= 0) {
        bot.sendMessage(chat, "Доброе утро, наш любимый город! Как вам спалось?");
        game.ticksUntilNextStep = 5_000;
        game.step = 3;
    }
    
    if(game.step == 3 && game.ticksUntilNextStep <= 0) {
        bot.sendMessage(chat, "Время голосовать за предателей. Кто-же это?", {
            reply_markup: {
				inline_keyboard: game.players.map(player => [{
				    text: player.name,
				    callback_data: JSON.stringify({
						action: "vote",
						data: player.id
					})
				}])
			}
        });
        
        game.step = 4;
        game.ticksUntilNextStep = 5_000;
    }
    
    if(game.step == 4 && game.ticksUntilNextStep <= 0) {
        bot.sendMessage(chat, "Вешать мы никого не будет, не гуманно это как-то...");
        game.step = 1;
        game.ticksUntilNextStep = 5_000;
        
        for(const player of game.players) {
            player.didVote = false;
            player.gotVotes = 0;
        }
        
        let maxVotes = 0;
        let highestPlayer: Player = null;
    }
}

function giveRoles(chat: number) {
    const game = games[chat];
    
    let mafiasCount = Math.max(1, Math.round(game.players.length / 5));
    console.info("У нас будет: " + mafiasCount + " мафий.")
    
    while(mafiasCount > 0) {
        assignRole(game, "mafia");
        mafiasCount--;
    }
    
    assignRole(game, "doctor");
    assignRole(game, "killer");
    assignRole(game, "beauty");
    assignRole(game, "azat");
    assignRole(game, "homeless");
    assignRole(game, "don");
    
    assignRole(game, "villager");
    if(game.players.length > 4) assignRole(game, "villager");
    if(game.players.length > 8) assignRole(game, "villager");
    
    for(const player of game.players) {
        if(player.role == "none") {
            player.role = "villager";
        }
    }
}

function getRolesCount(game: Game, role: string) {
    return game.players.reduce((total, next) => {
        return total + next;
    }, 0);
}

function assignRole(game: Game, role: string) {
    let didAssigned = false;
    let triesCount = 0;
    
    if(!(role in roles)) {
        throw new Error("Unknown role! " + role);
    }
    
    while(!didAssigned) {
        const playerId = getRandomPlayer(game.players.length);
        const player = game.players[playerId];
        
        if(player.role != "mafia" && role == "villager") {
            player.role = role;
            didAssigned = true;
            return;
        }
        
        if(triesCount > 25) return;
        
        triesCount++;
        if(player.role != "none") continue;
        
        player.role = role;
        didAssigned = true;
    }
}

function getRandomPlayer(count: number) {
    return Math.min(
        count - 1,
        Math.round(
            Math.random() * count
        )
    );
}

function hasRole(game: Game, role: string) {
    return game.players.find(player => {
        return player.role == role;
    })
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
	    bot.sendMessage(player.id, `Твоя роль: ${roles[player.role].name}. ${roles[player.role].description}`);
	}
	
	game.step = 1;
	game.ticksUntilNextStep = 5_000;
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
			
			interval: setInterval(() => update(message.chat.id), 1_000),
			players: [],
			
			ticksUntilNextStep: time * 1000,
			step: 0
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

export default function initMafiaLifecycle() {
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
		
		/*if(game.players.find(player => player.id == query.from.id)) {
		    bot.answerCallbackQuery(query.id, {
			    text: "Ты уже в игре!",
			    show_alert: true
		    });
		    
		    return;
		}*/

		bot.answerCallbackQuery(query.id, {
			text: "Ты присоединился!"
		});

		game.players.push({
			name: `${query.from.first_name} - @${query.from.username}`,
			id: query.from.id,
			role: "none",
			isAlive: true,
			gotVotes: 0
		});

		if(game.joinedMessageId != null) {
			bot.editMessageText(getFancyPlayersList(game.players), {
				message_id: game.joinedMessageId,
				chat_id: data
			});
		} else {
			bot.sendMessage(query.message?.chat.id || 0, getFancyPlayersList(game.players)).then(newMessage => {
			    game.joinedMessageId = newMessage.message_id;
			});
		}
	});
	
	addQueryCallback("vote", (data, query) => {
		const game = games[data] as Game;

		if(game == null) {
			bot.answerCallbackQuery(query.id, {
				text: "Игра не найдена :(",
				show_alert: true
			});

			return;
		}
		
		if(game.players[query.from.id].didVote) {
		    bot.answerCallbackQuery(query.id, {
				text: "Ты уже проголосовал!",
				show_alert: true
			});
			
			return;
		}

		bot.answerCallbackQuery(query.id, {
			text: "Твой голос отдан!"
		});
		
		game.players[data].gotVotes++;
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