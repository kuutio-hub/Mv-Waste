
import React, { useMemo } from 'react';
import type { CalendarEvent } from '../types';

interface CalendarProps {
  currentDate: Date;
  events: CalendarEvent[];
}

const Calendar: React.FC<CalendarProps> = ({ currentDate, events }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [year, month]);

  const firstDayOfMonth = (daysInMonth[0].getDay() + 6) % 7; // 0 = Hétfő, 6 = Vasárnap

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const dayString = `${day.getFullYear()}${String(day.getMonth() + 1).padStart(2, '0')}${String(day.getDate()).padStart(2, '0')}`;
    
    return events.filter(event => {
      if (event.rrule) {
         if (event.rrule === 'FREQ=WEEKLY;BYDAY=WE' && day.getDay() === 3) { // Szerda
             const eventStartDate = new Date(event.startDate);
             eventStartDate.setHours(0,0,0,0);
             return day >= eventStartDate;
         }
         return false;
      }
      
      const eventDate = new Date(event.startDate);
      const eventDayString = `${eventDate.getFullYear()}${String(eventDate.getMonth() + 1).padStart(2, '0')}${String(eventDate.getDate()).padStart(2, '0')}`;
      return dayString === eventDayString;
    });
  };

  const weekDays = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 mb-2">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="border rounded-md bg-gray-50 h-24 sm:h-28"></div>
        ))}
        {daysInMonth.map(day => {
          const isToday = new Date().toDateString() === day.toDateString();
          const dayEvents = getEventsForDay(day);

          return (
            <div key={day.toString()} className={`border rounded-md p-2 flex flex-col h-24 sm:h-28 transition-colors duration-200 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
              <span className={`font-medium ${isToday ? 'text-blue-600 font-bold' : 'text-gray-800'}`}>{day.getDate()}</span>
              <div className="mt-1 overflow-y-auto text-xs flex-grow">
                {dayEvents.map((event, index) => (
                    <div key={index} title={event.summary} className={`truncate p-1 rounded mb-1 text-white ${event.type === 'waste' ? 'bg-green-500' : 'bg-indigo-400'}`}>
                        {event.summary}
                    </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
