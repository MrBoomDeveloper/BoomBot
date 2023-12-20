import { addTextCommand } from "@logic/bot";
import { replyTo } from "@util/reply";
import initLifecycle from "./lifecycle";

export default function initMafia() {
    addTextCommand("mafia", message => {
        replyTo(message, "Не доступно на данный момент.");
    });
    
    initLifecycle();
}



