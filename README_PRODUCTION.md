# FleetOps Production Deployment Guide

FleetOps is a comprehensive fleet management application with a React/TypeScript frontend and a Node.js/SQLite backend.

## Prerequisites

- **Node.js**: v18 or higher
- **NPM**: v9 or higher
- **Python**: v3.8 or higher (for the automation script)

## Automatic Setup & Launch

The easiest way to run the application is using the provided orchestrator script. This script handles dependency installation, database initialization (if needed), building the frontend, and serving the entire application.

When you run the script, it will ask you which port you wish to use.

```bash
python3 run_fleetops.py
```

The application will then be available at the specified port.

## Manual Setup

### 1. Build Frontend

```bash
cd truck-web
npm install
npm run build
```

### 2. Setup & Start Backend

```bash
cd truck-web/server
npm install
npm run seed     # Only if first time
PORT=3000 npm run start
```

The backend is configured to serve the frontend static files from the `truck-web/dist` directory and handles SPA routing.

## Troubleshooting

- **Database Errors**: If you encounter schema errors, delete the `truck-web/server/fleetops.sqlite` file and run `npm run seed` again.
- **Port Conflicts**: Ensure the port you select is free before starting.
