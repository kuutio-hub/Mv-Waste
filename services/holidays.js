/**
 * Kiszámolja Húsvét vasárnap dátumát egy adott évre a Gauss-féle algoritmussal.
 * @param {number} year Az év.
 * @returns {Date} Húsvét vasárnapjának Date objektuma.
 */
function getEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

/**
 * Visszaadja a magyarországi munkaszüneti napok listáját a megadott évre.
 * Tartalmazza a fix és a mozgó ünnepeket is.
 * @param {number} year - Az év, amelyre az ünnepeket kérjük.
 * @returns {Array<Object>} Az esemény objektumok tömbje.
 */
export function getHungarianHolidays(year) {
    const holidays = [];
    const type = 'holiday';

    // Fix ünnepek
    holidays.push({ summary: 'Újév', startDate: new Date(year, 0, 1), type });
    holidays.push({ summary: 'Nemzeti ünnep', startDate: new Date(year, 2, 15), type });
    holidays.push({ summary: 'A munka ünnepe', startDate: new Date(year, 4, 1), type });
    holidays.push({ summary: 'Az államalapítás ünnepe', startDate: new Date(year, 7, 20), type });
    holidays.push({ summary: 'Nemzeti ünnep', startDate: new Date(year, 9, 23), type });
    holidays.push({ summary: 'Mindenszentek', startDate: new Date(year, 10, 1), type });
    holidays.push({ summary: 'Karácsony', startDate: new Date(year, 11, 25), type });
    holidays.push({ summary: 'Karácsony', startDate: new Date(year, 11, 26), type });

    // Mozgó ünnepek (Húsvét alapú)
    const easterSunday = getEasterSunday(year);
    
    const goodFriday = new Date(easterSunday);
    goodFriday.setDate(easterSunday.getDate() - 2);
    holidays.push({ summary: 'Nagypéntek', startDate: goodFriday, type });

    const easterMonday = new Date(easterSunday);
    easterMonday.setDate(easterSunday.getDate() + 1);
    holidays.push({ summary: 'Húsvéthétfő', startDate: easterMonday, type });

    const pentecostMonday = new Date(easterSunday);
    pentecostMonday.setDate(easterSunday.getDate() + 50);
    holidays.push({ summary: 'Pünkösdhétfő', startDate: pentecostMonday, type });

    return holidays;
}