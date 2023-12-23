import { credentials } from "@logic/bot";

export function isUrl(url: string) {
    try {
        new URL(url).href;
        return true;
    } catch(e) {
        return false;
    }
}

export function parseCommandArgs(message: string) {
    if(!message.startsWith("/")) return null;

    while(message.includes("  ")) {
        message = message.replaceAll("  ", " ");
    }
    
    const args = message.split(" ");
    args.shift();
    
    return args;
}

export function parseCommandName(message: string) {
    if(!message.startsWith("/")) return null;

    if(message.includes(" ")) {
        const args = message.split(" ");

        return parseNameFromWord(args[0]);
    }

    return parseNameFromWord(message);
}

function parseNameFromWord(text: string) {
	if(text.endsWith(`@${credentials.username}`)) {
		return text.substring(1, text.indexOf("@"));
	}

	return text.substring(1);
}