
import type { CalendarEvent } from '../types';

export const parseICS = (icsText: string, type: 'waste' | 'nameDay'): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const lines = icsText.replace(/\r\n/g, '\n').split('\n');

  let currentEvent: Partial<CalendarEvent> | null = null;

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = { type };
    } else if (line.startsWith('END:VEVENT')) {
      if (currentEvent && currentEvent.summary && currentEvent.startDate) {
        events.push(currentEvent as CalendarEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8).trim();
      } else if (line.startsWith('DTSTART;VALUE=DATE:')) {
        const dateStr = line.substring(20, 28);
        const year = parseInt(dateStr.substring(0, 4), 10);
        const month = parseInt(dateStr.substring(4, 6), 10) - 1; // JS months are 0-indexed
        const day = parseInt(dateStr.substring(6, 8), 10);
        currentEvent.startDate = new Date(year, month, day);
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12).replace(/\\n/g, '\n').trim();
      } else if (line.startsWith('RRULE:')) {
        currentEvent.rrule = line.substring(6).trim();
      }
    }
  }

  return events;
};
