'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { SanityEvent, urlFor } from '@/lib/sanity';

interface EventsCalendarProps {
  events: SanityEvent[];
  selectedMonth: Date;
  onEventClick: (event: SanityEvent) => void;
}

interface CalendarDay {
  date: Date;
  events: SanityEvent[];
}

interface CalendarWeek {
  days: CalendarDay[];
}

export default function EventsCalendar({ events, selectedMonth, onEventClick }: EventsCalendarProps) {
  // Generate calendar grid for the selected month
  const calendar = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the starting Monday of the week containing the first day
    const startDate = new Date(firstDay);
    const dayOfWeek = startDate.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
    startDate.setDate(startDate.getDate() + diff);
    
    // Build weeks
    const weeks: CalendarWeek[] = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getMonth() === month) {
      const week: CalendarWeek = { days: [] };
      
      // Build 7 days for this week
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayEvents = events.filter(event => {
          const eventDate = new Date(event.date).toISOString().split('T')[0];
          return eventDate === dateStr;
        });
        
        week.days.push({
          date: new Date(currentDate),
          events: dayEvents,
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push(week);
      
      // Stop if we've passed the last day of the month
      if (currentDate.getDate() > lastDay.getDate() && currentDate.getMonth() !== month) {
        break;
      }
    }
    
    return weeks;
  }, [events, selectedMonth]);

  return (
    <div className="w-full h-full flex flex-col gap-1">
      {calendar.map((week, weekIndex) => (
        <CalendarWeekRow
          key={weekIndex}
          week={week}
          selectedMonth={selectedMonth}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  );
}

interface CalendarWeekRowProps {
  week: CalendarWeek;
  selectedMonth: Date;
  onEventClick: (event: SanityEvent) => void;
}

function CalendarWeekRow({ week, selectedMonth, onEventClick }: CalendarWeekRowProps) {
  // Calculate aspect ratios for dynamic column sizing
  const columnSizes = useMemo(() => {
    return week.days.map(day => {
      if (day.events.length === 0) return 1;
      
      // Get the widest aspect ratio for this day (if multiple events)
      const aspectRatios = day.events.map(event => {
        const dimensions = event.image?.asset?.metadata?.dimensions;
        return dimensions?.aspectRatio || 1;
      });
      
      return Math.max(...aspectRatios);
    });
  }, [week]);
  
  const totalSize = columnSizes.reduce((sum, size) => sum + size, 0);
  const columnWidths = columnSizes.map(size => `${(size / totalSize) * 100}%`);

  return (
    <div className="flex gap-1 flex-1">
      {week.days.map((day, dayIndex) => (
        <CalendarDayCell
          key={dayIndex}
          day={day}
          width={columnWidths[dayIndex]}
          selectedMonth={selectedMonth}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  );
}

interface CalendarDayCellProps {
  day: CalendarDay;
  width: string;
  selectedMonth: Date;
  onEventClick: (event: SanityEvent) => void;
}

function CalendarDayCell({ day, width, selectedMonth, onEventClick }: CalendarDayCellProps) {
  const isCurrentMonth = day.date.getMonth() === selectedMonth.getMonth();
  const hasEvents = day.events.length > 0;
  
  // Format the date header
  const dayOfWeek = day.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const monthName = day.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dateNum = day.date.getDate();
  const year = day.date.getFullYear();
  
  const dateHeader = `${dayOfWeek}, ${monthName}. ${dateNum}, ${year}`;

  return (
    <div
      className="flex flex-col border border-gray-300 overflow-hidden"
      style={{ width, minWidth: '60px' }}
    >
      {/* Date Header */}
      <div
        className={`text-xs font-bold text-center py-1 px-1 ${
          isCurrentMonth ? 'bg-purple-800 text-white' : 'bg-gray-400 text-gray-700'
        }`}
        style={{ fontSize: '0.65rem', lineHeight: '1.1' }}
      >
        {dateHeader}
      </div>
      
      {/* Event Images */}
      <div className="flex-1 flex flex-col bg-gray-200">
        {hasEvents ? (
          day.events.map((event, idx) => (
            <EventImage
              key={event._id}
              event={event}
              onClick={() => onEventClick(event)}
              isMultiple={day.events.length > 1}
            />
          ))
        ) : (
          <div className="flex-1" />
        )}
      </div>
    </div>
  );
}

interface EventImageProps {
  event: SanityEvent;
  onClick: () => void;
  isMultiple: boolean;
}

function EventImage({ event, onClick, isMultiple }: EventImageProps) {
  const imageUrl = event.image?.asset?.url ? event.image.asset.url : urlFor(event.image).url();
  const dimensions = event.image?.asset?.metadata?.dimensions;
  const aspectRatio = dimensions?.aspectRatio || 1;

  return (
    <div
      className="relative cursor-pointer hover:opacity-80 transition-opacity flex-1"
      onClick={onClick}
      style={{
        minHeight: isMultiple ? '100px' : '150px',
      }}
    >
      <Image
        src={imageUrl}
        alt={event.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    </div>
  );
}

