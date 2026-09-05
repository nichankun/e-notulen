import { db } from "@/db/index";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  const targetNip = process.env.SEED_ADMIN_NIP;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME || "Super Admin IT";
  const adminAgency = process.env.SEED_ADMIN_AGENCY || null;

  if (!targetNip || !adminPassword || adminPassword.length < 12) {
    throw new Error(
      "SEED_ADMIN_NIP and SEED_ADMIN_PASSWORD (minimum 12 characters) are required",
    );
  }

  console.log("Memulai proses seeding admin...");

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.nip, targetNip))
    .limit(1);

  if (existingUser) {
    console.log("User admin sudah ada. Seeding dilewati.");
    return;
  }

  await db.insert(users).values({
    nip: targetNip,
    password: await bcrypt.hash(adminPassword, 12),
    name: adminName,
    agency: adminAgency,
    role: "admin",
  });

  console.log("User admin berhasil dibuat.");
}

main().catch((error: unknown) => {
  console.error("Gagal seeding:", error);
  process.exitCode = 1;
});
