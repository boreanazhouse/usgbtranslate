const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require("./american-to-british-titles.js")
const britishOnly = require('./british-only.js')

class Translator {
    translate(text, locale) {
        const localeConfig = {
            "american-to-british": {
                dictionary: americanOnly,
                reverseDictionary: americanToBritishSpelling,
                titles: americanToBritishTitles,
                timeRegex: /(\d{1,2}):(\d{2})/g,
                timeReplace: `<span class="highlight">$1.$2</span>`,
            },
            "british-to-american": {
                dictionary: britishOnly,
                reverseDictionary: Object.fromEntries(Object.entries(americanToBritishSpelling).map(([k, v]) => [v, k])),
                titles: Object.fromEntries(Object.entries(americanToBritishTitles).map(([k, v]) => [v, k])),
                timeRegex: /(\d{1,2})\.(\d{2})/g,
                timeReplace: `<span class="highlight">$1:$2</span>`,
            },
        };
        
        const { dictionary, reverseDictionary, titles, timeRegex, timeReplace } = localeConfig[locale];
        
        // 1. Time
        const timeChanged = text.replace(timeRegex, timeReplace);
        // 2. Title
        // We have to sort the keys to prevent partial matching 
        const titleChanged = Object.keys(titles).sort((a, b) => b.length - a.length).reduce((acc, title) => {
            const regex = locale === "american-to-british" ? new RegExp(title, "gi") : new RegExp(`\\b${title}\\b`, "gi");
            const replacement = acc.replace(regex, `<span class="highlight">${titles[title].charAt(0).toUpperCase() + titles[title].slice(1)}</span>`);
            return replacement;
        }, timeChanged);
        // 3. Spelling
        const spellingChanged = Object.keys(reverseDictionary).sort((a, b) => b.length - a.length).reduce((acc, word) => {
            const regex = new RegExp(`\\b${word}\\b`, "gi");
            const replacement = acc.replace(regex, `<span class="highlight">${reverseDictionary[word]}</span>`);
            return replacement;
        }, titleChanged);
        // 4. Slang
        const slangChanged = Object.keys(dictionary).sort((a, b) => b.length - a.length).reduce((acc, word) => {
            const regex = new RegExp(`\\b${word}\\b`, "gi");
            const replacement = acc.replace(regex, `<span class="highlight">${dictionary[word]}</span>`);
            return replacement;
        }, spellingChanged);
        // Done
        const finalTranslation = slangChanged;

        return finalTranslation === text ? "Everything looks good to me!" : finalTranslation;
    }
}

module.exports = Translator;
