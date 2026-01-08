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
  const ROW_HEIGHT = 400; // Fixed height for all rows in pixels
  
  const columnSizes = useMemo(() => {
    return week.days.map(day => {
      // Get the widest aspect ratio for this day (if multiple events)
      const aspectRatios = day.events.map(event => {
        const dimensions = event.image?.asset?.metadata?.dimensions;
        return dimensions?.aspectRatio || 1;
      });
      
      // Return the aspect ratio (width will be calculated as height * aspectRatio)
      return Math.max(...aspectRatios, 1);
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

  const headerHeight = 30; // Approximate header height
  const availableHeight = rowHeight - headerHeight - 16; // Subtract header and padding (p-2 = 8px top + 8px bottom)

  return (
    <div
      className="flex flex-col border border-gray-300 overflow-hidden"
      style={{ width, height: `${rowHeight}px` }}
    >
      {/* Date Header */}
      <div
        className={`text-xs font-bold text-center py-1 px-1 whitespace-nowrap flex-shrink-0 ${
          isCurrentMonth ? 'bg-purple-800 text-white' : 'bg-gray-400 text-gray-700'
        }`}
        style={{ fontSize: '0.65rem', lineHeight: '1.1', height: `${headerHeight}px` }}
      >
        {dateHeader}
      </div>
      
      {/* Event Images - Only show first image */}
      <div className="flex flex-col gap-2 bg-gray-200 p-2 flex-1">
        {day.events.map((event, idx) => (
          <EventImage
            key={event._id}
            event={event}
            onClick={() => onEventClick(event)}
            availableHeight={availableHeight}
            eventCount={day.events.length}
          />
        ))}
      </div>
    </div>
  );
}

interface EventImageProps {
  event: SanityEvent;
  onClick: () => void;
  availableHeight: number;
  eventCount: number;
}

function EventImage({ event, onClick, availableHeight, eventCount }: EventImageProps) {
  const imageUrl = event.image?.asset?.url ? event.image.asset.url : urlFor(event.image).url();
  const dimensions = event.image?.asset?.metadata?.dimensions;
  const aspectRatio = dimensions?.aspectRatio || 1;
  
  // Calculate height per image (divide available space minus gaps)
  const gapSize = (eventCount - 1) * 8; // 8px gap between images
  const imageHeight = (availableHeight - gapSize) / eventCount;

  return (
    <div
      className="relative cursor-pointer hover:opacity-90 transition-opacity w-full bg-white overflow-hidden shadow-sm flex-shrink-0"
      onClick={onClick}
      style={{
        height: `${imageHeight}px`,
        aspectRatio: aspectRatio.toString(),
      }}
    >
      <Image
        src={imageUrl}
        alt={event.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 20vw"
      />
    </div>
  );
}

