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
  // Generate calendar grid - only showing dates with events
  const calendar = useMemo(() => {
    // Group events by date
    const eventsByDate = new Map<string, SanityEvent[]>();
    
    events.forEach(event => {
      const dateStr = new Date(event.date).toISOString().split('T')[0];
      const existing = eventsByDate.get(dateStr) || [];
      eventsByDate.set(dateStr, [...existing, event]);
    });
    
    // Sort dates and group into weeks (7 days per row)
    const sortedDates = Array.from(eventsByDate.keys()).sort();
    const weeks: CalendarWeek[] = [];
    
    for (let i = 0; i < sortedDates.length; i += 7) {
      const weekDates = sortedDates.slice(i, i + 7);
      const week: CalendarWeek = {
        days: weekDates.map(dateStr => ({
          date: new Date(dateStr),
          events: eventsByDate.get(dateStr) || [],
        })),
      };
      weeks.push(week);
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
      // Get the widest aspect ratio for this day (if multiple events)
      const aspectRatios = day.events.map(event => {
        const dimensions = event.image?.asset?.metadata?.dimensions;
        return dimensions?.aspectRatio || 1;
      });
      
      return Math.max(...aspectRatios, 1); // Default to 1 if no events
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
  // Format the date header
  const dayOfWeek = day.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const monthName = day.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dateNum = day.date.getDate();
  const year = day.date.getFullYear();
  
  const dateHeader = `${dayOfWeek}, ${monthName}. ${dateNum}, ${year}`;
  
  // Check if this date is in the current month
  const isCurrentMonth = day.date.getMonth() === selectedMonth.getMonth();

  return (
    <div
      className="flex flex-col border border-gray-300 overflow-hidden"
      style={{ width, minWidth: '80px' }}
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
        {day.events.map((event, idx) => (
          <EventImage
            key={event._id}
            event={event}
            onClick={() => onEventClick(event)}
            isMultiple={day.events.length > 1}
          />
        ))}
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

