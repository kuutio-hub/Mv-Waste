/**
 * iCal dátum- és időpont-stringet Date objektummá alakít.
 * Támogatott formátumok: YYYYMMDD és YYYYMMDDTHHMMSSZ (UTC).
 * @param {string} dateString - Az iCal formátumú dátum string.
 * @returns {Date | null} A feldolgozott Date objektum vagy null.
 */
function parseICalDate(dateString) {
    if (!dateString) return null;
    
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // JS hónapok 0-indexeltek
    const day = parseInt(dateString.substring(6, 8), 10);

    if (dateString.length > 8 && dateString.includes('T')) {
        const hour = parseInt(dateString.substring(9, 11), 10);
        const minute = parseInt(dateString.substring(11, 13), 10);
        const second = parseInt(dateString.substring(13, 15), 10);
        
        // A 'Z' végződés UTC időzónát jelez.
        if (dateString.endsWith('Z')) {
            return new Date(Date.UTC(year, month, day, hour, minute, second));
        }
        // Időzóna nélküli (feltételezhetően helyi) idő.
        return new Date(year, month, day, hour, minute, second);
    } else {
        // Csak dátum, időpont nélkül (egész napos esemény).
        return new Date(year, month, day);
    }
}

/**
 * Feldolgoz egy iCalendar (.ics) formátumú szöveget és visszaadja az események listáját.
 * @param {string} icsText - A teljes .ics fájl tartalma.
 * @param {'waste' | 'nameDay'} type - Az események típusának megjelölése a színezéshez.
 * @returns {Array<Object>} Az eseményeket tartalmazó objektumok tömbje.
 */
export function parseICS(icsText, type) {
    const events = [];
    const lines = icsText.replace(/\r\n/g, '\n').split('\n');
    
    let currentEvent = null;

    for (const line of lines) {
        if (line.startsWith('BEGIN:VEVENT')) {
            currentEvent = { type };
        } else if (line.startsWith('END:VEVENT')) {
            if (currentEvent && currentEvent.summary && currentEvent.startDate) {
                events.push(currentEvent);
            }
            currentEvent = null;
        } else if (currentEvent) {
            const [key, ...valueParts] = line.split(':');
            const value = valueParts.join(':').trim();

            if (key.startsWith('SUMMARY')) {
                currentEvent.summary = value;
            } else if (key.startsWith('DTSTART')) {
                currentEvent.startDate = parseICalDate(value);
            } else if (key.startsWith('DTEND')) {
                currentEvent.endDate = parseICalDate(value);
            } else if (key.startsWith('DESCRIPTION')) {
                currentEvent.description = value.replace(/\\n/g, '\n');
            } else if (key.startsWith('LOCATION')) {
                currentEvent.location = value;
            } else if (key.startsWith('UID')) {
                currentEvent.uid = value;
            } else if (key.startsWith('RRULE')) {
                currentEvent.rrule = value;
            }
            // Itt lehetne további mezőket (COLOR, IMAGE, stb.) is feldolgozni.
        }
    }

    return events;
}
