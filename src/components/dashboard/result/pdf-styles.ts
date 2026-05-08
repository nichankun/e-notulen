import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    paddingTop: "1.5cm",
    paddingBottom: "2.54cm",
    paddingLeft: "2.54cm",
    paddingRight: "2.54cm",
    fontFamily: "Helvetica",
    fontSize: 12,
    lineHeight: 1.5, // Tambahan vital agar teks tidak tumpang tindih
    color: "#000",
  },
  // KOP SURAT
  headerWrapper: { marginBottom: 8, width: "100%" },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  logoContainer: { width: 75, alignItems: "flex-start" },
  logo: { width: 55, height: 65, objectFit: "contain" },
  headerTextContainer: { flex: 1, textAlign: "center" },
  rightSpacer: { width: 75 },
  kop1: { fontSize: 13, textTransform: "uppercase", marginBottom: 1 },
  kop2: {
    fontSize: 15,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 1,
  },
  kop3: { fontSize: 8, marginTop: 1 },
  kopDividerThick: {
    borderBottomWidth: 2.5,
    borderBottomColor: "#000",
    marginTop: 8,
  },
  kopDividerThin: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginTop: 1.5,
  },

  // INFO & TABEL
  infoTable: { marginTop: 15, marginBottom: 10 },
  infoRow: { flexDirection: "row", marginBottom: 4 },
  infoLabel: { width: 130 }, // Diperlebar sedikit agar lebih rapi
  infoColon: { width: 10 },
  infoValue: { flex: 1, textAlign: "justify" },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 8,
    textDecoration: "underline",
  },

  // TABEL ABSENSI (Perbaikan Border dan Spacing)
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: { flexDirection: "row" },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000", // Wajib ditegaskan agar border rapi
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    paddingVertical: 4, // Tambahan padding agar teks tidak menempel garis
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    justifyContent: "center",
    paddingVertical: 4,
  },
  tableCellHeader: {
    margin: 4,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: { margin: 4, fontSize: 12 },

  // FOTO
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  photoWrapper: { width: "48%", height: 150, marginBottom: 10 },
  photo: { width: "100%", height: "100%", objectFit: "cover" },

  pageNumber: {
    position: "absolute",
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "grey",
  },
});
