/**
 * Standalone DB seed script for actors table
 * Run with: npx tsx src/db/seed.ts
 */
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { actors } from './schema.js'
import { eq } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set')
  process.exit(1)
}

const queryClient = postgres(DATABASE_URL, { max: 1 })
const db = drizzle(queryClient)

async function seed() {
  console.log('\n⏳ Seeding actors table...\n')

  const actorsToSeed = [
    {
      walletAddress: (process.env.MANUFACTURER_WALLET || '0x0000000000000000000000000000000000000001').toLowerCase(),
      role:          'MANUFACTURER' as const,
      name:          'Cipla Ltd',
      licenseNumber: 'MFR-PUN-2024-001',
      city:          'Pune',
    },
    {
      walletAddress: (process.env.DISTRIBUTOR_WALLET || '0x0000000000000000000000000000000000000002').toLowerCase(),
      role:          'DISTRIBUTOR' as const,
      name:          'MedStock India',
      licenseNumber: 'DST-DEL-2024-001',
      city:          'Delhi',
    },
    {
      walletAddress: (process.env.PHARMACY_WALLET || '0x0000000000000000000000000000000000000003').toLowerCase(),
      role:          'PHARMACY' as const,
      name:          'Kumar Medicals',
      licenseNumber: 'PHR-NOI-2024-001',
      city:          'Noida',
    },
  ]

  for (const actor of actorsToSeed) {
    // Delete existing if any (idempotent)
    await db.delete(actors).where(eq(actors.walletAddress, actor.walletAddress))

    await db.insert(actors).values({
      id:            createId(),
      walletAddress: actor.walletAddress,
      role:          actor.role,
      name:          actor.name,
      licenseNumber: actor.licenseNumber,
      city:          actor.city,
      isVerified:    true,
    })

    console.log(`✅ ${actor.role}: ${actor.name} (${actor.walletAddress})`)
  }

  console.log('\n✅ Seeding complete!\n')
  await queryClient.end()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
