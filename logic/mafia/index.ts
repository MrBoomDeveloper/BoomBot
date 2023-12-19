import { addCommand } from "../..";
import { replyTo } from "@util/reply";
import initLifecycle from "./lifecycle";

export default function initMafia() {
    addCommand("mafia", message => {
        replyTo(message, "Не доступно на данный момент.");
    });
    
    initLifecycle();
}



