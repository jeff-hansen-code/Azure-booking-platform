import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/appointmentService';
import type { Appointment } from '../types/appointment';
import './Schedule.css';

export function Schedule() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return {
      from: today.toISOString().split('T')[0],
      to: nextWeek.toISOString().split('T')[0],
    };
  });

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAppointments(dateRange.from, dateRange.to);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [dateRange.from, dateRange.to]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const formatDateTime = (utcString: string) => {
    const date = new Date(utcString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="schedule">
      <div className="container">
        <h1>Appointment Schedule</h1>
        
        <div className="date-range-selector">
          <label>
            From:
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            />
          </label>
          <label>
            To:
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            />
          </label>
          <button onClick={loadAppointments}>Refresh</button>
        </div>

        {loading && <p className="loading">Loading appointments...</p>}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadAppointments}>Retry</button>
          </div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <p className="no-appointments">No appointments scheduled for this period.</p>
        )}

        {!loading && !error && appointments.length > 0 && (
          <div className="appointments-list">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <h3>{appointment.customerName}</h3>
                  <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="appointment-details">
                  <p><strong>Service:</strong> {appointment.serviceType}</p>
                  <p><strong>Start:</strong> {formatDateTime(appointment.startUtc)}</p>
                  <p><strong>End:</strong> {formatDateTime(appointment.endUtc)}</p>
                  <p><strong>Contact:</strong> {appointment.email} | {appointment.phone}</p>
                  {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
