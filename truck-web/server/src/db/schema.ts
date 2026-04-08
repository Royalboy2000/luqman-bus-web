import { z } from 'zod';

export const TruckSchema = z.object({
  registration: z.string().min(1),
  make: z.string().optional(),
  model: z.string().optional(),
  mileage: z.number().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const DriverSchema = z.object({
  name: z.string().min(1),
  role: z.enum(['driver', 'tanman']).default('driver'),
  monthlySalary: z.number().default(0),
});

export const AdvanceSchema = z.object({
  personId: z.string().min(1),
  date: z.string().min(1),
  amount: z.number(),
  notes: z.string().optional(),
});

export const ClientSchema = z.object({
  name: z.string().min(1),
  contact: z.string().optional(),
  email: z.string().optional(),
  balance: z.number().default(0),
});

export const ClientPaymentSchema = z.object({
  clientId: z.string().min(1),
  date: z.string().min(1),
  amount: z.number(),
  reference: z.string().optional(),
});

const TripLegSchema = z.object({
  destination: z.string().min(1),
  clientId: z.string().min(1),
  loadAmount: z.number().default(0),
  tonnes: z.number().default(0),
  containerNumber: z.string().optional(),
  mileage: z.number().default(0),
  fuelCost: z.number().default(0),
  fuelLocation: z.string().optional(),
  fuelPricePerLitre: z.number().optional(),
  litresPurchased: z.number().optional(),
  spareParts: z.string().optional(),
  sparePartsCost: z.number().optional(),
});

export const TripSchema = z.object({
  truckId: z.string().min(1),
  driverId: z.string().min(1),
  tanmanId: z.string().optional(),
  outboundDate: z.string().min(1),
  returnDate: z.string().optional(),
  tripPay: z.number().default(0),
  outbound: TripLegSchema,
  returnLeg: TripLegSchema.optional(),
});

export const PayableSchema = z.object({
  payeeName: z.string().min(1),
  amount: z.number(),
  dateTaken: z.string().min(1),
  dateDue: z.string().min(1),
  status: z.enum(['paid', 'unpaid']).default('unpaid'),
});

export const MaintenanceSchema = z.object({
  truckId: z.string().min(1),
  date: z.string().min(1),
  serviceType: z.string().min(1),
  mileage: z.number().default(0),
  cost: z.number().optional(),
  notes: z.string().optional(),
});
