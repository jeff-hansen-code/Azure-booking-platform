export interface Appointment {
  id: string;
  partitionKey: string;
  rowKey: string;
  startUtc: string;
  endUtc: string;
  customerName: string;
  email: string;
  phone: string;
  serviceType: string;
  notes?: string;
  status: string;
  createdUtc: string;
}

export interface CreateAppointmentRequest {
  customerName: string;
  email: string;
  phone: string;
  serviceType: string;
  startUtc: string;
  endUtc: string;
  notes?: string;
}

export interface CreateAppointmentResponse {
  id: string;
  message: string;
}
