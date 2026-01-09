'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { SanityEvent, urlFor } from '@/lib/sanity';

interface EventsCalendarProps {
  events: SanityEvent[];
  onEventClick: (event: SanityEvent) => void;
}

// Group events by date
function groupEventsByDate(events: SanityEvent[]): Map<string, SanityEvent[]> {
  const groups = new Map<string, SanityEvent[]>();
  
  events.forEach(event => {
    const date = new Date(event.date);
    const key = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const existing = groups.get(key) || [];
    groups.set(key, [...existing, event]);
  });
  
  return groups;
}

// Format date for display
function formatDateHeader(dateStr: string): { day: number; weekday: string; month: string } {
  const date = new Date(dateStr);
  return {
    day: date.getDate(),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  };
}

export default function EventsCalendar({ events, onEventClick }: EventsCalendarProps) {
  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = groupEventsByDate(events);
    // Sort by date
    const sortedEntries = Array.from(grouped.entries()).sort((a, b) => 
      new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );
    return sortedEntries;
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 text-xl">No events to display</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {eventsByDate.map(([dateStr, dateEvents]) => (
        <DateCell
          key={dateStr}
          dateStr={dateStr}
          events={dateEvents}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  );
}

interface DateCellProps {
  dateStr: string;
  events: SanityEvent[];
  onEventClick: (event: SanityEvent) => void;
}

function DateCell({ dateStr, events, onEventClick }: DateCellProps) {
  const { day, weekday, month } = formatDateHeader(dateStr);
  
  return (
    <div className="flex flex-col border border-gray-300 bg-white overflow-hidden">
      {/* Date Header */}
      <div className="bg-black text-white px-2 py-1 text-center">
        <div className="text-xs font-medium">{weekday}</div>
        <div className="text-xl font-bold leading-tight">{day}</div>
        <div className="text-xs">{month}</div>
      </div>
      
      {/* Events Stack */}
      <div className="flex flex-col gap-1 p-1">
        {events.map((event) => (
          <EventThumbnail
            key={event._id}
            event={event}
            onClick={() => onEventClick(event)}
          />
        ))}
      </div>
    </div>
  );
}

interface EventThumbnailProps {
  event: SanityEvent;
  onClick: () => void;
}

function EventThumbnail({ event, onClick }: EventThumbnailProps) {
  const imageUrl = event.image?.asset?.url || urlFor(event.image).url();
  
  return (
    <div
      onClick={onClick}
      className="relative aspect-square cursor-pointer overflow-hidden group"
    >
      <Image
        src={imageUrl}
        alt={event.title}
        fill
        className="object-cover transition-transform duration-200 group-hover:scale-105"
        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
      />
      {/* Hover overlay with title */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end">
        <div className="w-full p-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity truncate">
          {event.title}
        </div>
      </div>
    </div>
  );
}
