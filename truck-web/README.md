# FleetOps - Fleet Management Application

FleetOps is a comprehensive fleet management solution designed to track trucks, drivers, clients, trips, and expenses in real-time. This project features a robust backend built with **Express**, **TypeScript**, and **SQLite**.

## Features

- **Dashboard Statistics**: Instant overview of monthly revenue, profit, active trucks, and pending tasks.
- **Fleet Management**: CRUD operations for Trucks (plate numbers, models, maintenance) and Drivers.
- **Operations Tracking**: Manage Trips with details on origins, destinations, and costs.
- **Client Management**: Track client balances and contact information.
- **Expense Logging**: Record fuel, maintenance, and other operational costs.
- **Validation**: Strict runtime schema validation using **Zod**.
- **Type Safety**: Fully typed with **TypeScript**.

## Project Structure

```text
├── server/                 # Backend application
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.ts # SQLite initialization
│   │   │   ├── schema.ts   # Zod and Type definitions
│   │   │   └── seed.ts     # Initial data seeding
│   │   ├── index.ts        # Express application & API routes
│   │   └── index.test.ts   # Integration tests
│   ├── package.json
│   └── tsconfig.json
└── fleetops.sqlite         # SQLite database file
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)

### Backend Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Seed the database:**
   ```bash
   npm run seed
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   The server will be running at `http://localhost:3000`.

### Running Tests

To run the backend integration tests:
```bash
cd server
npm test
```

## API Endpoints

- **Dashboard Stats**: `GET /api/dashboard/stats`
- **Trucks**: `GET /api/trucks`, `POST /api/trucks`
- **Drivers**: `GET /api/drivers`, `POST /api/drivers`
- **Clients**: `GET /api/clients`, `POST /api/clients`
- **Trips**: `GET /api/trips`, `POST /api/trips`
- **Expenses**: `GET /api/expenses`, `POST /api/expenses`

## License

MIT
