import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// 1. Pastikan URL ada
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

// 2. Konfigurasi Pool untuk Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // PENTING: Neon mewajibkan koneksi aman (SSL)
  ssl: true,
});

export const db = drizzle(pool);
