/**
 * iCal dátum- és időpont-stringet Date objektummá alakít.
 * Támogatott formátumok: YYYYMMDD és YYYYMMDDTHHMMSSZ (UTC).
 * @param {string} dateString - Az iCal formátumú dátum string.
 * @returns {Date | null} A feldolgozott Date objektum vagy null.
 */
function parseICalDate(dateString) {
    if (!dateString || dateString.length < 8) return null;
    
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // JS hónapok 0-indexeltek
    const day = parseInt(dateString.substring(6, 8), 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    if (dateString.length > 8 && dateString.includes('T')) {
        const hour = parseInt(dateString.substring(9, 11), 10);
        const minute = parseInt(dateString.substring(11, 13), 10);
        const second = parseInt(dateString.substring(13, 15), 10);
        
        if (dateString.endsWith('Z')) {
            return new Date(Date.UTC(year, month, day, hour || 0, minute || 0, second || 0));
        }
        return new Date(year, month, day, hour || 0, minute || 0, second || 0);
    } else {
        return new Date(year, month, day);
    }
}

/**
 * Feldolgoz egy iCalendar (.ics) formátumú szöveget és visszaadja az események listáját.
 * @param {string} icsText - A teljes .ics fájl tartalma.
 * @param {string} type - Az események típusának megjelölése a színezéshez.
 * @returns {Array<Object>} Az eseményeket tartalmazó objektumok tömbje.
 */
export function parseICS(icsText, type = 'default') {
    const events = [];
    // Kezeli a különböző sortöréseket és az üres sorokat
    const lines = icsText.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim() !== '');
    
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
            const separatorIndex = line.indexOf(':');
            if (separatorIndex === -1) continue;

            const key = line.substring(0, separatorIndex);
            const value = line.substring(separatorIndex + 1).trim();

            if (key.startsWith('SUMMARY')) {
                currentEvent.summary = value;
            } else if (key.startsWith('DTSTART')) {
                const date = parseICalDate(value);
                if (date) currentEvent.startDate = date;
            } else if (key.startsWith('DTEND')) {
                const date = parseICalDate(value);
                if (date) currentEvent.endDate = date;
            } else if (key.startsWith('DESCRIPTION')) {
                currentEvent.description = value.replace(/\\n/g, '\n');
            } else if (key.startsWith('LOCATION')) {
                currentEvent.location = value;
            } else if (key.startsWith('UID')) {
                currentEvent.uid = value;
            } else if (key.startsWith('RRULE')) {
                currentEvent.rrule = value;
            }
        }
    }

    return events;
}