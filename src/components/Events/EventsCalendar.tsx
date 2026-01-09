'use client';

import React from 'react';
import Image from 'next/image';
import { SanityEvent, urlFor } from '@/lib/sanity';

interface EventsCalendarProps {
  events: SanityEvent[];
  onEventClick: (event: SanityEvent) => void;
}

// Group events by month
function groupEventsByMonth(events: SanityEvent[]): Map<string, SanityEvent[]> {
  const groups = new Map<string, SanityEvent[]>();
  
  events.forEach(event => {
    const date = new Date(event.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = groups.get(key) || [];
    groups.set(key, [...existing, event]);
  });
  
  return groups;
}

// Format date range for multi-day events
function formatDateRange(startDate: string, endDate?: string): string {
  const start = new Date(startDate);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  
  if (endDate) {
    const end = new Date(endDate);
    const startStr = start.toLocaleDateString('en-US', options);
    const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }
  
  return start.toLocaleDateString('en-US', { ...options, year: 'numeric' });
}

// Format time
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// Check if event is multi-day
function isMultiDay(event: SanityEvent): boolean {
  return Boolean(event.endDate);
}

export default function EventsCalendar({ events, onEventClick }: EventsCalendarProps) {
  // Events are already filtered by the parent - just display them
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500 text-xl">No events to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard 
          key={event._id} 
          event={event} 
          onClick={() => onEventClick(event)} 
        />
      ))}
    </div>
  );
}

interface EventCardProps {
  event: SanityEvent;
  onClick: () => void;
}

function EventCard({ event, onClick }: EventCardProps) {
  const imageUrl = event.image?.asset?.url || urlFor(event.image).url();
  const multiDay = isMultiDay(event);
  const eventDate = new Date(event.date);
  
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 flex"
    >
      {/* Date Column */}
      <div className={`flex-shrink-0 w-20 flex flex-col items-center justify-center p-3 ${
        multiDay ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'
      }`}>
        <span className="text-sm font-medium uppercase">
          {eventDate.toLocaleDateString('en-US', { weekday: 'short' })}
        </span>
        <span className="text-3xl font-bold">
          {eventDate.getDate()}
        </span>
        <span className="text-xs uppercase">
          {eventDate.toLocaleDateString('en-US', { month: 'short' })}
        </span>
        {multiDay && (
          <span className="text-xs mt-1 opacity-80">Multi-day</span>
        )}
      </div>

      {/* Image */}
      <div className="relative w-32 h-32 flex-shrink-0 bg-gray-200">
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          sizes="128px"
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
        <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-purple-600 transition-colors">
          {event.title}
        </h3>
        
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
          {multiDay ? (
            <span className="font-medium text-purple-600">
              {formatDateRange(event.date, event.endDate)}
            </span>
          ) : (
            <span>{formatTime(event.date)}</span>
          )}
          
          <span className="text-gray-400">•</span>
          
          <span className="capitalize">
            {event.location === 'suydam' ? '349 Suydam St' : 
             event.location === 'bogart' ? '94 Bogart St' : 
             'Off-site'}
          </span>
        </div>

        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {event.description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="flex items-center pr-4 text-gray-400 group-hover:text-purple-600 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}
