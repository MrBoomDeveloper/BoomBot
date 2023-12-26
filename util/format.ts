const TELEGRAM_URL_PREFIX = "https://t.me/";

export function removeSideLetters(text: string, letters: string[]) {
	let didDoneStart = false, didDoneEnd = false;

	while(!didDoneStart) {
		let didFound = false;

		for(const letter of letters) {
			if(text.startsWith(letter)) {
				text = text.substring(letter.length);
				didFound = true;
			}
		}

		didDoneStart = !didFound;
	}

	while(!didDoneEnd) {
		let didFound = false;

		for(const letter of letters) {
			if(text.endsWith(letter)) {
				text = text.substring(0, text.length - letter.length);
				didFound = true;
			}
		}

		didDoneEnd = !didFound;
	}

	return text;
}

export function removeTelegramUrlPrefix(url: string) {
    url = url.trim();

    if(!url.startsWith(TELEGRAM_URL_PREFIX)) {
        return url;
    }

    return url.substring(TELEGRAM_URL_PREFIX.length);
}