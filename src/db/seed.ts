import { db } from "@/db/index"; // Pastikan path ini mengarah ke file koneksi db Anda
import { users } from "@/db/database/schema"; // Pastikan path ini mengarah ke schema Anda
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Memulai proses seeding...");

  try {
    // 1. Cek apakah user admin dengan NIP ini sudah ada?
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.nip, "199XXXXX"))
      .limit(1);

    if (existingUser.length > 0) {
      console.log("⚠️  User Admin sudah ada. Seeding dilewati.");
      process.exit(0); // Keluar dengan sukses
    }

    // 2. Jika belum ada, buat user baru
    await db.insert(users).values({
      nip: "199XXXXX",
      password: "admin123", // Password plain-text (sesuai logika login saat ini)
      name: "Super Admin IT",
      role: "admin",
    });

    console.log("✅ BERHASIL! User admin telah dibuat.");
    console.log("👉 Login NIP  : 199XXXXX");
    console.log("👉 Login Pass : admin123");
  } catch (error) {
    console.error("❌ Gagal melakukan seeding:", error);
    process.exit(1); // Keluar dengan error
  } finally {
    // Menutup koneksi (opsional, tergantung driver db)
    process.exit(0);
  }
}

main();
