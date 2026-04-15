import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../fleetops.sqlite');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

const SCHEMA_VERSION = 6;

// Schema migration: drop and recreate if version mismatch
let needsMigration = false;
try {
  const row = db.prepare('SELECT version FROM schema_version').get() as any;
  needsMigration = !row || row.version !== SCHEMA_VERSION;
} catch {
  needsMigration = true;
}

if (needsMigration) {
  db.exec(`
    PRAGMA foreign_keys = OFF;
    DROP TABLE IF EXISTS maintenance;
    DROP TABLE IF EXISTS payables;
    DROP TABLE IF EXISTS trips;
    DROP TABLE IF EXISTS client_payments;
    DROP TABLE IF EXISTS advances;
    DROP TABLE IF EXISTS clients;
    DROP TABLE IF EXISTS drivers;
    DROP TABLE IF EXISTS trucks;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS expenses;
    DROP TABLE IF EXISTS schema_version;
    PRAGMA foreign_keys = ON;
  `);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'user')) NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS trucks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    registration TEXT NOT NULL UNIQUE,
    make TEXT,
    model TEXT,
    mileage REAL NOT NULL DEFAULT 0,
    status TEXT CHECK(status IN ('active', 'inactive')) NOT NULL DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('driver', 'tanman')) NOT NULL DEFAULT 'driver',
    monthly_salary REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS advances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    notes TEXT,
    FOREIGN KEY (person_id) REFERENCES drivers(id)
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    balance REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS client_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    amount REAL NOT NULL,
    reference TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    truck_id INTEGER,
    driver_id INTEGER,
    tanman_id INTEGER,
    outbound_date TEXT NOT NULL,
    return_date TEXT,
    trip_pay REAL NOT NULL DEFAULT 0,
    outbound_destination TEXT NOT NULL,
    outbound_client_id INTEGER NOT NULL,
    outbound_load_amount REAL NOT NULL DEFAULT 0,
    outbound_tonnes REAL NOT NULL DEFAULT 0,
    outbound_container_number TEXT,
    outbound_mileage REAL NOT NULL DEFAULT 0,
    outbound_fuel_cost REAL NOT NULL DEFAULT 0,
    outbound_fuel_location TEXT,
    outbound_fuel_price_per_litre REAL,
    outbound_litres_purchased REAL,
    outbound_spare_parts TEXT,
    outbound_spare_parts_cost REAL,
    return_destination TEXT,
    return_client_id INTEGER,
    return_load_amount REAL DEFAULT 0,
    return_tonnes REAL DEFAULT 0,
    return_container_number TEXT,
    return_mileage REAL DEFAULT 0,
    return_fuel_cost REAL DEFAULT 0,
    return_fuel_location TEXT,
    return_fuel_price_per_litre REAL,
    return_litres_purchased REAL,
    return_spare_parts TEXT,
    return_spare_parts_cost REAL,
    FOREIGN KEY (truck_id) REFERENCES trucks(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id),
    FOREIGN KEY (tanman_id) REFERENCES drivers(id),
    FOREIGN KEY (outbound_client_id) REFERENCES clients(id)
  );

  CREATE TABLE IF NOT EXISTS payables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payee_name TEXT NOT NULL,
    amount REAL NOT NULL,
    date_taken TEXT NOT NULL,
    date_due TEXT NOT NULL,
    status TEXT CHECK(status IN ('paid', 'unpaid')) NOT NULL DEFAULT 'unpaid'
  );

  CREATE TABLE IF NOT EXISTS maintenance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    truck_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    service_type TEXT NOT NULL,
    mileage REAL NOT NULL DEFAULT 0,
    cost REAL,
    notes TEXT,
    FOREIGN KEY (truck_id) REFERENCES trucks(id)
  );
`);

if (needsMigration) {
  db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(SCHEMA_VERSION);
}

export default db;
