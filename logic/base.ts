import { addCommand } from "..";
import { reply } from "../util/reply";

const docs = 
`<b>Привет, я BoomBot!</b>
Меня создал @MrBoomBro в качестве эксперимента,
и вот теперь я тут перед вами!

Можете написать /help, чтобы узнать на что я способен!`;

const commands =
`База:
    /help - Узнать список команнд
    /ping -  Проверить, в сети ли бот

RSS:
    /rss - Помощь с настройкой RSS ленты
    /rss_add - Добавить ленту
    /rss_remove - Удалить ленту
    /rss_list - Перечислить ленты`
+ (process.env.IS_DEBUG ? "\n    /rss_update - Без ожидания проверить ленту на изменения" : "") + 
    `\n    /rss_customize - Редактирование ленты

Мафия:
    /mafia - Узнать об игре в Мафию
    /mafia_start - Начать игру в мафию (Можно настроить время до начала)
    /mafia_extend - Увеличить срок подбора игроков`
+ (process.env.IS_DEBUG ? "\n    /mafia_check - Узнать статус текущей игры" : "") + 
    `\n    /mafia_stop - Закончить игру в мафию`;

export default function initBase() {
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