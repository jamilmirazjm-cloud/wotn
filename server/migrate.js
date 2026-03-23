require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const fs = require('fs');
const path = require('path');
const db = require('./db');

async function migrate() {
  try {
    const sqlPath = path.join(__dirname, '..', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running Supabase PostgreSQL migrations...');
    await db.query(sql);
    console.log('Migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
