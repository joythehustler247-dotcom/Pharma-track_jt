import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'
import { config } from '../utils/config.js'

// Connection for queries (pooled)
const queryClient = postgres(config.databaseUrl, {
  max:             10,
  idle_timeout:    20,
  connect_timeout: 10,
})

// Main DB instance with schema for relational queries
export const db = drizzle(queryClient, { schema, logger: config.isDev })

// For migrations only (single connection, not pooled)
export const migrationClient = postgres(config.databaseUrl, { max: 1 })
