import { isDebug, isOwnerMessage } from "@util/common";
import { addTextCommand } from "@logic/bot";
import { replyTo, sendMessage, sendReply } from "@util/reply";

const docs = 
`<b>Привет, я BoomBot!</b>
Меня создал @MrBoomBro в качестве эксперимента,
и вот теперь я тут перед вами!

Можете написать /help, чтобы узнать на что я способен!`;

const commands =
`<b><u>Основные команды</u></b>

/help - Узнать список команнд
/ping -  Проверить, в сети ли бот
/rss - Начать пользоваться RSS
/job - Поможем найти работу
/weather - Показать текущую погоду
/mafia - Игра в Мафию`;
    
const adminCommands = 
`<b><u>Команды для Крутышек</u></b>

<b>Администрация:</b>
    /ban - Заблокировать пользователя
    /disable - Выключить бота
    /enable - Включить бота

<b>Отладка</b>
    /rss_update - Без ожидания проверить ленту на изменения
    /mafia_check - Узнать статус текущей игры
    
<b>Опасные:</b>
    /reset - Сбросить базу данных`;

export default function initCommon() {
	addTextCommand("start", message => {
		replyTo(message, docs);
	});

	addTextCommand("help", message => {
		replyTo(message, commands);
		
		if(isOwnerMessage(message)) {
		    replyTo(message, adminCommands);
		}
	});

	addTextCommand("ping", message => {
		replyTo(message, "Понг!");
	});
}



