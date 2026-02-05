
import React from 'react';
import { CalendarIcon, UserGroupIcon } from './Icons';

const SubscribeButtons: React.FC = () => {
  // A GitHub Pages URL relatív az oldal gyökeréhez.
  const baseUrl = window.location.href.split('/').slice(0, -1).join('/');

  const wasteCalendarUrl = `webcal://${window.location.host}${window.location.pathname}calendars/hulladek_martonvasar_2026.ics`;
  const nameDayCalendarUrl = `webcal://${window.location.host}${window.location.pathname}calendars/nevmapok_hu.ics`;

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
      <a href={wasteCalendarUrl} className="flex items-center justify-center gap-3 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 transition-transform transform hover:scale-105 duration-300 w-full sm:w-auto">
        <CalendarIcon className="h-6 w-6" />
        <span>Feliratkozás a Hulladéknaptárra</span>
      </a>
      <a href={nameDayCalendarUrl} className="flex items-center justify-center gap-3 bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105 duration-300 w-full sm:w-auto">
        <UserGroupIcon className="h-6 w-6" />
        <span>Feliratkozás a Névnap naptárra</span>
      </a>
    </div>
  );
};

export default SubscribeButtons;
