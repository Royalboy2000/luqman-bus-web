import { api } from './api';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Truck {
  id: string;
  registration: string;
  make?: string;
  model?: string;
  mileage: number;
  status: 'active' | 'inactive';
}

export interface Driver {
  id: string;
  name: string;
  role: 'driver' | 'tanman';
  monthlySalary: number;
}

export interface Advance {
  id: string;
  personId: string;
  date: string;
  amount: number;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  balance: number;
}

export interface ClientPayment {
  id: string;
  clientId: string;
  date: string;
  amount: number;
  reference?: string;
}

export interface TripLeg {
  destination: string;
  clientId: string;
  loadAmount: number;
  tonnes: number;
  containerNumber?: string;
  mileage: number;
  fuelCost: number;
  fuelLocation?: string;
  fuelPricePerLitre?: number;
  litresPurchased?: number;
  spareParts?: string;
  sparePartsCost?: number;
}

export interface Trip {
  id: string;
  truckId: string;
  driverId: string;
  tanmanId?: string;
  outboundDate: string;
  returnDate?: string;
  outbound: TripLeg;
  returnLeg?: TripLeg;
  tripPay: number;
}

export interface Payable {
  id: string;
  payeeName: string;
  amount: number;
  dateTaken: string;
  dateDue: string;
  status: 'paid' | 'unpaid';
}

export interface MaintenanceEntry {
  id: string;
  truckId: string;
  date: string;
  serviceType: string;
  mileage: number;
  cost?: number;
  notes?: string;
}

// ── Trucks ─────────────────────────────────────────────────────────────────────

export const getTrucks = () => api.get<Truck[]>('/trucks');
export const saveTruck = (t: Omit<Truck, 'id'>) => api.post<Truck>('/trucks', t);
export const updateTruck = (id: string, data: Partial<Truck>) => api.put<Truck>(`/trucks/${id}`, data);
export const deleteTruck = (id: string) => api.delete(`/trucks/${id}`);

// ── Drivers ────────────────────────────────────────────────────────────────────

export const getDrivers = () => api.get<Driver[]>('/drivers');
export const saveDriver = (d: Omit<Driver, 'id'>) => api.post<Driver>('/drivers', d);
export const updateDriver = (id: string, data: Partial<Driver>) => api.put<Driver>(`/drivers/${id}`, data);
export const deleteDriver = (id: string) => api.delete(`/drivers/${id}`);

// ── Advances ───────────────────────────────────────────────────────────────────

export const getAdvances = () => api.get<Advance[]>('/advances');
export const saveAdvance = (a: Omit<Advance, 'id'>) => api.post<Advance>('/advances', a);

// ── Clients ────────────────────────────────────────────────────────────────────

export const getClients = () => api.get<Client[]>('/clients');
export const saveClient = (c: Omit<Client, 'id'>) => api.post<Client>('/clients', c);
export const updateClient = (id: string, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data);
export const deleteClient = (id: string) => api.delete(`/clients/${id}`);

// ── Client Payments ────────────────────────────────────────────────────────────

export const getClientPayments = () => api.get<ClientPayment[]>('/client-payments');
export const saveClientPayment = (p: Omit<ClientPayment, 'id'>) => api.post<ClientPayment>('/client-payments', p);

// ── Trips ──────────────────────────────────────────────────────────────────────

export const getTrips = () => api.get<Trip[]>('/trips');
export const saveTrip = (t: Omit<Trip, 'id'>) => api.post<Trip>('/trips', t);
export const updateTrip = (id: string, data: Partial<Trip>) => api.put<Trip>(`/trips/${id}`, data);

// ── Payables ───────────────────────────────────────────────────────────────────

export const getPayables = () => api.get<Payable[]>('/payables');
export const savePayable = (p: Omit<Payable, 'id'>) => api.post<Payable>('/payables', p);
export const updatePayable = (id: string, data: Partial<Payable>) => api.put<Payable>(`/payables/${id}`, data);

// ── Maintenance ────────────────────────────────────────────────────────────────

export const getMaintenanceEntries = () => api.get<MaintenanceEntry[]>('/maintenance');
export const saveMaintenanceEntry = (m: Omit<MaintenanceEntry, 'id'>) => api.post<MaintenanceEntry>('/maintenance', m);

// ── Trip calculations (pure, sync) ─────────────────────────────────────────────

export const calcTripRevenue = (t: Trip) =>
  Number(t.outbound.loadAmount || 0) + Number(t.returnLeg?.loadAmount || 0);

export const calcTripExpenses = (t: Trip) =>
  Number(t.outbound.fuelCost || 0) + Number(t.returnLeg?.fuelCost || 0) +
  Number(t.outbound.sparePartsCost || 0) + Number(t.returnLeg?.sparePartsCost || 0) +
  Number(t.tripPay || 0);

export const calcTripProfit = (t: Trip) =>
  calcTripRevenue(t) - calcTripExpenses(t);
