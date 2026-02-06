import { parseICS } from './services/icalParser.js';
import { getHungarianHolidays } from './services/holidays.js';

// === ÁLLAPOT ÉS KONFIGURÁCIÓ ===
let currentDate = new Date();
let allExternalEvents = [];
let allEvents = [];

const calendarConfig = {
    holidays: {
        id: 'holidays',
        name: 'Ünnepek',
        type: 'holiday',
        visible: true,
        isBuiltIn: true,
    },
    waste: {
        id: 'waste',
        name: 'Hulladék',
        url: './calendars/hulladek.ics',
        type: 'waste',
        visible: true,
    },
    nameDay: {
        id: 'nameDay',
        name: 'Névnapok',
        url: './calendars/nevmapok_hu.ics',
        type: 'nameDay',
        visible: true,
    },
    notableDay: {
        id: 'notableDay',
        name: 'Jeles Napok',
        url: './calendars/jeles_napjaink.ics',
        type: 'notableDay',
        visible: false,
    },
};

// === DOM ELEMEK ===
const monthYearDisplay = document.getElementById('month-year-display');
const calendarGridEl = document.getElementById('calendar-grid');
const yearSelect = document.getElementById('year-select');
const monthSelect = document.getElementById('month-select');
const calendarControlsEl = document.getElementById('calendar-controls');

// === FÜGGVÉNYEK ===

/**
 * Összeállítja a teljes eseménylistát a konfiguráció alapján.
 */
function buildEventList() {
    const year = currentDate.getFullYear();
    let combinedEvents = [];

    // Külső naptárak hozzáadása, ha láthatóak
    for (const key in calendarConfig) {
        const cal = calendarConfig[key];
        if (cal.visible && !cal.isBuiltIn) {
            const externalEventsForCal = allExternalEvents.filter(e => e.type === cal.type);
            combinedEvents.push(...externalEventsForCal);
        }
    }

    // Beépített naptárak hozzáadása, ha láthatóak
    if (calendarConfig.holidays.visible) {
        combinedEvents.push(...getHungarianHolidays(year));
    }
    
    allEvents = combinedEvents.sort((a, b) => a.startDate - b.startDate);
}

/**
 * Kirajzolja a naptárat a jelenlegi állapot alapján.
 */
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearDisplay.textContent = `${year}. ${currentDate.toLocaleString('hu-HU', { month: 'long' })}`;
    
    calendarGridEl.innerHTML = ''; // Rács ürítése
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // 0=Hétfő

    // Üres cellák a hónap elején
    for (let i = 0; i < startDayIndex; i++) {
        calendarGridEl.insertAdjacentHTML('beforeend', '<div class="day-cell empty"></div>');
    }
    
    // Napok feltöltése
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const today = new Date();
        const isToday = date.setHours(0,0,0,0) === today.setHours(0,0,0,0);
        
        const dayEvents = getEventsForDay(date);
        const eventsHtml = dayEvents.map(event => 
            `<div class="event ${event.type}" title="${event.summary}">${event.summary}</div>`
        ).join('');

        const cellHtml = `
            <div class="day-cell ${isToday ? 'today' : ''}">
                <span class="day-number">${day}</span>
                <div class="events-container">${eventsHtml}</div>
            </div>
        `;
        calendarGridEl.insertAdjacentHTML('beforeend', cellHtml);
    }
}

function getEventsForDay(day) {
    day.setHours(0,0,0,0);
    const dayTimestamp = day.getTime();
    
    return allEvents.filter(event => {
        if (!event.startDate) return false;
        
        const eventStartDate = new Date(event.startDate);
        eventStartDate.setHours(0,0,0,0);

        if (event.rrule) {
             if (event.rrule.includes('FREQ=WEEKLY')) {
                 if (eventStartDate > day) return false;
                 const ruleDay = event.rrule.split('BYDAY=')[1]?.substring(0,2);
                 if (!ruleDay) return false;
                 const weekdays = {'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6, 'SU': 0};
                 if (weekdays[ruleDay] !== day.getDay()) return false;
                 
                 if (event.rrule.includes('INTERVAL=2')) {
                    const weekInMillis = 7 * 24 * 60 * 60 * 1000;
                    const diff = Math.floor((day.getTime() - eventStartDate.getTime()) / weekInMillis);
                    return diff % 2 === 0;
                 }
                 return true;
             }
             return false;
        }
        
        return eventStartDate.getTime() === dayTimestamp;
    });
}

/**
 * Frissíti az eseménylistát és újrarajzolja a naptárat.
 */
function updateAndRender() {
    buildEventList();
    renderCalendar();
}

/**
 * Letölti és feldolgozza az összes külső naptárat.
 */
async function fetchAndParseAllCalendars() {
    try {
        const calendarsToFetch = Object.values(calendarConfig).filter(cal => !cal.isBuiltIn && cal.url);
        const responses = await Promise.all(calendarsToFetch.map(src => fetch(src.url)));
        
        const eventsPromises = responses.map((res, index) => {
            const cal = calendarsToFetch[index];
            if (res.ok) {
                return res.text().then(text => parseICS(text, cal.type));
            }
            console.warn(`A(z) ${cal.url} naptár letöltése sikertelen.`);
            return [];
        });

        const allParsedEvents = await Promise.all(eventsPromises);
        allExternalEvents = allParsedEvents.flat();
        
    } catch (error) {
        console.error("Hiba a külső naptárak feldolgozásakor:", error);
    } finally {
        updateAndRender();
    }
}

/**
 * Dátumválasztó legördülő menük feltöltése.
 */
function populateDateSelectors() {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Év választó
    let yearOptions = '';
    for (let year = currentYear - 100; year <= currentYear + 100; year++) {
        yearOptions += `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`;
    }
    yearSelect.innerHTML = yearOptions;

    // Hónap választó
    let monthOptions = '';
    for (let month = 0; month < 12; month++) {
        const monthName = new Date(currentYear, month).toLocaleString('hu-HU', { month: 'long' });
        monthOptions += `<option value="${month}" ${month === currentMonth ? 'selected' : ''}>${monthName}</option>`;
    }
    monthSelect.innerHTML = monthOptions;
}

/**
 * Fejlécben lévő naptárvezérlők kirajzolása.
 */
function renderHeaderControls() {
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    
    calendarControlsEl.innerHTML = Object.values(calendarConfig).map(cal => {
        const subscribeLink = cal.isBuiltIn ? '' : 
            `<a href="webcal://${window.location.host}${basePath}${cal.url.substring(2)}" title="Feliratkozás">🔗</a>`;
        
        return `
            <div class="control-group">
                <button data-cal-id="${cal.id}" class="${cal.type} ${cal.visible ? 'active' : ''}">
                    ${cal.name}
                </button>
                ${subscribeLink}
            </div>
        `;
    }).join('');
}


/**
 * Eseményfigyelők beállítása.
 */
function setupEventListeners() {
    yearSelect.addEventListener('change', () => {
        currentDate.setFullYear(parseInt(yearSelect.value, 10));
        updateAndRender();
    });

    monthSelect.addEventListener('change', () => {
        currentDate.setMonth(parseInt(monthSelect.value, 10));
        updateAndRender();
    });

    calendarControlsEl.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (button) {
            const calId = button.dataset.calId;
            if (calendarConfig[calId]) {
                calendarConfig[calId].visible = !calendarConfig[calId].visible;
                button.classList.toggle('active');
                updateAndRender();
            }
        }
    });
}

/**
 * Alkalmazás inicializálása.
 */
function init() {
    populateDateSelectors();
    renderHeaderControls();
    setupEventListeners();
    fetchAndParseAllCalendars(); // Ez a végén hívja meg az updateAndRender-t
}

document.addEventListener('DOMContentLoaded', init);