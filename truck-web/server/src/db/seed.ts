import db from './database';

const seed = () => {
  console.log('Seeding database...');

  // Trucks
  const truckInsert = db.prepare('INSERT INTO trucks (registration, model, status) VALUES (?, ?, ?)');
  truckInsert.run('KAA 123A', 'Mercedes Actros', 'active');
  truckInsert.run('KBB 456B', 'Scania R500', 'active');
  truckInsert.run('KCC 789C', 'Volvo FH16', 'active');

  // Drivers
  const driverInsert = db.prepare('INSERT INTO drivers (name, role, monthly_salary) VALUES (?, ?, ?)');
  driverInsert.run('John Doe', 'driver', 30000);
  driverInsert.run('Jane Smith', 'driver', 32000);
  driverInsert.run('Bob Wilson', 'tanman', 20000);

  // Clients
  const clientInsert = db.prepare('INSERT INTO clients (name, contact, email, balance) VALUES (?, ?, ?, ?)');
  clientInsert.run('Global Logistics', 'Sarah Miller', 'sarah@global.com', 5000);
  clientInsert.run('Quick Mart', 'James Kimani', 'james@quickmart.com', 2500);

  // Trips
  const tripInsert = db.prepare('INSERT INTO trips (truck_id, driver_id, outbound_date, outbound_destination, outbound_client_id, outbound_load_amount, outbound_mileage, trip_pay) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  tripInsert.run(1, 1, new Date().toISOString(), 'Mombasa', 1, 1200, 500, 400);
  tripInsert.run(2, 2, new Date().toISOString(), 'Nakuru', 2, 600, 200, 200);

  console.log('Seeding completed successfully!');
};

seed();
