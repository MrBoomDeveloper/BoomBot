import { addCommand } from "../..";
import { reply } from "../../util/reply";

const docs = 
`<b>Привет, я BoomBot!</b>
Меня создал @MrBoomBro в качестве эксперимента,
и вот теперь я тут перед вами!

Можете написать /help, чтобы узнать на что я способен!`;

const commands =
`<b>База:</b>
    /help - Узнать список команнд
    /ping -  Проверить, в сети ли бот

<b>RSS:</b>
    /rss - Помощь с настройкой RSS ленты
    /rss_add - Добавить ленту
    /rss_explore - Список особенных лент
    /rss_remove - Удалить ленту
    /rss_list - Перечислить ленты`
+ (process.env.IS_DEBUG ? "\n    /rss_update - Без ожидания проверить ленту на изменения" : "") + 
    `\n    /rss_customize - Редактирование ленты

<b>Мафия (Не рабочая):</b>
    /mafia - Узнать об игре в Мафию
    /mafia_start - Начать игру в мафию (Можно настроить время до начала)
    /mafia_extend - Увеличить срок подбора игроков`
+ (process.env.IS_DEBUG ? "\n    /mafia_check - Узнать статус текущей игры" : "") + 
    `\n    /mafia_stop - Закончить игру в мафию`;
    
const adminCommands = 
`<b><u>Команды для Крутышек</u></b>

<b>Администрация:</b>
    /ban - Заблокировать пользователя
    /disable - Выключить бота
    /enable - Включить бота
    
<b>Опасные:</b>
    /reset - Сбросить базу данных`;

export default function initCommon() {
	addCommand("start", message => {
		reply(message, docs);
	});

	addCommand("help", message => {
		reply(message, commands);
		
		if(process.env.IS_DEBUG) {
		    reply(message, adminCommands);
		}
	});

	addCommand("ping", message => {
		reply(message, "Понг!");
	});
}