import { parseICS } from './services/icalParser.js';
import { getHungarianHolidays } from './services/holidays.js';

// Állapot
let currentDate = new Date();
let allExternalEvents = [];
let allEvents = [];
let showHolidays = true;

// DOM Elemek
const monthYearEl = document.getElementById('month-year');
const calendarGridEl = document.getElementById('calendar-grid');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const subscribeButtonsEl = document.getElementById('subscribe-buttons');
const holidaysToggle = document.getElementById('holidays-toggle');

const ICONS = {
    waste: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>`,
    nameDay: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>`,
    notableDay: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.css57l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>`
};

/**
 * Összeállítja a teljes eseménylistát a külső és a beépített forrásokból.
 */
function buildEventList() {
    const year = currentDate.getFullYear();
    let combinedEvents = [...allExternalEvents];

    if (showHolidays) {
        combinedEvents.push(...getHungarianHolidays(year));
    }
    
    allEvents = combinedEvents.sort((a,b) => a.startDate - b.startDate);
}

/**
 * Kirajzolja a naptárat az `allEvents` és `currentDate` állapot alapján.
 */
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearEl.textContent = `${year}. ${currentDate.toLocaleString('hu-HU', { month: 'long' })}`;
    
    const dayCells = calendarGridEl.querySelectorAll('.day-cell');
    dayCells.forEach(cell => cell.remove());
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // 0=Hétfő

    for (let i = 0; i < startDayIndex; i++) {
        calendarGridEl.appendChild(document.createElement('div')).classList.add('day-cell', 'empty');
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.classList.add('day-cell');
        
        const date = new Date(year, month, day);
        const today = new Date();
        if (date.setHours(0,0,0,0) == today.setHours(0,0,0,0)) {
            cell.classList.add('today');
        }

        cell.innerHTML = `<span class="day-number">${day}</span><div class="events-container"></div>`;
        
        const eventsContainer = cell.querySelector('.events-container');
        const dayEvents = getEventsForDay(date);

        dayEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = `event ${event.type}`;
            eventEl.textContent = event.summary;
            eventEl.title = event.summary;
            eventsContainer.appendChild(eventEl);
        });

        calendarGridEl.appendChild(cell);
    }
}

function getEventsForDay(day) {
    day.setHours(0,0,0,0);
    const dayTimestamp = day.getTime();
    
    return allEvents.filter(event => {
        if (!event.startDate) return false;
        
        const eventStartDate = new Date(event.startDate);
        eventStartDate.setHours(0,0,0,0);

        // Ismétlődő események kezelése
        if (event.rrule) {
             if (event.rrule.includes('FREQ=WEEKLY')) {
                 if (eventStartDate > day) return false; // Ne jelenjen meg a kezdődátum előtt

                 const ruleDay = event.rrule.split('BYDAY=')[1]?.substring(0,2);
                 if (!ruleDay) return false;

                 const weekdays = {'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6, 'SU': 0};
                 if (weekdays[ruleDay] === day.getDay()) {
                    if(event.rrule.includes('INTERVAL=2')){
                        // Páros hetek logikája: a hetek számának különbsége páros kell legyen
                        const startWeek = Math.floor((eventStartDate.getTime() - new Date(eventStartDate.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7));
                        const currentWeek = Math.floor((day.getTime() - new Date(day.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7));
                        return (currentWeek - startWeek) % 2 === 0;
                    }
                    return true;
                 }
             }
             return false;
        }
        
        // Egyszerű, nem ismétlődő események
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

async function fetchAndParseCalendars() {
    try {
        const calendarSources = [
            { url: './calendars/hulladek.ics', type: 'waste' },
            { url: './calendars/nevmapok_hu.ics', type: 'nameDay' },
            { url: './calendars/jeles_napjaink.ics', type: 'notableDay' }
        ];

        const responses = await Promise.all(calendarSources.map(src => fetch(src.url)));
        
        const eventsPromises = responses.map((res, index) => {
            if (res.ok) {
                return res.text().then(text => parseICS(text, calendarSources[index].type));
            }
            console.warn(`A(z) ${calendarSources[index].url} naptár letöltése sikertelen.`);
            return []; // Hiba esetén üres tömb
        });

        const allParsedEvents = await Promise.all(eventsPromises);
        allExternalEvents = allParsedEvents.flat();
        
    } catch (error) {
        console.error("Hiba a külső naptárak feldolgozásakor:", error);
    } finally {
        updateAndRender(); // Mindig frissít, siker és hiba esetén is
    }
}

function setupEventListeners() {
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateAndRender();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateAndRender();
    });

    holidaysToggle.addEventListener('change', (e) => {
        showHolidays = e.target.checked;
        updateAndRender();
    });
}

function renderSubscribeButtons() {
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    
    const calendars = [
        { name: 'Hulladéknaptár', file: 'hulladek.ics', class: 'waste-cal-btn', icon: ICONS.waste },
        { name: 'Névnap Naptár', file: 'nevmapok_hu.ics', class: 'nameday-cal-btn', icon: ICONS.nameDay },
        { name: 'Jeles Napok', file: 'jeles_napjaink.ics', class: 'notable-day-cal-btn', icon: ICONS.notableDay }
    ];

    subscribeButtonsEl.innerHTML = calendars.map(cal => {
        const url = `webcal://${window.location.host}${basePath}calendars/${cal.file}`;
        return `
            <a href="${url}" class="${cal.class}">
                ${cal.icon}
                <span>${cal.name} Feliratkozás</span>
            </a>
        `;
    }).join('');
}

function init() {
    renderSubscribeButtons();
    setupEventListeners();
    updateAndRender(); // Azonnali rajzolás az üres állapottal
    fetchAndParseCalendars(); // Aszinkron adatbetöltés a háttérben
}

document.addEventListener('DOMContentLoaded', init);