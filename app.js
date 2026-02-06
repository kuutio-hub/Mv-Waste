import { parseICS } from './services/icalParser.js';

// Állapot
let currentDate = new Date();
let allEvents = [];

// DOM Elemek
const monthYearEl = document.getElementById('month-year');
const calendarGridEl = document.getElementById('calendar-grid');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const subscribeButtonsEl = document.getElementById('subscribe-buttons');

const ICONS = {
    waste: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" /></svg>`,
    nameDay: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.566-.649 1.26-1.25 2.009-1.743A18.97 18.97 0 0112 15.75c2.652 0 5.093-.693 7.16-1.888a18.973 18.973 0 01-3.742 2.72m-7.5-2.962a3 3 0 00-4.682 2.72 9.094 9.094 0 003.741.479m12.023-1.479a3 3 0 00-4.682-2.72 9.094 9.094 0 003.741.479M12 12.75a3 3 0 100-6 3 3 0 000 6z" /></svg>`,
    notableDay: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>`
};

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearEl.textContent = `${year}. ${currentDate.toLocaleString('hu-HU', { month: 'long' })}`;
    
    // Előző hónap celláinak törlése, a fejléc megtartásával
    const dayCells = calendarGridEl.querySelectorAll('.day-cell');
    dayCells.forEach(cell => cell.remove());
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // 0=Hétfő, 6=Vasárnap

    // Üres cellák a hónap elején
    for (let i = 0; i < startDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day-cell', 'empty');
        calendarGridEl.appendChild(emptyCell);
    }
    
    // Napok cellái
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.classList.add('day-cell');
        
        const date = new Date(year, month, day);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            cell.classList.add('today');
        }

        const dayNumber = document.createElement('span');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        const eventsContainer = document.createElement('div');
        eventsContainer.classList.add('events-container');

        const dayEvents = getEventsForDay(date);
        dayEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.classList.add('event', event.type);
            eventEl.textContent = event.summary;
            eventEl.title = event.summary;
            eventsContainer.appendChild(eventEl);
        });

        cell.appendChild(eventsContainer);
        calendarGridEl.appendChild(cell);
    }
}

function getEventsForDay(day) {
    const dayString = `${day.getFullYear()}${String(day.getMonth() + 1).padStart(2, '0')}${String(day.getDate()).padStart(2, '0')}`;
    
    return allEvents.filter(event => {
        if (event.rrule) {
             if (event.rrule.includes('FREQ=WEEKLY') && event.rrule.includes('BYDAY=')) {
                 const weekdays = {'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6, 'SU': 0};
                 const ruleDay = event.rrule.split('BYDAY=')[1].substring(0,2);
                 const dayIndex = (day.getDay() + 6) % 7 + 1; // H=1..V=7, JS day: V=0..Szo=6 -> H=1..V=0
                 const jsDayIndex = day.getDay();

                 if (weekdays[ruleDay] === jsDayIndex) {
                    const eventStartDate = new Date(event.startDate);
                    eventStartDate.setHours(0,0,0,0);
                    // Check interval if present
                    if(event.rrule.includes('INTERVAL=2')){
                        const weekNumberStart = Math.ceil((eventStartDate.getDate() + (eventStartDate.getDay() + 6) % 7) / 7);
                        const weekNumberCurrent = Math.ceil((day.getDate() + (day.getDay() + 6) % 7) / 7);
                        return day >= eventStartDate && (weekNumberCurrent - weekNumberStart) % 2 === 0;
                    }
                    return day >= eventStartDate;
                 }
             }
             return false;
        }
        
        const eventDate = new Date(event.startDate);
        const eventDayString = `${eventDate.getFullYear()}${String(eventDate.getMonth() + 1).padStart(2, '0')}${String(eventDate.getDate()).padStart(2, '0')}`;
        return dayString === eventDayString;
    });
}

async function fetchAndParseCalendars() {
    try {
        const [wasteResponse, nameDayResponse, notableDayResponse] = await Promise.all([
            fetch('./calendars/hulladek_martonvasar_2026.ics'),
            fetch('./calendars/nevmapok_hu.ics'),
            fetch('./calendars/jeles_napjaink.ics')
        ]);

        if (!wasteResponse.ok) throw new Error('A hulladéknaptár letöltése sikertelen.');
        if (!nameDayResponse.ok) throw new Error('A névnap naptár letöltése sikertelen.');
        if (!notableDayResponse.ok) throw new Error('A jeles napok naptár letöltése sikertelen.');
        
        const [wasteText, nameDayText, notableDayText] = await Promise.all([
            wasteResponse.text(),
            nameDayResponse.text(),
            notableDayResponse.text()
        ]);

        const wasteEvents = parseICS(wasteText, 'waste');
        const nameDayEvents = parseICS(nameDayText, 'nameDay');
        const notableDayEvents = parseICS(notableDayText, 'notableDay');
        
        allEvents = [...wasteEvents, ...nameDayEvents, ...notableDayEvents].sort((a,b) => a.startDate - b.startDate);
        renderCalendar();
    } catch (error) {
        console.error("Hiba a naptárak betöltésekor:", error);
        monthYearEl.textContent = "Hiba";
        calendarGridEl.innerHTML += `<p style="color: red; grid-column: 1 / 8; text-align: center;">${error.message}</p>`;
    }
}

function setupEventListeners() {
    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });
}

function renderSubscribeButtons() {
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    
    const wasteCalendarUrl = `webcal://${window.location.host}${basePath}calendars/hulladek_martonvasar_2026.ics`;
    const nameDayCalendarUrl = `webcal://${window.location.host}${basePath}calendars/nevmapok_hu.ics`;
    const notableDayCalendarUrl = `webcal://${window.location.host}${basePath}calendars/jeles_napjaink.ics`;

    subscribeButtonsEl.innerHTML = `
        <a href="${wasteCalendarUrl}" class="waste-cal-btn">
            ${ICONS.waste}
            <span>Hulladéknaptár Feliratkozás</span>
        </a>
        <a href="${nameDayCalendarUrl}" class="nameday-cal-btn">
            ${ICONS.nameDay}
            <span>Névnap Naptár Feliratkozás</span>
        </a>
        <a href="${notableDayCalendarUrl}" class="notable-day-cal-btn">
            ${ICONS.notableDay}
            <span>Jeles Napok Feliratkozás</span>
        </a>
    `;
}

function init() {
    renderSubscribeButtons();
    setupEventListeners();
    fetchAndParseCalendars();
}

document.addEventListener('DOMContentLoaded', init);