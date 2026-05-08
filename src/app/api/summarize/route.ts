import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Teks transkrip kosong" },
        { status: 400 },
      );
    }

    // Mengambil API Key dari .env
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY belum disetel di .env");
      return NextResponse.json(
        { success: false, error: "Konfigurasi server bermasalah" },
        { status: 500 },
      );
    }

    // Inisialisasi Gemini 1.5 Flash (Sangat cepat untuk teks)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // Prompt cerdas untuk memaksa AI merangkum ke format HTML yang Tiptap-friendly
    const prompt = `
      Anda adalah asisten profesional pembuat notulen rapat untuk instansi pemerintahan.
      Tugas Anda merangkum transkrip suara berikut menjadi poin-poin notulen yang rapi.
      
      ATURAN PENTING (BACA DENGAN TELITI):
      1. SANGAT STRICT: HANYA gunakan informasi yang benar-benar disebutkan di dalam transkrip. JANGAN PERNAH mengarang, menebak fakta, atau menambahkan asumsi. Jika transkripnya pendek (misalnya hanya tes), tampilkan apa adanya secara singkat!
      2. Format output HARUS murni HTML sederhana (gunakan <h3>, <ul>, <ol>, <li>, <strong>, <p>). Jangan gunakan blok markdown seperti \`\`\`html.
      3. STRUKTUR FLEKSIBEL: Jika durasi/teks transkrip panjang dan memadai, bagi menjadi "Pembukaan, Inti Diskusi, dan Tindak Lanjut". NAMUN, jika transkripnya sangat singkat, JANGAN buat struktur tersebut. Langsung saja jadikan 1 paragraf atau 1 list sederhana.
      4. Perbaiki kata-kata yang mungkin salah tangkap oleh mikrofon agar kalimatnya menjadi baku dan mudah dipahami.
      
      TRANSKRIP RAPAT:
      "${text}"
    `;

    const result = await model.generateContent(prompt);
    let htmlContent = result.response.text();

    // Pembersihan jika AI membandel dan memberikan format markdown (```html ... ```)
    htmlContent = htmlContent
      .replace(/```html/g, "")
      .replace(/```/g, "")
      .trim();

    return NextResponse.json({ success: true, data: htmlContent });
  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal merangkum notulen dengan AI" },
      { status: 500 },
    );
  }
}
