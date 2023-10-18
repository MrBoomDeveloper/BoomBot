import { addReaction, bot } from "..";
import { reply } from "../util/reply";

export function initReactions() {
    addReaction("аниме", message => {
        reply(message, "аниме гавно ._.");
    });
    
    addReaction("украин", message => {
        reply(message, "а я за путина ._.");
    });
    
    addReaction("фнаф", message => {
        reply(message, "Мишка Фредди!?");
    });
    
    addReaction("фред", message => {
        reply(message, "Мишка Фредди!?");
    });
    
    addReaction("фрэд", message => {
        reply(message, "Мишка Фредди!?");
    });
    
    addReaction("азат", message => {
        reply(message, "азат сус");
    });
}