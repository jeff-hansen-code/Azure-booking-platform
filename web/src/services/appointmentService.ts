import { config } from './config';
import type { Appointment, CreateAppointmentRequest, CreateAppointmentResponse } from '../types/appointment';

const API_BASE = `${config.apiBaseUrl}/api/v1`;

export const appointmentService = {
  async getAppointments(from: string, to: string): Promise<Appointment[]> {
    const response = await fetch(`${API_BASE}/appointments?from=${from}&to=${to}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch appointments: ${response.statusText}`);
    }
    return response.json();
  },

  async createAppointment(request: CreateAppointmentRequest): Promise<CreateAppointmentResponse> {
    const response = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Failed to create appointment: ${response.statusText}`);
    }
    return response.json();
  },
};
