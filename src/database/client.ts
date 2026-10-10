import { drizzle } from 'drizzle-orm/expo-sqlite'
import * as Sqlite from 'expo-sqlite'
import * as schema from './schema'


const expoDb = Sqlite.openDatabaseSync('fieldpulse.db')
export const db = drizzle(expoDb, { schema })


export async function initDatabase() {
  await expoDb.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS inspections (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      latitude REAL,
      longitude REAL,
      photo_uri TEXT,
      signature_uri TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);
}