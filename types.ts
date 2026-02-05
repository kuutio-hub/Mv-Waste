
export interface CalendarEvent {
  summary: string;
  description?: string;
  startDate: Date;
  rrule?: string;
  type: 'waste' | 'nameDay';
}
