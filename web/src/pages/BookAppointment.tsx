import { useState } from 'react';
import type { FormEvent } from 'react';
import { appointmentService } from '../services/appointmentService';
import type { CreateAppointmentRequest } from '../types/appointment';
import './BookAppointment.css';

export function BookAppointment() {
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    customerName: '',
    email: '',
    phone: '',
    serviceType: '',
    startUtc: '',
    endUtc: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Calculate endUtc based on service type (2 hours for standard, 4 for deep, 6 for move-out)
      const startDate = new Date(formData.startUtc);
      const durationHours = formData.serviceType === 'Standard Cleaning' ? 2 :
                           formData.serviceType === 'Deep Clean' ? 4 : 6;
      const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
      
      const request = {
        ...formData,
        endUtc: endDate.toISOString(),
      };

      await appointmentService.createAppointment(request);
      setSuccess(true);
      // Reset form
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        serviceType: '',
        startUtc: '',
        endUtc: '',
        notes: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="book-appointment">
      <div className="container">
        <h1>Book an Appointment</h1>
        
        {success && (
          <div className="success-message">
            <h3>✓ Appointment Booked Successfully!</h3>
            <p>We'll contact you shortly to confirm your appointment.</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="customerName">Name *</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="serviceType">Service Type *</label>
            <select
              id="serviceType"
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
            >
              <option value="">Select a service...</option>
              <option value="Standard Cleaning">Standard Cleaning (2 hours)</option>
              <option value="Deep Clean">Deep Clean (4 hours)</option>
              <option value="Move-Out Cleaning">Move-Out Cleaning (6 hours)</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startUtc">Date & Time *</label>
            <input
              type="datetime-local"
              id="startUtc"
              name="startUtc"
              value={formData.startUtc}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any special requests or instructions..."
            />
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Booking...' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}
