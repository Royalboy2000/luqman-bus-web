import db from './database';

const seed = () => {
  console.log('Seeding database...');

  // Trucks
  const truckInsert = db.prepare('INSERT INTO trucks (plate_number, model, status) VALUES (?, ?, ?)');
  truckInsert.run('KAA 123A', 'Mercedes Actros', 'active');
  truckInsert.run('KBB 456B', 'Scania R500', 'active');
  truckInsert.run('KCC 789C', 'Volvo FH16', 'maintenance');

  // Drivers
  const driverInsert = db.prepare('INSERT INTO drivers (name, license_number, phone, status) VALUES (?, ?, ?, ?)');
  driverInsert.run('John Doe', 'L12345678', '0711111111', 'on_trip');
  driverInsert.run('Jane Smith', 'L87654321', '0722222222', 'available');
  driverInsert.run('Bob Wilson', 'L11223344', '0733333333', 'off_duty');

  // Clients
  const clientInsert = db.prepare('INSERT INTO clients (name, contact_person, phone, email, balance) VALUES (?, ?, ?, ?, ?)');
  clientInsert.run('Global Logistics', 'Sarah Miller', '0744444444', 'sarah@global.com', 5000);
  clientInsert.run('Quick Mart', 'James Kimani', '0755555555', 'james@quickmart.com', 2500);

  // Trips
  const tripInsert = db.prepare('INSERT INTO trips (truck_id, driver_id, client_id, start_date, origin, destination, revenue, cost, profit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  tripInsert.run(1, 1, 1, new Date().toISOString(), 'Nairobi', 'Mombasa', 1200, 800, 400, 'completed');
  tripInsert.run(2, 2, 2, new Date().toISOString(), 'Nairobi', 'Nakuru', 600, 400, 200, 'completed');

  // Expenses
  const expenseInsert = db.prepare('INSERT INTO expenses (trip_id, type, amount, date, description) VALUES (?, ?, ?, ?, ?)');
  expenseInsert.run(1, 'fuel', 500, new Date().toISOString(), 'Fuel for Mombasa trip');
  expenseInsert.run(1, 'toll', 50, new Date().toISOString(), 'Toll fees');

  console.log('Seeding completed successfully!');
};

seed();
