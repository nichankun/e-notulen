import React from "react";
import { Text } from "@react-pdf/renderer";

export const parseHtmlContent = (
  html: string,
): (React.ReactNode | string)[] | string => {
  if (!html) return "Tidak ada catatan pembahasan.";

  let text = html;

  // 1. Bersihkan karakter tak terlihat (unicode gaib)
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");

  // 2. Proses isi list (<li>) LEBIH DULU
  // Konversi <p> dan <br> di dalam list menjadi enter (\n)
  text = text.replace(
    /<li[^>]*>([\s\S]*?)<\/li>/gi,
    (_match: string, content: string) => {
      let c = content.replace(/<\/?(p|div|h[1-6])[^>]*>/gi, "\n");
      c = c.replace(/<br\s*\/?>/gi, "\n");
      return `<li>${c.trim()}</li>`;
    },
  );

  // 3. Proses List (ul/ol)
  text = text.replace(
    /<ul[^>]*>([\s\S]*?)<\/ul>/gi,
    (_match: string, inner: string) => {
      const list = inner.replace(
        /<li>([\s\S]*?)<\/li>/gi,
        (_m: string, content: string) => `\n• ${content}`,
      );
      return `\n${list}\n\n`;
    },
  );

  text = text.replace(
    /<ol[^>]*>([\s\S]*?)<\/ol>/gi,
    (_match: string, inner: string) => {
      let i = 1;
      const list = inner.replace(
        /<li>([\s\S]*?)<\/li>/gi,
        (_m: string, content: string) => `\n${i++}. ${content}`,
      );
      return `\n${list}\n\n`;
    },
  );

  // 4. Konversi blok elemen luar dan break menjadi newline
  text = text.replace(/<\/(p|div|h[1-6])>/gi, "\n\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // 5. Buang tag HTML lainnya kecuali formatting (strong, b, i, em, u)
  // 🔥 FIX TYPESCRIPT: Parameter `match` dihapus karena tidak digunakan
  text = text.replace(/<(\/?)(?!strong|b|i|em|u)[a-z0-9]+[^>]*>/gi, () => "");

  // 6. Decode entitas HTML dasar
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // 7. Normalisasi spasi dan newline
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/ \n/g, "\n").replace(/\n /g, "\n");
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  // 8. Tokenisasi Style (Bold, Italic, Underline)
  const tokens = text.split(/(<\/?(?:strong|b|i|em|u)[^>]*>)/gi);
  let isBold = false;
  let isItalic = false;
  let isUnderline = false;

  const result: (React.ReactNode | string)[] = [];

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

      // Memecah token berdasarkan \n dan memasukkan \n sebagai string literal.
      const textParts = token.split(/(\n)/g);
      textParts.forEach((part, pIdx) => {
        if (part === "\n") {
          result.push("\n");
        } else if (part) {
          result.push(
            <Text
              key={`${index}-${pIdx}`}
              style={{
                fontFamily,
                textDecoration: isUnderline ? "underline" : "none",
              }}
            >
              {part}
            </Text>,
          );
        }
      });
    }
  });

  return result;
};
