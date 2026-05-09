import { Text, View, Image as PdfImage } from "@react-pdf/renderer";
import { type Meeting, type Attendee } from "@/db/database/schema";
import { styles } from "./pdf-styles";
import { parseHtmlContent } from "./pdf-html-parser";

// ==========================================
// 1. KOP SURAT
// ==========================================
export function PdfHeader() {
  return (
    <View style={styles.headerWrapper}>
      <View style={styles.headerContainer}>
        <View style={styles.logoContainer}>
          <PdfImage src="/logo-sultra.png" style={styles.logo} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.kop1}>Pemerintah Provinsi Sulawesi Tenggara</Text>
          <Text style={styles.kop2}>Badan Pendapatan Daerah</Text>
          <Text style={styles.kop3}>
            Kompleks Bumi Praja Anduonohu, Kendari. Telp: (0401) 3122158
          </Text>
          <Text style={styles.kop3}>Email: bapenda@sultraprov.go.id</Text>
        </View>
      </View>
      <View style={styles.kopDividerThick} />
      <View style={styles.kopDividerThin} />
    </View>
  );
}

// ==========================================
// 2. INFO RAPAT
// ==========================================
const BLANK =
  "................................................................";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoColon}>:</Text>
      {typeof value === "string" ? (
        <Text style={styles.infoValue}>{value || BLANK}</Text>
      ) : (
        <View style={styles.infoValue}>{value}</View>
      )}
    </View>
  );
}

function InfoRowMulti({ label, items }: { label: string; items: string[] }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoColon}>:</Text>
      <View style={styles.infoValue}>
        {items.map((item, i) => (
          <Text key={i}>{item}</Text>
        ))}
      </View>
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{
        borderBottomWidth: 0.5,
        borderBottomColor: "#ccc",
        borderBottomStyle: "dashed",
        marginVertical: 8,
      }}
    />
  );
}

export function PdfMeetingInfo({ meetingData }: { meetingData: Meeting }) {
  const dateStr = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(meetingData.date));

  // Format waktu: "09.00 – 11.30 WITA" atau fallback ke BLANK
  const waktu =
    meetingData.startTime && meetingData.endTime
      ? `${meetingData.startTime} – ${meetingData.endTime} WITA`
      : meetingData.startTime
        ? `${meetingData.startTime} WITA`
        : BLANK;

  return (
    <View style={styles.infoTable}>
      {/* Judul */}
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Helvetica-Bold",
            textDecoration: "underline",
          }}
        >
          NOTULA
        </Text>
      </View>

      {/* Seksi 1: Identitas Rapat */}
      <InfoRow label="Sidang/Rapat" value={meetingData.title} />
      <InfoRow label="Hari/Tanggal" value={dateStr} />
      <InfoRow
        label="Surat Undangan"
        value={meetingData.invitationNumber || BLANK}
      />
      <InfoRow label="Waktu Sidang/Rapat" value={waktu} />
      <InfoRowMulti
        label="Acara"
        items={[`1. Pembahasan ${meetingData.title}`, "2. Dan seterusnya."]}
      />

      <Divider />

      {/* Seksi 2: Pimpinan Sidang */}
      <Text style={{ marginBottom: 4, fontFamily: "Helvetica-Bold" }}>
        Pimpinan Sidang/Rapat
      </Text>
      <InfoRow label="Ketua" value={meetingData.leader || BLANK} />
      <InfoRow label="Sekretaris" value={meetingData.secretary || BLANK} />
      <InfoRow label="Pencatat" value={meetingData.recorder || BLANK} />

      <Divider />

      {/* Seksi 3: Peserta */}
      <InfoRowMulti
        label="Peserta sidang/rapat"
        items={["1. (Terlampir pada daftar hadir)", "2. Dan seterusnya."]}
      />
    </View>
  );
}

// ==========================================
// 3. ISI NOTULEN & TANDA TANGAN PIMPINAN
// ==========================================
export function PdfRisalah({
  content,
  meetingData,
}: {
  content: string;
  meetingData: Meeting;
}) {
  return (
    <View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Kegiatan Sidang/Rapat</Text>
        <Text style={styles.infoColon}>:</Text>
        <View style={styles.infoValue}>
          {content && content.trim() !== "" ? (
            parseHtmlContent(content)
          ) : (
            <Text>
              (Disesuaikan dengan kondisi kegiatan
              sidang/rapat)............................................
            </Text>
          )}
        </View>
      </View>

      {/* Tanda Tangan Pimpinan */}
      <View
        style={{
          marginTop: 40,
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
        wrap={false}
      >
        <View style={{ width: 220, alignItems: "flex-start" }}>
          <Text>Pimpinan Sidang/Rapat</Text>
          <Text>
            {meetingData.leaderTitle || "Nama Jabatan"}
            {"."}
          </Text>
          <View style={{ height: 60 }} />
          <Text
            style={{
              fontFamily: "Helvetica-Bold",
              textDecoration: "underline",
            }}
          >
            {meetingData.leader || BLANK}
          </Text>
          <Text>{meetingData.leaderRank || "Pangkat/Golongan"}</Text>
        </View>
      </View>
    </View>
  );
}

// ==========================================
// 4. TABEL DAFTAR HADIR
// ==========================================
export function PdfAttendanceTable({ attendees }: { attendees: Attendee[] }) {
  if (!attendees || attendees.length === 0) return null;

  return (
    <View break style={{ paddingTop: 10 }}>
      <Text style={styles.sectionTitle}>DAFTAR HADIR PESERTA</Text>
      <View style={styles.table}>
        <View style={styles.tableRow} fixed>
          <View style={[styles.tableColHeader, { width: "10%" }]}>
            <Text style={styles.tableCellHeader}>No</Text>
          </View>
          <View style={[styles.tableColHeader, { width: "60%" }]}>
            <Text style={styles.tableCellHeader}>Nama / Jabatan</Text>
          </View>
          <View style={[styles.tableColHeader, { width: "30%" }]}>
            <Text style={styles.tableCellHeader}>Tanda Tangan</Text>
          </View>
        </View>

        {attendees.map((person, idx) => (
          <View style={styles.tableRow} key={idx} wrap={false}>
            <View
              style={[styles.tableCol, { width: "10%", alignItems: "center" }]}
            >
              <Text style={styles.tableCell}>{idx + 1}</Text>
            </View>
            <View style={[styles.tableCol, { width: "60%" }]}>
              <Text style={styles.tableCell}>{person.name}</Text>
              {person.department && person.department !== "-" && (
                <Text
                  style={[styles.tableCell, { fontSize: 10, color: "#555" }]}
                >
                  {person.department}
                </Text>
              )}
            </View>
            <View
              style={[
                styles.tableCol,
                {
                  width: "30%",
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              {person.signature ? (
                <PdfImage
                  src={person.signature}
                  style={{ width: 45, height: 25, objectFit: "contain" }}
                />
              ) : (
                <Text style={styles.tableCell}>-</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ==========================================
// 5. FOTO / DOKUMENTASI
// ==========================================
export function PdfPhotos({ photos }: { photos: string[] }) {
  if (!photos || photos.length === 0) return null;
  return (
    <View break style={{ paddingTop: 10 }}>
      <Text style={styles.sectionTitle}>DOKUMENTASI</Text>
      <View style={styles.photoGrid}>
        {photos.map((p, i) => (
          <View key={i} style={styles.photoWrapper}>
            <PdfImage src={p} style={styles.photo} />
          </View>
        ))}
      </View>
    </View>
  );
}
