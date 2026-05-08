import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";

const parserStyles = StyleSheet.create({
  heading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 2,
  },
  numberedItem: {
    flexDirection: "row",
    marginBottom: 3,
    marginLeft: 0,
  },
  numberedItemBullet: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    width: 18,
    flexShrink: 0,
  },
  numberedItemContent: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Helvetica",
    textAlign: "justify",
    lineHeight: 1.5,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 3,
    marginLeft: 12,
  },
  bulletSymbol: {
    fontSize: 12,
    width: 14,
    flexShrink: 0,
    fontFamily: "Helvetica",
  },
  bulletContent: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Helvetica",
    textAlign: "justify",
    lineHeight: 1.5,
  },
  paragraph: {
    fontSize: 12,
    fontFamily: "Helvetica",
    textAlign: "justify",
    lineHeight: 1.5,
    marginBottom: 3,
  },
});

type InlineNode = {
  text: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
};

type Token =
  | { type: "heading"; content: InlineNode[] }
  | { type: "numbered"; num: string; content: InlineNode[] }
  | { type: "bullet"; content: InlineNode[] }
  | { type: "paragraph"; content: InlineNode[] };

// ── Helper: parse inline bold/italic/underline ─────────────────────
function parseInline(html: string): InlineNode[] {
  // Pisahkan string berdasarkan tag format, membiarkan spasi tetap utuh
  const tokens = html.split(/(<\/?(?:strong|b|i|em|u)[^>]*>)/gi);
  let bold = false,
    italic = false,
    underline = false;
  const nodes: InlineNode[] = [];

  tokens.forEach((tok) => {
    if (!tok) return;
    if (/^<[^>]+>$/.test(tok)) {
      const l = tok.toLowerCase();
      if (/^<(strong|b)\b/.test(l)) bold = true;
      else if (/^<\/(strong|b)/.test(l)) bold = false;
      else if (/^<(i|em)\b/.test(l)) italic = true;
      else if (/^<\/(i|em)/.test(l)) italic = false;
      else if (/^<u\b/.test(l)) underline = true;
      else if (/^<\/u/.test(l)) underline = false;
    } else {
      // Simpan teks apa adanya (termasuk spasi), hanya bersihkan karakter zero-width
      const text = tok.replace(/[\u200B-\u200D\uFEFF]/g, "");
      if (text) nodes.push({ text, bold, italic, underline });
    }
  });

  return nodes;
}

// ── Helper: render InlineNode[] sebagai <Text> inline ─────────────
function renderInline(
  nodes: InlineNode[],
  key: string,
  defaultBold = false,
): React.ReactNode {
  return nodes.map((n, i) => {
    const isBold = n.bold || defaultBold;
    let fontFamily: string = "Helvetica";

    if (isBold && n.italic) fontFamily = "Helvetica-BoldOblique";
    else if (isBold) fontFamily = "Helvetica-Bold";
    else if (n.italic) fontFamily = "Helvetica-Oblique";

    return (
      <Text
        key={`${key}-${i}`}
        style={{
          fontFamily,
          textDecoration: n.underline ? "underline" : "none",
        }}
      >
        {n.text}
      </Text>
    );
  });
}

// ── Tokenizer Utama ────────────────────────────────────────────────
function tokenize(html: string): Token[] {
  if (!html) return [];

  let text = html;

  // Fungsi pembantu untuk mencegah teks di dalam list turun ke baris baru
  const cleanListItem = (content: string) => {
    return content
      .replace(/<\/?(p|div|h[1-6]|blockquote)[^>]*>/gi, " ") // Ubah block tag jadi spasi
      .replace(/<br\s*\/?>/gi, " ") // Ubah <br> jadi spasi
      .replace(/\s+/g, " ") // Rapikan spasi ganda yang muncul
      .trim();
  };

  // 1. Ekstrak isi list (<ul>/<ol>) menjadi baris-baris berawalan simbol/nomor
  text = text.replace(
    /<ul[^>]*>([\s\S]*?)<\/ul>/gi,
    (_m: string, inner: string) => {
      return (
        "\n" +
        inner.replace(
          /<li[^>]*>([\s\S]*?)<\/li>/gi,
          (_m2: string, c: string) => {
            // Gunakan cleanListItem agar bullet (•) dan teks tetap sejajar 1 baris
            return `\n• ${cleanListItem(c)}\n`;
          },
        ) +
        "\n"
      );
    },
  );

  text = text.replace(
    /<ol[^>]*>([\s\S]*?)<\/ol>/gi,
    (_m: string, inner: string) => {
      let i = 1;
      return (
        "\n" +
        inner.replace(
          /<li[^>]*>([\s\S]*?)<\/li>/gi,
          (_m2: string, c: string) => {
            return `\n${i++}. ${cleanListItem(c)}\n`;
          },
        ) +
        "\n"
      );
    },
  );

  // Jika ada tag <li> yang bocor di luar ul/ol, asumsikan sebagai bullet
  text = text.replace(
    /<li[^>]*>([\s\S]*?)<\/li>/gi,
    (_m: string, c: string) => {
      return `\n• ${cleanListItem(c)}\n`;
    },
  );

  // 2. Beri jarak baris untuk elemen block sisanya
  text = text.replace(/<\/?(p|div|h[1-6]|table|tr|blockquote)[^>]*>/gi, "\n");
  text = text.replace(/<\/?(td|th)[^>]*>/gi, " "); // Pisahkan sel tabel dengan spasi
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // 3. Hapus SEMUA tag KECUALI tag formatting inline (strong, b, i, em, u)
  text = text.replace(/<(\/?)(?!strong|b|i|em|u)[a-z0-9]+[^>]*>/gi, "");

  // 4. Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // 5. Normalisasi dan pecah berdasarkan baris (Enter)
  const lines = text.split(/\r?\n/);
  const tokens: Token[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Deteksi heading: A. B. C. (Cetak tebal)
    if (/^[A-Z]{1,3}\.\s+\S/.test(trimmed) && trimmed.length < 80) {
      tokens.push({ type: "heading", content: parseInline(trimmed) });
    }
    // Deteksi list penomoran: 1. 2. 3.
    else if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+\.)\s+([\s\S]+)$/);
      if (match) {
        tokens.push({
          type: "numbered",
          num: match[1],
          content: parseInline(match[2]),
        });
      }
    }
    // Deteksi list peluru (Bullet)
    else if (/^[•\-\*]\s+/.test(trimmed)) {
      const contentText = trimmed.replace(/^[•\-\*]\s+/, "");
      tokens.push({ type: "bullet", content: parseInline(contentText) });
    }
    // Paragraf teks biasa
    else {
      tokens.push({ type: "paragraph", content: parseInline(trimmed) });
    }
  });

  return tokens;
}

// ── Render utama yang dipanggil dari pdf-sections ──────────────────
export const parseHtmlContent = (html: string): React.ReactNode => {
  if (!html || html.trim() === "") {
    return (
      <Text style={parserStyles.paragraph}>Tidak ada catatan pembahasan.</Text>
    );
  }

  const tokens = tokenize(html);

  if (tokens.length === 0) {
    return (
      <Text style={parserStyles.paragraph}>Tidak ada catatan pembahasan.</Text>
    );
  }

  return (
    <View>
      {tokens.map((token, idx) => {
        const key = `tok-${idx}`;

        switch (token.type) {
          case "heading":
            return (
              <Text key={key} style={parserStyles.heading}>
                {renderInline(token.content, key, true)}
              </Text>
            );

          case "numbered":
            return (
              <View key={key} style={parserStyles.numberedItem}>
                <Text style={parserStyles.numberedItemBullet}>{token.num}</Text>
                <Text style={parserStyles.numberedItemContent}>
                  {renderInline(token.content, key)}
                </Text>
              </View>
            );

          case "bullet":
            return (
              <View key={key} style={parserStyles.bulletItem}>
                <Text style={parserStyles.bulletSymbol}>{"•"}</Text>
                <Text style={parserStyles.bulletContent}>
                  {renderInline(token.content, key)}
                </Text>
              </View>
            );

          case "paragraph":
          default:
            return (
              <Text key={key} style={parserStyles.paragraph}>
                {renderInline(token.content, key)}
              </Text>
            );
        }
      })}
    </View>
  );
};
