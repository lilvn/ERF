'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getAllEvents, getMonthsWithEvents, SanityEvent } from '@/lib/sanity';
import EventsCalendar from '@/components/Events/EventsCalendar';
import EventModal from '@/components/Events/EventModal';
import { ChevronDown } from 'lucide-react';

export default function EventsPage() {
  const [allEvents, setAllEvents] = useState<SanityEvent[]>([]);
  const [availableMonths, setAvailableMonths] = useState<{ year: number; month: number; count: number }[]>([]);
  const [viewMode, setViewMode] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedPastMonth, setSelectedPastMonth] = useState<{ year: number; month: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<SanityEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch events on mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        const events = await getAllEvents();
        const months = await getMonthsWithEvents();
        
        setAllEvents(events);
        setAvailableMonths(months);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Filter events based on view mode
  const filteredEvents = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (viewMode === 'upcoming') {
      return allEvents
        .filter(event => new Date(event.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (selectedPastMonth) {
      const { year, month } = selectedPastMonth;
      return allEvents
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return [];
  }, [allEvents, viewMode, selectedPastMonth]);

  // Get past months (months before current date)
  const pastMonths = useMemo(() => {
    const now = new Date();
    return availableMonths.filter(({ year, month }) => {
      const monthDate = new Date(year, month + 1, 0);
      return monthDate < now;
    });
  }, [availableMonths]);

  const handleUpcomingClick = () => {
    setViewMode('upcoming');
    setSelectedPastMonth(null);
    setDropdownOpen(false);
  };

  const handlePastMonthSelect = (year: number, month: number) => {
    setViewMode('past');
    setSelectedPastMonth({ year, month });
    setDropdownOpen(false);
  };

  const handleEventClick = (event: SanityEvent) => {
    setSelectedEvent(event);
  };

  // Get display text for past events button
  const getPastButtonText = () => {
    if (viewMode === 'past' && selectedPastMonth) {
      const date = new Date(selectedPastMonth.year, selectedPastMonth.month);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return 'Past Events';
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">EVENTS</h1>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {/* Upcoming Button */}
          <button
            onClick={handleUpcomingClick}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              viewMode === 'upcoming'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Upcoming
          </button>

          {/* Past Events Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                viewMode === 'past'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {getPastButtonText()}
              <ChevronDown 
                size={18} 
                className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {pastMonths.length > 0 ? (
                  pastMonths.map(({ year, month, count }) => {
                    const label = new Date(year, month).toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    });
                    const isSelected = selectedPastMonth?.year === year && selectedPastMonth?.month === month;
                    
                    return (
                      <button
                        key={`${year}-${month}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePastMonthSelect(year, month);
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex justify-between items-center ${
                          isSelected ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                        }`}
                      >
                        <span>{label}</span>
                        <span className="text-sm text-gray-400">{count}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">No past events</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Events Count */}
        <div className="text-center mb-6 text-gray-500">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          {viewMode === 'upcoming' && ' coming up'}
        </div>

        {/* Events List */}
        {filteredEvents.length > 0 ? (
          <EventsCalendar
            events={filteredEvents}
            onEventClick={handleEventClick}
          />
        ) : (
          <div className="text-center py-20 text-gray-500">
            {viewMode === 'upcoming' 
              ? 'No upcoming events scheduled' 
              : 'Select a month to view past events'}
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setDropdownOpen(false)}
        />
      )}

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
