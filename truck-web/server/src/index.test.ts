import { describe, it, expect } from 'vitest';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

describe('FleetOps API Integration Tests', () => {
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
    const randomPlate = `KDD ${Math.floor(Math.random() * 1000)}D`;
    const newTruck = {
      plate_number: randomPlate,
      model: 'Isuzu FSR',
      status: 'active'
    };
    const response = await axios.post(`${BASE_URL}/api/trucks`, newTruck);
    expect(response.status).toBe(201);
    expect(response.data.plate_number).toBe(newTruck.plate_number);
    expect(response.data).toHaveProperty('id');
  });

  it('GET /api/drivers should return a list of drivers', async () => {
    const response = await axios.get(`${BASE_URL}/api/drivers`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });
});
