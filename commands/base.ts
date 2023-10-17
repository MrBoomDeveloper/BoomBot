import { addCommand } from "..";
import { reply } from "../util/reply";

const docs = 
`<b>Привет, я BoomBot!</b>
Меня создал @MrBoomBro в качестве эксперимента,
и вот теперь я тут перед вами!

Можете написать /help, чтобы узнать на что я способен!`;

const commands =
`/help - Узнать список команнд
/mafia - Начать игру в мафию
/mafia_extend - Увеличить срок подбора игроков
/mafia_stop - Закончить игру в мафию
/ping -  Проверить, в сети ли бот`;

export function initBaseCommands() {
	addCommand("start", message => {
		reply(message, docs);
	});

	addCommand("help", message => {
		reply(message, commands);
	});

	addCommand("ping", message => {
		reply(message, "Понг!");
	});
}