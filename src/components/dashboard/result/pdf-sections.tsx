import React from "react";
import { Text, View, Image as PdfImage } from "@react-pdf/renderer";
import { type Meeting, type Attendee } from "@/db/database/schema";
import { styles } from "./pdf-styles";
import { parseHtmlContent } from "./pdf-html-parser";

export function PdfHeader() {
  return (
    <>
      <View style={styles.headerContainer}>
        <View style={styles.logoPlaceholder} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.kop1}>Pemerintah Provinsi Sulawesi Tenggara</Text>
          <Text style={styles.kop2}>Badan Pendapatan Daerah</Text>
          <Text style={styles.kop3}>
            Kompleks Bumi Praja Anduonohu, Kendari. Telp: (0401) 312xxxx
          </Text>
          <Text style={styles.kop3}>Email: bapenda@sultraprov.go.id</Text>
        </View>
      </View>
      <View style={styles.kopDividerThick} />
      <View style={styles.kopDividerThin} />
    </>
  );
}

export function PdfMeetingInfo({ meetingData }: { meetingData: Meeting }) {
  return (
    <>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>NOTULENSI KEGIATAN</Text>
        <Text style={styles.titleSub}>Dokumen Resmi E-Notulen</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.colLabel}>Kegiatan</Text>
        <Text style={styles.colColon}>:</Text>
        <Text style={styles.colValue}>{meetingData.title}</Text>
      </View>
      <View style={styles.infoRow}>
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
      <View style={styles.infoRow}>
        <Text style={styles.colLabel}>Tempat</Text>
        <Text style={styles.colColon}>:</Text>
        <Text style={styles.colValue}>{meetingData.location || "-"}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.colLabel}>Pimpinan</Text>
        <Text style={styles.colColon}>:</Text>
        <Text style={styles.colValue}>{meetingData.leader || "-"}</Text>
      </View>
    </>
  );
}

export function PdfRisalah({ content }: { content: string }) {
  return (
    <>
      <Text style={styles.sectionTitle}>I. RISALAH PEMBAHASAN</Text>
      <Text style={styles.content}>{parseHtmlContent(content)}</Text>
    </>
  );
}

export function PdfAttendanceTable({ attendees }: { attendees: Attendee[] }) {
  return (
    <>
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
            <Text style={styles.tableCellHeader}>Paraf</Text>
          </View>
        </View>
        {attendees.length > 0 ? (
          attendees.map((person, idx) => (
            <View style={styles.tableRow} key={idx} wrap={false}>
              <View
                style={[styles.tableCol, { width: "8%", alignItems: "center" }]}
              >
                <Text style={styles.tableCell}>{idx + 1}</Text>
              </View>
              <View style={[styles.tableCol, { width: "32%" }]}>
                <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                  {person.name}
                </Text>
                <Text style={{ fontSize: 8, color: "#475569", marginTop: 2 }}>
                  NIP. {person.nip || "-"}
                </Text>
              </View>
              <View style={[styles.tableCol, { width: "25%" }]}>
                <Text style={[styles.tableCell, { fontSize: 8 }]}>
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
    </>
  );
}

export function PdfPhotos({ photos }: { photos: string[] }) {
  return (
    <>
      <Text style={styles.sectionTitle} wrap={false}>
        III. DOKUMENTASI FOTO
      </Text>
      {photos.length > 0 ? (
        <View style={styles.photoGrid}>
          {photos.map((src, idx) => (
            <View key={idx} style={styles.photoWrapper} wrap={false}>
              <PdfImage src={src} style={styles.photo} />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noPhoto}>Tidak ada lampiran dokumentasi</Text>
      )}
    </>
  );
}

export function PdfSignatures({
  leader,
  date,
}: {
  leader: string;
  date: Date | string;
}) {
  return (
    <View style={styles.signatureSection} wrap={false}>
      <View style={styles.signatureBlock}>
        <Text style={styles.signatureDate}>Mengetahui,</Text>
        <Text
          style={[
            styles.signatureName,
            { textDecoration: "none", marginBottom: 2 },
          ]}
        >
          Pimpinan Rapat
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 50 }}>
          (......................................)
        </Text>
        <Text style={styles.signatureName}>
          {leader || "................................"}
        </Text>
        <Text style={styles.signatureNip}>
          NIP. ................................
        </Text>
      </View>

      <View style={styles.signatureBlock}>
        <Text style={styles.signatureDate}>
          Kendari,{" "}
          {new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
        <Text
          style={[
            styles.signatureName,
            { textDecoration: "none", marginBottom: 2 },
          ]}
        >
          Notulis
        </Text>
        <Text style={{ fontSize: 9, marginBottom: 50 }}>
          (......................................)
        </Text>
        <Text style={styles.signatureName}>
          ................................
        </Text>
        <Text style={styles.signatureNip}>
          NIP. ................................
        </Text>
      </View>
    </View>
  );
}
