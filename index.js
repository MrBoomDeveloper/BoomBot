import TelegramBot from "node-telegram-bot-api";

const token = '6592082705:AAHLxRYP5y_w__k4yw_avvXzftvxy3h1mXg';
const username = "mrboomdev_boombot";

const bot = new TelegramBot(token, { polling: true });

const phrases = [
    "а я за путина ._.",
    "ясно",
    "понятно",
    "?",
    "почему",
    "аааа",
    "°о°"
];

function isCommand(input, target) {
    const command = "/" + target;
    
    if(input == command) return true;
    
    if(input.startsWith(command + " ")) return true;
    
    if(input.startsWith(`${command}@${username}`)) {
        return true;
    }
    
    return false;
}

function reply(target, text) {
    bot.sendMessage(target.chat.id, text, {
        reply_to_message_id: target.message_id
    });
}

bot.on("message", (msg) => {
    console.info(`Fetched a message: ${msg.from.first_name}: ${msg.text}`);
    
    if(isCommand(msg.text, "start")) {
        reply(msg, "прости, но я родился совсем недавно и почти ничего не умею кроме того, чтобы болтать какой-то бред иногда как азат ._.");
        return;
    }
    
    if(isCommand(msg.text, "mafia")) {
        reply(msg, "извини, но в мафию я пока не научился играть... Попроси карты у василисы, может у нее они остались?");
        return;
    }
    
    if(isCommand(msg.text, "say")) {
        bot.deleteMessage(msg.chat.id, msg.message_id);
        
        if(msg.from.id != 5329972361) return;
        
        const index = msg.text.indexOf(" ");
        if(index == -1) return;
        
        bot.sendMessage(msg.chat.id, msg.text.substring(index));
        return;
    }
  
    if(Math.random() > .85 && Math.random() < .15) {
        const ran = phrases[Math.min(phrases.length, Math.max(0, Math.round(Math.random() * phrases.length)))];
        if(ran == null) return;
        
        reply(msg, ran);
    }
});

bot.on("polling_error", (error) => {
    console.log(error.code);
});

console.info("Bot started!");