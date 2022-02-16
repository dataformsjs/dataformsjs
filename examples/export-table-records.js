/**
 * This file build an array of records with random values and assigns it to
 * `window.records` and must be loaded before the main page runs in the
 * pages that use this script.
 */

(function() {
    // Build Word List
    var words = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
    words = words.replace(/\./g, '').replace(/,/g, '').split(' ');

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    // The maximum is exclusive and the minimum is inclusive
    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    }

    function buildWordList(wordCount, lineBreak) {
        var text = [];
        for (var n = 0; n < wordCount; n++) {
            if (lineBreak && text.length && (n % lineBreak === 0)) {
                text.push('\n');
            }
            text.push(words[getRandomInt(0, words.length)]);
        }
        return text.join(' ');
    }

    function padStart(value, length, char) {
        if (String.prototype.padStart) {
            return String(value).padStart(length, char);
        } else {
            // Handle value for IE.
            // This works for this known data but is not a full polyill replacement.
            value = String(value);
            length = length - value.length;
            var result = '';
            for (var n = 0; n < length; n++) {
                result += char;
            }
            return result + value;
        }
    }

    var now = new Date();
    var startDate = now.getTime();
    var endDate = new Date().setFullYear(now.getFullYear() + 1);

    var recordCount = 100;
    var records = [];
    for (var n = 0; n < recordCount; n++) {
        records.push({
            'Text 1': buildWordList(1),
            'Text 2': buildWordList(5),
            'Text 3': buildWordList(20, 5),
            'Text 4': buildWordList(20),
            'Int': getRandomInt(0, 99999),
            'Float': getRandomInt(0, 99999) + '.' + getRandomInt(0, 99),
            'Text Num': padStart(getRandomInt(0, 9999), 6, '0'),
            'Date': new Date(getRandomInt(startDate, endDate)),
        });
    }
    window.records = records;
})();
