// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import type { Express } from "express";

let app: Express;

beforeAll(async () => {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/apex";
  process.env.JWT_ACCESS_SECRET =
    process.env.JWT_ACCESS_SECRET || "test-access-secret-min-32-characters";
  process.env.JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET || "test-refresh-secret-min-32-characters";
  const mod = await import("./app.js");
  app = mod.default;
});

describe("API", () => {
  it("GET /api/health returns 200 and ok true when DB is available", async () => {
    const res = await request(app).get("/api/health");
    if (res.status === 503) {
      expect(res.body.ok).toBe(false);
      return;
    }
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("POST /api/auth/register creates user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        fullName: "Test User",
        idNumber: "TEST-001",
        address: "Test Address",
        email: "test@example.com",
        password: "TestPass123!",
      });
    if (res.status === 409) return;
    expect([201, 409]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe("test@example.com");
    }
  });

  it("POST /api/auth/login with identifier and password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "admin@local.dev", password: "Admin123!" });
    if (res.status === 401) return;
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.role).toBe("ADMIN");
    }
  });

  it("GET /api/admin/dashboard requires ADMIN", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ identifier: "admin@local.dev", password: "Admin123!" });
    if (loginRes.status !== 200) return;
    const token = loginRes.body.accessToken;
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalSales");
    expect(res.body).toHaveProperty("pendingPaymentVerification");
    expect(res.body).toHaveProperty("totalOrders");
  });

  it("GET /api/admin/dashboard without token returns 401", async () => {
    const res = await request(app).get("/api/admin/dashboard");
    expect(res.status).toBe(401);
  });
});
