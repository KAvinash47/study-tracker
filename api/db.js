import pg from 'pg';

// Bypass self-signed SSL certificate check for cloud connection on Vercel
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { Pool } = pg;

// Initialize PostgreSQL pool with SSL enabled for cloud databases (Supabase/Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
