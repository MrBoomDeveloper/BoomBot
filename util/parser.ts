import { credentials } from "..";

export function parseCommandArgs(message: string) {
    if(!message.startsWith("/")) return null;
    
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