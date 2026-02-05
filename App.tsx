
import React, { useState, useEffect, useCallback } from 'react';
import Calendar from './components/Calendar';
import SubscribeButtons from './components/SubscribeButtons';
import { parseICS } from './services/icalParser';
import type { CalendarEvent } from './types';
import { ArrowLeft, ArrowRight } from './components/Icons';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const wasteResponse = await fetch('./calendars/hulladek_martonvasar_2026.ics');
      if (!wasteResponse.ok) throw new Error('A hulladéknaptár letöltése sikertelen.');
      const wasteText = await wasteResponse.text();
      const wasteEvents = parseICS(wasteText, 'waste');

      const nameDayResponse = await fetch('./calendars/nevmapok_hu.ics');
      if (!nameDayResponse.ok) throw new Error('A névnap naptár letöltése sikertelen.');
      const nameDayText = await nameDayResponse.text();
      const nameDayEvents = parseICS(nameDayText, 'nameDay');

      setEvents([...wasteEvents, ...nameDayEvents]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ismeretlen hiba történt.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('hu-HU', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl font-sans">
      <header className="text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">iCal Naptárak</h1>
        <p className="text-gray-600 mt-2">Böngészhető naptárnézet és feliratkozási lehetőségek</p>
      </header>
      
      <SubscribeButtons />

      <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 mt-8">
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200" aria-label="Előző hónap">
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-700 capitalize w-48 text-center">{`${year}. ${monthName}`}</h2>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200" aria-label="Következő hónap">
            <ArrowRight className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Naptárak betöltése...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 bg-red-50 p-4 rounded-md">
            <p>Hiba történt: {error}</p>
          </div>
        ) : (
          <Calendar currentDate={currentDate} events={events} />
        )}
      </div>
       <footer className="text-center text-gray-500 mt-8 text-sm">
        <p>Készült a GitHub Pages-en való hosztoláshoz.</p>
      </footer>
    </div>
  );
};

export default App;
