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
    <div className="w-full flex flex-col gap-2">
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
  // Set a consistent row height and calculate column widths based on aspect ratios
  const ROW_HEIGHT = 450; // Fixed height for all rows in pixels
  
  const columnSizes = useMemo(() => {
    return week.days.map(day => {
      if (day.events.length === 0) return 1;
      
      // For both single and multiple events, use the widest aspect ratio
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
    <div className="flex gap-2" style={{ height: `${ROW_HEIGHT}px` }}>
      {week.days.map((day, dayIndex) => (
        <CalendarDayCell
          key={dayIndex}
          day={day}
          width={columnWidths[dayIndex]}
          selectedMonth={selectedMonth}
          onEventClick={onEventClick}
          rowHeight={ROW_HEIGHT}
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
  rowHeight: number;
}

function CalendarDayCell({ day, width, selectedMonth, onEventClick, rowHeight }: CalendarDayCellProps) {
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
      className="flex flex-col border-2 border-gray-400 overflow-hidden"
      style={{ width, height: `${rowHeight}px` }}
    >
      {/* Date Header */}
      <div
        className={`text-xs font-bold text-center py-2 px-2 whitespace-nowrap flex-shrink-0 ${
          isCurrentMonth ? 'bg-purple-800 text-white' : 'bg-gray-500 text-white'
        }`}
        style={{ fontSize: '0.7rem', lineHeight: '1.2' }}
      >
        {dateHeader}
      </div>
      
      {/* Event Images - Fill remaining space */}
      <div className="flex flex-col gap-1 flex-1">
        {day.events.map((event, idx) => (
          <EventImage
            key={event._id}
            event={event}
            onClick={() => onEventClick(event)}
          />
        ))}
      </div>
    </div>
  );
}

interface EventImageProps {
  event: SanityEvent;
  onClick: () => void;
}

function EventImage({ event, onClick }: EventImageProps) {
  const imageUrl = event.image?.asset?.url ? event.image.asset.url : urlFor(event.image).url();

  return (
    <div
      className="relative cursor-pointer hover:opacity-90 transition-opacity w-full flex-1"
      onClick={onClick}
    >
      <Image
        src={imageUrl}
        alt={event.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 25vw"
      />
    </div>
  );
}

