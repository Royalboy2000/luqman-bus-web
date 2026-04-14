import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import { ChildProcess, spawn } from 'child_process';
import path from 'path';

const BASE_URL = 'http://localhost:3000';
let serverProcess: ChildProcess;

describe('FleetOps API Integration Tests', () => {
  beforeAll(async () => {
    serverProcess = spawn('npx', ['ts-node', 'src/index.ts'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, PORT: '3000' },
      stdio: 'inherit'
    });

    // Wait for server to be ready
    let retries = 0;
    while (retries < 10) {
      try {
        await axios.get(`${BASE_URL}/api/trucks`);
        break;
      } catch (e) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }, 15000);

  afterAll(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  it('GET /api/dashboard/stats should return stats', async () => {
    const response = await axios.get(`${BASE_URL}/api/dashboard/stats`);
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('revenue');
    expect(response.data).toHaveProperty('profit');
    expect(response.data).toHaveProperty('quickStats');
  });

  it('GET /api/trucks should return a list of trucks', async () => {
    const response = await axios.get(`${BASE_URL}/api/trucks`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it('POST /api/trucks should create a new truck', async () => {
    const randomReg = `KDD ${Math.floor(Math.random() * 1000)}D`;
    const newTruck = {
      registration: randomReg,
      model: 'Isuzu FSR',
      status: 'active'
    };
    const response = await axios.post(`${BASE_URL}/api/trucks`, newTruck);
    expect(response.status).toBe(201);
    expect(response.data.registration).toBe(newTruck.registration);
    expect(response.data).toHaveProperty('id');
  });

  it('GET /api/drivers should return a list of drivers', async () => {
    const response = await axios.get(`${BASE_URL}/api/drivers`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });
});
