#!/usr/bin/env node

/**
 * Database Migration Runner
 * Automatically runs pending SQL migrations
 * Usage: node database/migrate.js
 */

const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function createMigrationsTable() {
  const [tables] = await pool.execute(
    "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = 'migrations' AND TABLE_SCHEMA = ?"
  , [process.env.DB_NAME || 'zpk']);

  if (tables.length === 0) {
    console.log('📋 Creating migrations table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      )
    `);
    console.log('✓ Migrations table created');
  }
}

async function getExecutedMigrations() {
  const [rows] = await pool.execute('SELECT name FROM migrations ORDER BY name');
  return rows.map(r => r.name);
}

async function getPendingMigrations() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const executed = await getExecutedMigrations();
  return files.filter(f => !executed.includes(f));
}

async function runMigration(filename) {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  console.log(`\n🔄 Running: ${filename}`);

  const sql = fs.readFileSync(filepath, 'utf8');
  // Strip single-line comments before splitting to avoid false splits on semicolons inside comments
  const cleaned = sql.replace(/--[^\n]*/g, '');
  const statements = cleaned.split(';').filter(s => s.trim());

  let count = 0;
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await pool.execute(statement);
        count++;
      } catch (err) {
        // Ignore "already exists" and similar errors
        if (!err.message.includes('already exists') &&
            !err.message.includes('Duplicate') &&
            !err.message.includes('already have this field')) {
          throw err;
        }
      }
    }
  }

  // Record migration
  await pool.execute('INSERT INTO migrations (name) VALUES (?)', [filename]);
  console.log(`✓ ${filename} executed (${count} statements)`);
}

async function migrate() {
  try {
    console.log('🚀 Starting database migrations...\n');

    await createMigrationsTable();
    const pending = await getPendingMigrations();

    if (pending.length === 0) {
      console.log('\n✅ All migrations up to date!');
      return;
    }

    console.log(`\n📦 Found ${pending.length} pending migration(s)\n`);

    for (const migration of pending) {
      await runMigration(migration);
    }

    console.log('\n✅ All migrations completed successfully!');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
