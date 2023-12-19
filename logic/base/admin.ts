import { addCommand } from "../..";
import { reply } from "../../util/reply";
import { resetDB } from "../db/unsafe";

export default function initAdmin() {
    if(!process.env.IS_DEBUG) return;
    
    addCommand("ban", message => {
		reply(message, "Бан не доделан.");
	});
	
	addCommand("say", message => {
		reply(message, "Говорилка не доделанна.");
	});
	
	addCommand("reset", async (message) => {
		reply(message, "Начинаем сброс базы данных...");
		
		try {
		    await resetDB();
		    reply(message, "База данных успешно сброшена!");
		} catch(e) {
		    console.error(e);
		    reply(message, "Не удалось сбросить базу банных.");
		}
	});
}



