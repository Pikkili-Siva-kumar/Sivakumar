import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HOTEL_DEMO_ROOMS } from '../../data/playground';

/**
 * HotelBookingPlayground Component
 * Step 30: Interactive Room Availability & Overlap Protection Demo
 *
 * Demonstrates deterministic interval collision logic inspired by the
 * Luxury Hotel Management project without modifying any real database.
 */
export default function HotelBookingPlayground() {
  const [selectedRoomId, setSelectedRoomId] = useState('101');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const selectedRoom = useMemo(
    () => HOTEL_DEMO_ROOMS.find((r) => r.id === selectedRoomId) || HOTEL_DEMO_ROOMS[0],
    [selectedRoomId]
  );

  // Compute availability state based on deterministic booking intervals
  const evaluation = useMemo(() => {
    if (!checkIn || !checkOut) {
      return {
        status: 'idle',
        badge: 'READY',
        message: 'Select check-in and check-out dates to evaluate room availability.',
        explanation: 'The system validates date order and tests for overlapping reservation windows.',
      };
    }

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    // Date range validation
    if (outDate <= inDate) {
      return {
        status: 'invalid',
        badge: 'INVALID RANGE',
        message: 'Invalid date range.',
        explanation: 'Check-out date must be strictly after the check-in date.',
      };
    }

    // Room has no existing booking (e.g. Room 103)
    if (!selectedRoom.existingBooking) {
      return {
        status: 'available',
        badge: 'AVAILABLE',
        message: 'This room is available for the selected dates.',
        explanation: `${selectedRoom.name} (${selectedRoom.type}) has no conflicting bookings recorded in the system.`,
      };
    }

    const existIn = new Date(selectedRoom.existingBooking.checkIn);
    const existOut = new Date(selectedRoom.existingBooking.checkOut);

    // Overlap condition: startA < endB && endA > startB
    const hasOverlap = inDate < existOut && outDate > existIn;

    if (hasOverlap) {
      return {
        status: 'unavailable',
        badge: 'UNAVAILABLE',
        message: 'The selected dates overlap with an existing booking.',
        explanation: `Conflict: ${selectedRoom.name} is already reserved for ${selectedRoom.existingBooking.label}. Interval collision detected.`,
      };
    }

    return {
      status: 'available',
      badge: 'AVAILABLE',
      message: 'This room is available for the selected dates.',
      explanation: `Verified: The window ${checkIn} → ${checkOut} does not overlap with ${selectedRoom.name}'s existing schedule.`,
    };
  }, [checkIn, checkOut, selectedRoom]);

  const handleReset = () => {
    setSelectedRoomId('101');
    setCheckIn('');
    setCheckOut('');
  };

  return (
    <div className="hotel-playground" role="region" aria-label="Hotel Booking Interactive Playground">
      <div className="playground-panel">
        {/* Panel Header */}
        <div className="playground-panel__header">
          <div className="playground-panel__badge badge font-mono">
            <span className="playground-panel__badge-dot" aria-hidden="true" />
            <span>INTERACTIVE DEMONSTRATION</span>
          </div>
          <h2 className="playground-panel__title">Hotel Booking Demo</h2>
          <p className="playground-panel__desc">
            Demonstrate the room availability and overlap-protection logic represented in the hotel management project.
          </p>
        </div>

        {/* Form Controls */}
        <div className="hotel-playground__grid">
          {/* Left Column: Room and Date Selectors */}
          <div className="hotel-playground__inputs">
            {/* Room Selector */}
            <div className="playground-field">
              <label htmlFor="hotel-room-select" className="playground-field__label font-mono">
                ROOM SELECTION
              </label>
              <div className="hotel-room-pills" role="radiogroup" aria-label="Available Rooms">
                {HOTEL_DEMO_ROOMS.map((room) => {
                  const isChecked = room.id === selectedRoomId;
                  return (
                    <button
                      key={room.id}
                      type="button"
                      role="radio"
                      aria-checked={isChecked}
                      className={`hotel-room-pill ${isChecked ? 'hotel-room-pill--active' : ''}`}
                      onClick={() => setSelectedRoomId(room.id)}
                    >
                      <span className="hotel-room-pill__name">{room.name}</span>
                      <span className="hotel-room-pill__type font-mono">{room.type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Existing Demo Booking Status */}
            <div className="hotel-playground__existing-schedule">
              <span className="hotel-playground__existing-label font-mono">EXISTING DEMO SCHEDULE:</span>
              <p className="hotel-playground__existing-value">
                {selectedRoom.existingBooking ? (
                  <>
                    <strong className="text-primary">{selectedRoom.name}</strong> booked:{' '}
                    <span className="font-mono text-muted">{selectedRoom.existingBooking.label}</span>
                  </>
                ) : (
                  <>
                    <strong className="text-primary">{selectedRoom.name}</strong>:{' '}
                    <span className="font-mono text-muted">No existing bookings (Open calendar)</span>
                  </>
                )}
              </p>
            </div>

            {/* Date Inputs */}
            <div className="hotel-playground__date-row">
              <div className="playground-field">
                <label htmlFor="hotel-check-in" className="playground-field__label font-mono">
                  CHECK-IN DATE
                </label>
                <input
                  id="hotel-check-in"
                  type="date"
                  className="playground-input font-mono"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="playground-field">
                <label htmlFor="hotel-check-out" className="playground-field__label font-mono">
                  CHECK-OUT DATE
                </label>
                <input
                  id="hotel-check-out"
                  type="date"
                  className="playground-input font-mono"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Demo Test Presets */}
            <div className="hotel-playground__presets">
              <span className="hotel-playground__presets-label font-mono">TEST SCENARIOS:</span>
              <div className="hotel-playground__preset-btns">
                <button
                  type="button"
                  className="hotel-preset-btn"
                  onClick={() => {
                    setSelectedRoomId('101');
                    setCheckIn('2026-10-06');
                    setCheckOut('2026-10-08');
                  }}
                >
                  Test Overlap (Room 101)
                </button>
                <button
                  type="button"
                  className="hotel-preset-btn"
                  onClick={() => {
                    setSelectedRoomId('101');
                    setCheckIn('2026-10-15');
                    setCheckOut('2026-10-18');
                  }}
                >
                  Test Available (Room 101)
                </button>
                <button
                  type="button"
                  className="hotel-preset-btn"
                  onClick={() => {
                    setSelectedRoomId('101');
                    setCheckIn('2026-10-08');
                    setCheckOut('2026-10-05');
                  }}
                >
                  Test Invalid Range
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Availability Evaluation */}
          <div className="hotel-playground__results">
            <div
              className={`hotel-result-card hotel-result-card--${evaluation.status}`}
              aria-live="polite"
              role="status"
            >
              <div className="hotel-result-card__header">
                <span className={`hotel-result-badge hotel-result-badge--${evaluation.status} font-mono`}>
                  {evaluation.badge}
                </span>
                <span className="hotel-result-card__room-label font-mono">
                  {selectedRoom.name}
                </span>
              </div>

              <h3 className="hotel-result-card__headline">
                {evaluation.message}
              </h3>

              <p className="hotel-result-card__explanation">
                {evaluation.explanation}
              </p>

              <div className="hotel-result-card__note">
                <span className="hotel-result-card__note-icon font-mono" aria-hidden="true">ℹ</span>
                <span>Demonstration only: actual booking submission is disabled.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="playground-panel__actions">
              <button
                type="button"
                className="playground-btn playground-btn--secondary"
                onClick={handleReset}
              >
                Reset Demo
              </button>
              <Link
                to="/work/luxury-hotel-management"
                className="playground-btn playground-btn--link"
              >
                <span>View Full Project</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
