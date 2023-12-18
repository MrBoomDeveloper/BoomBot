import { addCommand } from "../..";
import { reply } from "../../util/reply";
import initLifecycle from "./lifecycle";

export default function initMafia() {
    addCommand("mafia", message => {
        reply(message, "Не доступно на данный момент.");
    });
    
    initLifecycle();
}



