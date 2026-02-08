import { db } from "@/db/index";
import { users } from "@/db/database/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs"; // Gunakan bcrypt!

async function main() {
  console.log("🌱 Memulai proses seeding...");
  const targetNip = "199702092025041008"; // Gunakan variabel agar sinkron

  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.nip, targetNip))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("⚠️ User Admin sudah ada. Seeding dilewati.");
      return;
    }

    // Hash password sebelum masuk ke DB
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await db.insert(users).values({
      nip: targetNip,
      password: hashedPassword,
      name: "Super Admin IT",
      role: "admin",
    });

    console.log("✅ BERHASIL! User admin telah dibuat.");
  } catch (error) {
    console.error("❌ Gagal seeding:", error);
  } finally {
    process.exit(0);
  }
}

main();
