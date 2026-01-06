'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Metadata } from "next";
import { getAllEvents, getMonthsWithEvents, SanityEvent } from '@/lib/sanity';
import EventsCalendar from '@/components/Events/EventsCalendar';
import MonthSelector from '@/components/Events/MonthSelector';
import LocationFilter from '@/components/Events/LocationFilter';
import EventModal from '@/components/Events/EventModal';
import PastEventsButton from '@/components/Events/PastEventsButton';

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<SanityEvent[]>([]);
  const [availableMonths, setAvailableMonths] = useState<{ year: number; month: number; count: number }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedLocation, setSelectedLocation] = useState<'all' | 'suydam' | 'bogart'>('all');
  const [selectedEvent, setSelectedEvent] = useState<SanityEvent | null>(null);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch events on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const events = await getAllEvents();
        const months = await getMonthsWithEvents();
        
        setAllEvents(events);
        setAvailableMonths(months);
        
        // Set initial month to the next upcoming event or current month
        const now = new Date();
        const upcomingEvent = events.find(event => new Date(event.date) >= now);
        
        if (upcomingEvent) {
          const eventDate = new Date(upcomingEvent.date);
          setSelectedMonth(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Filter events by location and time period
  const filteredEvents = useMemo(() => {
    let filtered = allEvents;
    
    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(event => event.location === selectedLocation);
    }
    
    // Filter by past/upcoming
    const now = new Date();
    if (showPastEvents) {
      filtered = filtered.filter(event => new Date(event.date) < now);
    } else {
      filtered = filtered.filter(event => new Date(event.date) >= now);
    }
    
    // Filter by selected month
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    filtered = filtered.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
    
    return filtered;
  }, [allEvents, selectedLocation, selectedMonth, showPastEvents]);

  const handleMonthSelect = (year: number, month: number) => {
    setSelectedMonth(new Date(year, month, 1));
  };

  const handleLocationChange = (location: 'all' | 'suydam' | 'bogart') => {
    setSelectedLocation(location);
  };

  const handleEventClick = (event: SanityEvent) => {
    setSelectedEvent(event);
  };

  const handleTogglePastEvents = () => {
    setShowPastEvents(!showPastEvents);
    
    // Adjust selected month when toggling
    if (!showPastEvents) {
      // Switching to past events - find the most recent past month
      const pastMonths = availableMonths.filter(m => {
        const monthDate = new Date(m.year, m.month);
        return monthDate < new Date();
      });
      
      if (pastMonths.length > 0) {
        setSelectedMonth(new Date(pastMonths[0].year, pastMonths[0].month, 1));
      }
    } else {
      // Switching to upcoming - find the next upcoming month
      const now = new Date();
      const upcomingEvent = allEvents.find(event => new Date(event.date) >= now);
      
      if (upcomingEvent) {
        const eventDate = new Date(upcomingEvent.date);
        setSelectedMonth(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1));
      } else {
        setSelectedMonth(new Date());
      }
    }
  };

  if (loading) {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="absolute top-0 left-0 right-0 pt-20 z-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-center">EVENTS</h1>
      </header>
      <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-8">
      <header className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-center mb-8">EVENTS</h1>
        
        {/* Location Filter */}
        <div className="flex justify-center mb-6">
          <LocationFilter
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
          />
        </div>
      </header>

      {/* Calendar Container */}
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 gap-4">
          {/* Top Row: Month Selector + Calendar Grid */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <MonthSelector
                availableMonths={availableMonths}
                selectedMonth={selectedMonth}
                onMonthSelect={handleMonthSelect}
              />
            </div>
            
            <div className="flex-1 border-4 border-black p-4 bg-gray-50" style={{ height: '600px' }}>
              {filteredEvents.length > 0 ? (
                <EventsCalendar
                  events={filteredEvents}
                  selectedMonth={selectedMonth}
                  onEventClick={handleEventClick}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-xl">No events this month</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Row: Past Events Button */}
          <div className="flex justify-end">
            <PastEventsButton
              showPastEvents={showPastEvents}
              onToggle={handleTogglePastEvents}
            />
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

