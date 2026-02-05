
import React from 'react';

export const ArrowLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

export const ArrowRight: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-9 11.25h18" />
    </svg>
);

export const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.566-.649 1.26-1.25 2.009-1.743A18.97 18.97 0 0112 15.75c2.652 0 5.093-.693 7.16-1.888a18.973 18.973 0 01-3.742 2.72M15 15.75c-.649.566-1.25.126-1.743 2.009A18.97 18.97 0 0112 18c-2.652 0-5.093-.693-7.16-1.888a18.973 18.973 0 013.742-2.72m-7.5-2.962a3 3 0 00-4.682 2.72 9.094 9.094 0 003.741.479m12.023-1.479a3 3 0 00-4.682-2.72 9.094 9.094 0 003.741.479M18 15.75c.649-.566 1.25-1.126 1.743-2.009A18.97 18.97 0 0012 15c-2.652 0-5.093.693-7.16 1.888a18.973 18.973 0 003.742 2.72M12 12.75a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);

