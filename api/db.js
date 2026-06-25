import pg from 'pg';

const { Pool } = pg;

// Initialize PostgreSQL pool with SSL enabled for cloud databases (Supabase/Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
