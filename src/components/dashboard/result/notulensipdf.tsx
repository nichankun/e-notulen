"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PdfImage,
} from "@react-pdf/renderer";
import { type Meeting, type Attendee } from "@/db/database/schema";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 10 },
  header: {
    textAlign: "center",
    borderBottomWidth: 3,
    borderBottomStyle: "solid",
    borderBottomColor: "#000",
    paddingBottom: 10,
    marginBottom: 20,
  },
  kop1: { fontSize: 12, fontWeight: "bold", textTransform: "uppercase" },
  kop2: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 4,
  },
  kop3: { fontSize: 8, fontStyle: "italic", marginTop: 4 },
  title: {
    fontSize: 12,
    fontWeight: "bold",
    textDecoration: "underline",
    textAlign: "center",
    marginBottom: 15,
  },
  row: { flexDirection: "row", marginBottom: 6 },
  colLabel: { width: 90, fontWeight: "bold" },
  colColon: { width: 10, textAlign: "center" },
  colValue: { flex: 1 },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
  },
  content: { textAlign: "justify", lineHeight: 1.5, fontSize: 10 },

  // Tabel
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  tableRow: { flexDirection: "row" },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    backgroundColor: "#f1f5f9",
    padding: 5,
    justifyContent: "center",
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderTopWidth: 0,
    borderLeftWidth: 0,
    padding: 5,
    justifyContent: "center",
  },
  tableCellHeader: { fontSize: 9, fontWeight: "bold", textAlign: "center" },
  tableCell: { fontSize: 9 },

  // Foto
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 5 },
  photoWrapper: { width: "48%", marginBottom: 10 },
  photo: {
    width: "100%",
    height: 150,
    objectFit: "contain",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ccc",
  },
  noPhoto: {
    textAlign: "center",
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 10,
  },
});

// OPTIMASI: Parser HTML yang Type-Safe & Ramah Mobile
const parseHtmlContent = (html: string): React.ReactNode[] | string => {
  if (!html) return "Tidak ada catatan pembahasan.";

  let text = html;

  // 1. Hapus karakter tersembunyi (zero-width spaces) bawaan keyboard mobile
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // 2. Bersihkan paragraf kosong dari HP (<p></p>, <p><br></p>, <p>&nbsp;</p>)
  text = text.replace(/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/gi, "\n");
  text = text.replace(/<p[^>]*>\s*&nbsp;\s*<\/p>/gi, "\n");
  text = text.replace(/<p[^>]*>\s*<\/p>/gi, "");

  // 3. Format List
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_match, content) => {
    return `<li>${content.replace(/<\/?(p|div)[^>]*>/gi, "")}</li>`;
  });

  text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_match, inner) => {
    let i = 1;
    return inner.replace(
      /<li>([\s\S]*?)<\/li>/gi,
      (_m: string, content: string) => `\n${i++}. ${content.trim()}`,
    );
  });

  text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_match, inner) => {
    return inner.replace(
      /<li>([\s\S]*?)<\/li>/gi,
      (_m: string, content: string) => `\n• ${content.trim()}`,
    );
  });

  // 4. Ubah penutup blok dan <br> menjadi enter
  text = text.replace(/<\/(p|div)>/gi, "\n\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // 5. Buang semua tag HTML KECUALI tag formatting font
  text = text.replace(
    /<(\/?)([a-z0-9]+)[^>]*>/gi,
    (match, _slash, tagName: string) => {
      const tag = tagName.toLowerCase();
      return ["strong", "b", "i", "em", "u"].includes(tag) ? match : "";
    },
  );

  // 6. Decode HTML Entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // 7. Normalisasi Spasi & Baris Baru (PENTING UNTUK MOBILE)
  text = text.replace(/[ \t]+/g, " "); // Deretan spasi berlebih dari HP jadi 1 spasi
  text = text.replace(/\n\s*\n/g, "\n\n");
  text = text.replace(/\n{3,}/g, "\n\n").trim(); // Cegah enter yang terlalu jauh

  // 8. Tokenisasi text to React-PDF Text
  const tokens = text.split(/(<\/?(?:strong|b|i|em|u)[^>]*>)/gi);

  let isBold = false;
  let isItalic = false;
  let isUnderline = false;
  const result: React.ReactNode[] = [];

  tokens.forEach((token, index) => {
    if (!token) return;

    if (/^<[^>]+>$/.test(token)) {
      const lower = token.toLowerCase();
      if (/^<(strong|b)\b[^>]*>$/.test(lower)) isBold = true;
      else if (/^<\/(strong|b)[^>]*>$/.test(lower)) isBold = false;
      else if (/^<(i|em)\b[^>]*>$/.test(lower)) isItalic = true;
      else if (/^<\/(i|em)[^>]*>$/.test(lower)) isItalic = false;
      else if (/^<u\b[^>]*>$/.test(lower)) isUnderline = true;
      else if (/^<\/u[^>]*>$/.test(lower)) isUnderline = false;
    } else {
      let fontFamily:
        | "Helvetica"
        | "Helvetica-Bold"
        | "Helvetica-Oblique"
        | "Helvetica-BoldOblique" = "Helvetica";
      if (isBold && isItalic) fontFamily = "Helvetica-BoldOblique";
      else if (isBold) fontFamily = "Helvetica-Bold";
      else if (isItalic) fontFamily = "Helvetica-Oblique";

      result.push(
        <Text
          key={index}
          style={{
            fontFamily,
            textDecoration: isUnderline ? "underline" : "none",
          }}
        >
          {token}
        </Text>,
      );
    }
  });

  return result;
};

export default function NotulensiPDF({
  meetingData,
  attendees,
  photos,
}: {
  meetingData: Meeting;
  attendees: Attendee[];
  photos: string[];
}) {
  return (
    <Document>
      <Page size="LEGAL" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.kop1}>Pemerintah Provinsi Sulawesi Tenggara</Text>
          <Text style={styles.kop2}>Badan Pendapatan Daerah</Text>
          <Text style={styles.kop3}>
            Kompleks Bumi Praja Anduonohu, Kendari. Telp: (0401) 312xxxx, Email:
            bapenda@sultraprov.go.id
          </Text>
        </View>

        <Text style={styles.title}>NOTULENSI KEGIATAN</Text>

        <View style={styles.row}>
          <Text style={styles.colLabel}>Kegiatan</Text>
          <Text style={styles.colColon}>:</Text>
          <Text style={styles.colValue}>{meetingData.title}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.colLabel}>Hari / Tanggal</Text>
          <Text style={styles.colColon}>:</Text>
          <Text style={styles.colValue}>
            {new Date(meetingData.date).toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.colLabel}>Tempat</Text>
          <Text style={styles.colColon}>:</Text>
          <Text style={styles.colValue}>{meetingData.location || "-"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.colLabel}>Pimpinan</Text>
          <Text style={styles.colColon}>:</Text>
          <Text style={styles.colValue}>{meetingData.leader || "-"}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>I. RISALAH PEMBAHASAN</Text>
        <Text style={styles.content}>
          {parseHtmlContent(meetingData.content || "")}
        </Text>

        <Text style={styles.sectionTitle}>II. DAFTAR HADIR PESERTA</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, { width: "8%" }]}>
              <Text style={styles.tableCellHeader}>No</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "32%" }]}>
              <Text style={styles.tableCellHeader}>Nama / NIP</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "25%" }]}>
              <Text style={styles.tableCellHeader}>Instansi / Bidang</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "15%" }]}>
              <Text style={styles.tableCellHeader}>Waktu</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "20%" }]}>
              <Text style={styles.tableCellHeader}>Tanda Tangan</Text>
            </View>
          </View>
          {attendees.length > 0 ? (
            attendees.map((person, idx) => (
              <View style={styles.tableRow} key={idx} wrap={false}>
                <View
                  style={[
                    styles.tableCol,
                    { width: "8%", alignItems: "center" },
                  ]}
                >
                  <Text style={styles.tableCell}>{idx + 1}</Text>
                </View>
                <View style={[styles.tableCol, { width: "32%" }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { fontWeight: "bold", textTransform: "uppercase" },
                    ]}
                  >
                    {person.name}
                  </Text>
                  <Text style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>
                    {person.nip || "-"}
                  </Text>
                </View>
                <View style={[styles.tableCol, { width: "25%" }]}>
                  <Text
                    style={[
                      styles.tableCell,
                      { textTransform: "uppercase", fontSize: 8 },
                    ]}
                  >
                    {person.department || "-"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableCol,
                    { width: "15%", alignItems: "center" },
                  ]}
                >
                  <Text style={styles.tableCell}>
                    {person.scannedAt
                      ? new Date(person.scannedAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.tableCol,
                    { width: "20%", alignItems: "center", padding: 2 },
                  ]}
                >
                  {person.signature ? (
                    <PdfImage
                      src={person.signature}
                      style={{ width: 40, height: 20, objectFit: "contain" }}
                    />
                  ) : (
                    <Text style={styles.tableCell}>-</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <View
                style={[
                  styles.tableCol,
                  { width: "100%", alignItems: "center", padding: 10 },
                ]}
              >
                <Text style={[styles.tableCell, { fontStyle: "italic" }]}>
                  Belum ada data absensi
                </Text>
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>III. DOKUMENTASI FOTO</Text>
        {photos.length > 0 ? (
          <View style={styles.photoGrid}>
            {photos.map((src, idx) => (
              <View key={idx} style={styles.photoWrapper} wrap={false}>
                <PdfImage src={src} style={styles.photo} />
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noPhoto}>TIDAK ADA DOKUMENTASI</Text>
        )}
      </Page>
    </Document>
  );
}
