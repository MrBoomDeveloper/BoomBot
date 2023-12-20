import { addTextCommand } from "@logic/bot";
import { deleteMessageFrom, messageTo, dmTo, replyTo, sendReply } from "@util/reply";
import { resetDB } from "../db/unsafe";
import { isDebug, isOwnerMessage } from "@util/common";
import { parseCommandArgs } from "@util/parser";

export default function initAdmin() {
    addTextCommand("ban", message => {
		if(!isOwnerMessage(message)) return;

		replyTo(message, "Бан не доделан.");
	});
	
	addTextCommand("say", message => {
		if(!isOwnerMessage(message)) return;

		const args = parseCommandArgs(message.text);

		if(args.length == 0) {
			dmTo(message, "Вы забыли указать текст после /say!");
			return;
		}

		const text = args.join(" ");
		messageTo(message, text);
		deleteMessageFrom(message);
	});
	
	addTextCommand("reset", async (message) => {
		if(!isOwnerMessage(message)) return;

		const currentDay = new Date().getDate();
		const args = parseCommandArgs(message.text);

		if(args.length < 1 || ((args[0] as any as number) != currentDay)) {
			replyTo(message, "В качестве подтверждения введи текущий день месяца после команды: '/reset [ДЕНЬ]'");
			return;
		}

		replyTo(message, "Начинаем сброс базы данных...");
		
		try {
		    await resetDB();
		    replyTo(message, "База данных успешно сброшена!");
		} catch(e) {
		    console.error(e);
		    replyTo(message, "Не удалось сбросить базу банных.");
		}
	});
}



