import express from 'express';
import cors from 'cors';
import db from './db/database';
import {
  TruckSchema, DriverSchema, AdvanceSchema, ClientSchema, ClientPaymentSchema,
  TripSchema, PayableSchema, MaintenanceSchema,
} from './db/schema';

const app = express();
const port = process.env.PORT || 3000;
import path from 'path';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../dist')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// ── Row mappers ────────────────────────────────────────────────────────────────

function rowToTruck(r: any) {
  return { id: String(r.id), registration: r.registration, make: r.make || undefined, model: r.model || undefined, mileage: r.mileage, status: r.status };
}

function rowToDriver(r: any) {
  return { id: String(r.id), name: r.name, role: r.role, monthlySalary: r.monthly_salary };
}

function rowToAdvance(r: any) {
  return { id: String(r.id), personId: String(r.person_id), date: r.date, amount: r.amount, notes: r.notes || undefined };
}

function rowToClient(r: any) {
  return { id: String(r.id), name: r.name, contact: r.contact || undefined, email: r.email || undefined, balance: r.balance };
}

function rowToClientPayment(r: any) {
  return { id: String(r.id), clientId: String(r.client_id), date: r.date, amount: r.amount, reference: r.reference || undefined };
}

function rowToTrip(r: any) {
  return {
    id: String(r.id),
    truckId: String(r.truck_id),
    driverId: String(r.driver_id),
    tanmanId: String(r.tanman_id),
    outboundDate: r.outbound_date,
    returnDate: r.return_date || undefined,
    tripPay: r.trip_pay,
    outbound: {
      destination: r.outbound_destination,
      clientId: String(r.outbound_client_id),
      loadAmount: r.outbound_load_amount,
      tonnes: r.outbound_tonnes,
      containerNumber: r.outbound_container_number || undefined,
      mileage: r.outbound_mileage,
      fuelCost: r.outbound_fuel_cost,
      fuelLocation: r.outbound_fuel_location || undefined,
      fuelPricePerLitre: r.outbound_fuel_price_per_litre ?? undefined,
      litresPurchased: r.outbound_litres_purchased ?? undefined,
      spareParts: r.outbound_spare_parts || undefined,
      sparePartsCost: r.outbound_spare_parts_cost ?? undefined,
    },
    returnLeg: r.return_destination ? {
      destination: r.return_destination,
      clientId: String(r.return_client_id),
      loadAmount: r.return_load_amount || 0,
      tonnes: r.return_tonnes || 0,
      containerNumber: r.return_container_number || undefined,
      mileage: r.return_mileage || 0,
      fuelCost: r.return_fuel_cost || 0,
      fuelLocation: r.return_fuel_location || undefined,
      fuelPricePerLitre: r.return_fuel_price_per_litre ?? undefined,
      litresPurchased: r.return_litres_purchased ?? undefined,
      spareParts: r.return_spare_parts || undefined,
      sparePartsCost: r.return_spare_parts_cost ?? undefined,
    } : undefined,
  };
}

function rowToPayable(r: any) {
  return { id: String(r.id), payeeName: r.payee_name, amount: r.amount, dateTaken: r.date_taken, dateDue: r.date_due, status: r.status };
}

function rowToMaintenance(r: any) {
  return { id: String(r.id), truckId: String(r.truck_id), date: r.date, serviceType: r.service_type, mileage: r.mileage, cost: r.cost ?? undefined, notes: r.notes || undefined };
}

// ── Trucks ─────────────────────────────────────────────────────────────────────

app.get('/api/trucks', (_req, res) => {
  res.json(db.prepare('SELECT * FROM trucks ORDER BY registration').all().map(rowToTruck));
});

app.post('/api/trucks', (req, res) => {
  try {
    const d = TruckSchema.parse(req.body);
    const r = db.prepare('INSERT INTO trucks (registration, make, model, mileage, status) VALUES (?, ?, ?, ?, ?)').run(d.registration, d.make ?? null, d.model ?? null, d.mileage, d.status);
    res.status(201).json(rowToTruck({ id: r.lastInsertRowid, ...d, make: d.make ?? null, model: d.model ?? null }));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

app.put('/api/trucks/:id', (req, res) => {
  try {
    const d = TruckSchema.partial().parse(req.body);
    const current = db.prepare('SELECT * FROM trucks WHERE id = ?').get(req.params.id) as any;
    if (!current) return res.status(404).json({ error: 'Not found' });
    const merged = { ...current, ...d };
    db.prepare('UPDATE trucks SET registration=?, make=?, model=?, mileage=?, status=? WHERE id=?').run(merged.registration, merged.make ?? null, merged.model ?? null, merged.mileage, merged.status, req.params.id);
    res.json(rowToTruck(db.prepare('SELECT * FROM trucks WHERE id=?').get(req.params.id)));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/trucks/:id', (req, res) => {
  try {
    db.transaction(() => {
      db.prepare('DELETE FROM maintenance WHERE truck_id=?').run(req.params.id);
      db.prepare('DELETE FROM trips WHERE truck_id=?').run(req.params.id);
      db.prepare('DELETE FROM trucks WHERE id=?').run(req.params.id);
    })();
    res.status(204).end();
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Drivers ────────────────────────────────────────────────────────────────────

app.get('/api/drivers', (_req, res) => {
  res.json(db.prepare('SELECT * FROM drivers ORDER BY name').all().map(rowToDriver));
});

app.post('/api/drivers', (req, res) => {
  try {
    const d = DriverSchema.parse(req.body);
    const r = db.prepare('INSERT INTO drivers (name, role, monthly_salary) VALUES (?, ?, ?)').run(d.name, d.role, d.monthlySalary);
    res.status(201).json(rowToDriver({ id: r.lastInsertRowid, name: d.name, role: d.role, monthly_salary: d.monthlySalary }));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

app.put('/api/drivers/:id', (req, res) => {
  try {
    const d = DriverSchema.partial().parse(req.body);
    const current = db.prepare('SELECT * FROM drivers WHERE id=?').get(req.params.id) as any;
    if (!current) return res.status(404).json({ error: 'Not found' });
    db.prepare('UPDATE drivers SET name=?, role=?, monthly_salary=? WHERE id=?').run(
      d.name ?? current.name, d.role ?? current.role, d.monthlySalary ?? current.monthly_salary, req.params.id
    );
    res.json(rowToDriver(db.prepare('SELECT * FROM drivers WHERE id=?').get(req.params.id)));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/drivers/:id', (req, res) => {
  try {
    db.transaction(() => {
      db.prepare('DELETE FROM advances WHERE person_id=?').run(req.params.id);
      db.prepare('UPDATE trips SET driver_id=NULL WHERE driver_id=?').run(req.params.id);
      db.prepare('UPDATE trips SET tanman_id=NULL WHERE tanman_id=?').run(req.params.id);
      db.prepare('DELETE FROM drivers WHERE id=?').run(req.params.id);
    })();
    res.status(204).end();
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Advances ───────────────────────────────────────────────────────────────────

app.get('/api/advances', (_req, res) => {
  res.json(db.prepare('SELECT * FROM advances ORDER BY date DESC').all().map(rowToAdvance));
});

app.post('/api/advances', (req, res) => {
  try {
    const d = AdvanceSchema.parse(req.body);
    const r = db.prepare('INSERT INTO advances (person_id, date, amount, notes) VALUES (?, ?, ?, ?)').run(Number(d.personId), d.date, d.amount, d.notes ?? null);
    res.status(201).json(rowToAdvance({ id: r.lastInsertRowid, person_id: d.personId, date: d.date, amount: d.amount, notes: d.notes ?? null }));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// ── Clients ────────────────────────────────────────────────────────────────────

app.get('/api/clients', (_req, res) => {
  res.json(db.prepare('SELECT * FROM clients ORDER BY name').all().map(rowToClient));
});

app.post('/api/clients', (req, res) => {
  try {
    const d = ClientSchema.parse(req.body);
    const r = db.prepare('INSERT INTO clients (name, contact, email, balance) VALUES (?, ?, ?, ?)').run(d.name, d.contact ?? null, d.email ?? null, d.balance);
    res.status(201).json(rowToClient({ id: r.lastInsertRowid, name: d.name, contact: d.contact ?? null, email: d.email ?? null, balance: d.balance }));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

app.put('/api/clients/:id', (req, res) => {
  try {
    const d = ClientSchema.partial().parse(req.body);
    const current = db.prepare('SELECT * FROM clients WHERE id=?').get(req.params.id) as any;
    if (!current) return res.status(404).json({ error: 'Not found' });
    db.prepare('UPDATE clients SET name=?, contact=?, email=?, balance=? WHERE id=?').run(
      d.name ?? current.name, d.contact ?? current.contact, d.email ?? current.email, d.balance ?? current.balance, req.params.id
    );
    res.json(rowToClient(db.prepare('SELECT * FROM clients WHERE id=?').get(req.params.id)));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

app.delete('/api/clients/:id', (req, res) => {
  try {
    db.transaction(() => {
      db.prepare('DELETE FROM client_payments WHERE client_id=?').run(req.params.id);
      db.prepare('DELETE FROM trips WHERE outbound_client_id=?').run(req.params.id);
      db.prepare('DELETE FROM clients WHERE id=?').run(req.params.id);
    })();
    res.status(204).end();
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ── Client Payments ────────────────────────────────────────────────────────────

app.get('/api/client-payments', (_req, res) => {
  res.json(db.prepare('SELECT * FROM client_payments ORDER BY date DESC').all().map(rowToClientPayment));
});

app.post('/api/client-payments', (req, res) => {
  try {
    const d = ClientPaymentSchema.parse(req.body);
    const savePayment = db.transaction(() => {
      const r = db.prepare('INSERT INTO client_payments (client_id, date, amount, reference) VALUES (?, ?, ?, ?)').run(Number(d.clientId), d.date, d.amount, d.reference ?? null);
      // Decrease client balance
      db.prepare('UPDATE clients SET balance = balance - ? WHERE id=?').run(d.amount, Number(d.clientId));
      return r;
    });
    const r = savePayment();
    res.status(201).json(rowToClientPayment({ id: r.lastInsertRowid, client_id: d.clientId, date: d.date, amount: d.amount, reference: d.reference ?? null }));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// ── Trips ──────────────────────────────────────────────────────────────────────

app.get('/api/trips', (_req, res) => {
  res.json(db.prepare('SELECT * FROM trips ORDER BY outbound_date DESC').all().map(rowToTrip));
});

app.post('/api/trips', (req, res) => {
  try {
    const d = TripSchema.parse(req.body);
    const saveTrip = db.transaction(() => {
      const r = db.prepare(`
        INSERT INTO trips (
          truck_id, driver_id, tanman_id, outbound_date, return_date, trip_pay,
          outbound_destination, outbound_client_id, outbound_load_amount, outbound_tonnes,
          outbound_container_number, outbound_mileage, outbound_fuel_cost, outbound_fuel_location,
          outbound_fuel_price_per_litre, outbound_litres_purchased, outbound_spare_parts, outbound_spare_parts_cost,
          return_destination, return_client_id, return_load_amount, return_tonnes,
          return_container_number, return_mileage, return_fuel_cost, return_fuel_location,
          return_fuel_price_per_litre, return_litres_purchased, return_spare_parts, return_spare_parts_cost
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        Number(d.truckId), Number(d.driverId), d.tanmanId ? Number(d.tanmanId) : null, d.outboundDate, d.returnDate ?? null, d.tripPay,
        d.outbound.destination, Number(d.outbound.clientId), d.outbound.loadAmount, d.outbound.tonnes,
        d.outbound.containerNumber ?? null, d.outbound.mileage, d.outbound.fuelCost, d.outbound.fuelLocation ?? null,
        d.outbound.fuelPricePerLitre ?? null, d.outbound.litresPurchased ?? null, d.outbound.spareParts ?? null, d.outbound.sparePartsCost ?? null,
        d.returnLeg?.destination ?? null, d.returnLeg ? Number(d.returnLeg.clientId) : null,
        d.returnLeg?.loadAmount ?? null, d.returnLeg?.tonnes ?? null,
        d.returnLeg?.containerNumber ?? null, d.returnLeg?.mileage ?? null, d.returnLeg?.fuelCost ?? null, d.returnLeg?.fuelLocation ?? null,
        d.returnLeg?.fuelPricePerLitre ?? null, d.returnLeg?.litresPurchased ?? null, d.returnLeg?.spareParts ?? null, d.returnLeg?.sparePartsCost ?? null
      );

      // Update outbound client balance
      db.prepare('UPDATE clients SET balance = balance + ? WHERE id=?').run(d.outbound.loadAmount, Number(d.outbound.clientId));

      // Update return client balance
      if (d.returnLeg) {
        db.prepare('UPDATE clients SET balance = balance + ? WHERE id=?').run(d.returnLeg.loadAmount, Number(d.returnLeg.clientId));
      }

      // Update truck mileage
      const totalMileage = d.outbound.mileage + (d.returnLeg?.mileage || 0);
      db.prepare('UPDATE trucks SET mileage = mileage + ? WHERE id=?').run(totalMileage, Number(d.truckId));

      return r;
    });

    const r = saveTrip();
    const saved = db.prepare('SELECT * FROM trips WHERE id=?').get(r.lastInsertRowid);
    res.status(201).json(rowToTrip(saved));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

app.put('/api/trips/:id', (req, res) => {
  try {
    const d = TripSchema.partial().parse(req.body);
    const current = db.prepare('SELECT * FROM trips WHERE id=?').get(req.params.id) as any;
    if (!current) return res.status(404).json({ error: 'Not found' });
    // Merge and update (simple field update, no side-effect recalculation)
    db.prepare(`
      UPDATE trips SET
        truck_id=?, driver_id=?, tanman_id=?, outbound_date=?, return_date=?, trip_pay=?,
        outbound_destination=?, outbound_client_id=?, outbound_load_amount=?, outbound_tonnes=?,
        outbound_container_number=?, outbound_mileage=?, outbound_fuel_cost=?, outbound_fuel_location=?,
        outbound_fuel_price_per_litre=?, outbound_litres_purchased=?, outbound_spare_parts=?, outbound_spare_parts_cost=?,
        return_destination=?, return_client_id=?, return_load_amount=?, return_tonnes=?,
        return_container_number=?, return_mileage=?, return_fuel_cost=?, return_fuel_location=?,
        return_fuel_price_per_litre=?, return_litres_purchased=?, return_spare_parts=?, return_spare_parts_cost=?
      WHERE id=?
    `).run(
      Number(d.truckId ?? current.truck_id),
      Number(d.driverId ?? current.driver_id),
      d.tanmanId !== undefined ? (d.tanmanId ? Number(d.tanmanId) : null) : current.tanman_id,
      d.outboundDate ?? current.outbound_date,
      d.returnDate ?? current.return_date,
      d.tripPay ?? current.trip_pay,
      d.outbound?.destination ?? current.outbound_destination,
      Number(d.outbound?.clientId ?? current.outbound_client_id),
      d.outbound?.loadAmount ?? current.outbound_load_amount,
      d.outbound?.tonnes ?? current.outbound_tonnes,
      d.outbound?.containerNumber ?? current.outbound_container_number,
      d.outbound?.mileage ?? current.outbound_mileage,
      d.outbound?.fuelCost ?? current.outbound_fuel_cost,
      d.outbound?.fuelLocation ?? current.outbound_fuel_location,
      d.outbound?.fuelPricePerLitre ?? current.outbound_fuel_price_per_litre,
      d.outbound?.litresPurchased ?? current.outbound_litres_purchased,
      d.outbound?.spareParts ?? current.outbound_spare_parts,
      d.outbound?.sparePartsCost ?? current.outbound_spare_parts_cost,
      d.returnLeg?.destination ?? current.return_destination,
      d.returnLeg ? Number(d.returnLeg.clientId) : current.return_client_id,
      d.returnLeg?.loadAmount ?? current.return_load_amount,
      d.returnLeg?.tonnes ?? current.return_tonnes,
      d.returnLeg?.containerNumber ?? current.return_container_number,
      d.returnLeg?.mileage ?? current.return_mileage,
      d.returnLeg?.fuelCost ?? current.return_fuel_cost,
      d.returnLeg?.fuelLocation ?? current.return_fuel_location,
      d.returnLeg?.fuelPricePerLitre ?? current.return_fuel_price_per_litre,
      d.returnLeg?.litresPurchased ?? current.return_litres_purchased,
      d.returnLeg?.spareParts ?? current.return_spare_parts,
      d.returnLeg?.sparePartsCost ?? current.return_spare_parts_cost,
      req.params.id
    );
    res.json(rowToTrip(db.prepare('SELECT * FROM trips WHERE id=?').get(req.params.id)));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// ── Payables ───────────────────────────────────────────────────────────────────

app.get('/api/payables', (_req, res) => {
  res.json(db.prepare('SELECT * FROM payables ORDER BY date_taken DESC').all().map(rowToPayable));
});

app.post('/api/payables', (req, res) => {
  try {
    const d = PayableSchema.parse(req.body);
    const r = db.prepare('INSERT INTO payables (payee_name, amount, date_taken, date_due, status) VALUES (?, ?, ?, ?, ?)').run(d.payeeName, d.amount, d.dateTaken, d.dateDue, d.status);
    res.status(201).json(rowToPayable({ id: r.lastInsertRowid, payee_name: d.payeeName, amount: d.amount, date_taken: d.dateTaken, date_due: d.dateDue, status: d.status }));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

app.put('/api/payables/:id', (req, res) => {
  try {
    const d = PayableSchema.partial().parse(req.body);
    const current = db.prepare('SELECT * FROM payables WHERE id=?').get(req.params.id) as any;
    if (!current) return res.status(404).json({ error: 'Not found' });
    db.prepare('UPDATE payables SET payee_name=?, amount=?, date_taken=?, date_due=?, status=? WHERE id=?').run(
      d.payeeName ?? current.payee_name, d.amount ?? current.amount, d.dateTaken ?? current.date_taken, d.dateDue ?? current.date_due, d.status ?? current.status, req.params.id
    );
    res.json(rowToPayable(db.prepare('SELECT * FROM payables WHERE id=?').get(req.params.id)));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// ── Maintenance ────────────────────────────────────────────────────────────────

app.get('/api/maintenance', (_req, res) => {
  res.json(db.prepare('SELECT * FROM maintenance ORDER BY date DESC').all().map(rowToMaintenance));
});

app.post('/api/maintenance', (req, res) => {
  try {
    const d = MaintenanceSchema.parse(req.body);
    const r = db.prepare('INSERT INTO maintenance (truck_id, date, service_type, mileage, cost, notes) VALUES (?, ?, ?, ?, ?, ?)').run(Number(d.truckId), d.date, d.serviceType, d.mileage, d.cost ?? null, d.notes ?? null);
    res.status(201).json(rowToMaintenance({ id: r.lastInsertRowid, truck_id: d.truckId, date: d.date, service_type: d.serviceType, mileage: d.mileage, cost: d.cost ?? null, notes: d.notes ?? null }));
  } catch (e: any) { res.status(400).json({ error: e.message }); }
});

// ── Dashboard Stats ────────────────────────────────────────────────────────────

app.get('/api/dashboard/stats', (_req, res) => {
  try {
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const monthTrips = db.prepare(`SELECT * FROM trips WHERE outbound_date >= ?`).all(monthStart).map(rowToTrip);

    const monthlyRevenue = monthTrips.reduce((s, t) => s + (t.outbound.loadAmount || 0) + (t.returnLeg?.loadAmount || 0), 0);
    const monthlyExpenses = monthTrips.reduce((s, t) =>
      s + (t.outbound.fuelCost || 0) + (t.returnLeg?.fuelCost || 0) +
      (t.outbound.sparePartsCost || 0) + (t.returnLeg?.sparePartsCost || 0) + (t.tripPay || 0), 0);
    const monthlyProfit = monthlyRevenue - monthlyExpenses;

    const clientBalances = (db.prepare('SELECT SUM(balance) as total FROM clients').get() as any).total || 0;
    const unpaidPayables = (db.prepare("SELECT SUM(amount) as total FROM payables WHERE status='unpaid'").get() as any).total || 0;

    const activeTrucks = (db.prepare("SELECT COUNT(*) as count FROM trucks WHERE status='active'").get() as any).count || 0;
    const totalClients = (db.prepare('SELECT COUNT(*) as count FROM clients').get() as any).count || 0;
    const unpaidCount = (db.prepare("SELECT COUNT(*) as count FROM payables WHERE status='unpaid'").get() as any).count || 0;

    res.json({
      revenue: monthlyRevenue,
      profit: monthlyProfit,
      balances: clientBalances,
      payables: unpaidPayables,
      quickStats: {
        activeTrucks,
        totalTrips: monthTrips.length,
        activeClients: totalClients,
        unpaidPayables: unpaidCount,
      },
    });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.listen(port, () => {
  console.log(`FleetOps API running on port ${port}`);
});

export default app;
