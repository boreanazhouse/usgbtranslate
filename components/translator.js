const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

class Translator {
    translate(text, locale) {
        const trimText = text.trim();

        const localeConfig = {
            "american-to-british": {
                dictionary: americanOnly,
                reverseDictionary: americanToBritishSpelling,
                titles: americanToBritishTitles,
                timeRegex: /(\d{1,2}):(\d{2})/g,
                timeReplace: "$1.$2",
            },
            "british-to-american": {
                dictionary: britishOnly,
                reverseDictionary: Object.fromEntries(Object.entries(americanToBritishSpelling).map(([k, v]) => [v, k])),
                titles: Object.fromEntries(Object.entries(americanToBritishTitles).map(([k, v]) => [v, k])),
                timeRegex: /(\d{1,2})\.(\d{2})/g,
                timeReplace: "$1:$2",
            },
        };

        const { dictionary, reverseDictionary, titles, timeRegex, timeReplace } = localeConfig[locale];
        const createWholeWordRegex = (k) => new RegExp(`\\b${k}\\b`, "gi");

        // 1. Translate slang
        const slangTranslated = Object.entries(dictionary).reduce((acc, [k, v]) => {
            return acc.replace(createWholeWordRegex(k), v);
        }, trimText);
        // 2. Translate spelling
        const spellingTranslated = Object.entries(reverseDictionary).reduce((acc, [k, v]) => {
            return acc.replace(createWholeWordRegex(k), v);
        }, slangTranslated);
        // 3. Handle titles
        const titlesTranslated = Object.entries(titles).reduce((acc, [k, v]) => {
            return acc.replace(new RegExp(`(^|\\s)${k}(?=\\s|$)`, "gi"), (match, before) => {
                // Preserve the original capitalization of the first letter
                const firstChar = match.trim().charAt(0); // Get first character from the match
                const isUppercase = firstChar === firstChar.toUpperCase(); // Check if it's uppercase
                const correctedV = isUppercase ? v.charAt(0).toUpperCase() + v.slice(1) : v; // Capitalize properly
                return before + correctedV;
            });
        }, spellingTranslated);
        // 4. Handle time
        const timesTranslated = titlesTranslated.replace(timeRegex, timeReplace);

        return timesTranslated === trimText ? "Everything looks good to me!" : timesTranslated;
    }
}

module.exports = Translator;
