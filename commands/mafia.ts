import { addCommand } from "..";
import { reply } from "../util/reply";

const game = {
	isStarted: false
}

export function initMafiaCommands() {
	addCommand("mafia", message => {
		if(game.isStarted) {
			reply(message, "Зачем начинать вторую игру? Будто-бы в первую много кто играет...");
			return;
		}

		game.isStarted = true;
		reply(message, "Ну начинаем же набор в игру \"Мафия\"!");
	});

	addCommand("mafia_stop", message => {
		if(!game.isStarted) {
			reply(message, "Но игра даже не начиналась...");
			return;
		}
		
		game.isStarted = false;
		reply(message, "Похоже, что нам придется отменить эту игру :(");
	});

	addCommand("mafia_extend", message => {
		if(!game.isStarted) {
			reply(message, "Как увеличить то, чего нет...");
			return;
		}

		reply(message, "Хорошо, даю вам еще +30 секунд!");
	});
}