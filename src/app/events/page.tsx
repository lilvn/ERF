'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getAllEvents, getMonthsWithEvents, SanityEvent } from '@/lib/sanity';
import EventsCalendar from '@/components/Events/EventsCalendar';
import EventModal from '@/components/Events/EventModal';

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<SanityEvent[]>([]);
  const [availableMonths, setAvailableMonths] = useState<{ year: number; month: number; count: number }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<SanityEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch events on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const events = await getAllEvents();
        const months = await getMonthsWithEvents();
        
        setAllEvents(events);
        setAvailableMonths(months);
        
        // Set initial month to the month containing the next upcoming event
        const now = new Date();
        const upcomingEvent = events.find(event => new Date(event.date) >= now);
        
        if (upcomingEvent) {
          const eventDate = new Date(upcomingEvent.date);
          setSelectedMonth(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
        } else if (months.length > 0) {
          // Default to most recent month with events
          setSelectedMonth(new Date(months[0].year, months[0].month, 1));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Filter events by selected month
  const filteredEvents = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  }, [allEvents, selectedMonth]);

  const handleEventClick = (event: SanityEvent) => {
    setSelectedEvent(event);
  };

  const handlePrevMonth = () => {
    const currentIndex = availableMonths.findIndex(
      m => m.year === selectedMonth.getFullYear() && m.month === selectedMonth.getMonth()
    );
    if (currentIndex < availableMonths.length - 1) {
      const prev = availableMonths[currentIndex + 1];
      setSelectedMonth(new Date(prev.year, prev.month, 1));
    }
  };

  const handleNextMonth = () => {
    const currentIndex = availableMonths.findIndex(
      m => m.year === selectedMonth.getFullYear() && m.month === selectedMonth.getMonth()
    );
    if (currentIndex > 0) {
      const next = availableMonths[currentIndex - 1];
      setSelectedMonth(new Date(next.year, next.month, 1));
    }
  };

  const canGoPrev = availableMonths.findIndex(
    m => m.year === selectedMonth.getFullYear() && m.month === selectedMonth.getMonth()
  ) < availableMonths.length - 1;

  const canGoNext = availableMonths.findIndex(
    m => m.year === selectedMonth.getFullYear() && m.month === selectedMonth.getMonth()
  ) > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-12 text-gray-900">EVENTS</h1>
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-gray-500">Loading events...</div>
          </div>
        </div>
      </div>
    );
  }

  const monthLabel = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">EVENTS</h1>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            className={`p-2 rounded-full transition-colors ${
              canGoPrev 
                ? 'hover:bg-gray-200 text-gray-700' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="min-w-[200px] text-center">
            <h2 className="text-2xl font-semibold text-gray-900">{monthLabel}</h2>
            <p className="text-sm text-gray-500">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className={`p-2 rounded-full transition-colors ${
              canGoNext 
                ? 'hover:bg-gray-200 text-gray-700' 
                : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Quick Month Jump */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {availableMonths.slice(0, 12).map(({ year, month, count }) => {
            const isSelected = year === selectedMonth.getFullYear() && month === selectedMonth.getMonth();
            const label = new Date(year, month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            
            return (
              <button
                key={`${year}-${month}`}
                onClick={() => setSelectedMonth(new Date(year, month, 1))}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  isSelected
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {label}
                <span className="ml-1 opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Events List */}
        <EventsCalendar
          events={filteredEvents}
          selectedMonth={selectedMonth}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
