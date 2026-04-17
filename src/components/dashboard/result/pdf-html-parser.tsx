import React from "react";
import { Text } from "@react-pdf/renderer";

export const parseHtmlContent = (html: string): React.ReactNode[] | string => {
  if (!html) return "Tidak ada catatan pembahasan.";

  let text = html;
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
  text = text.replace(/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/gi, "\n");
  text = text.replace(/<p[^>]*>\s*&nbsp;\s*<\/p>/gi, "\n");
  text = text.replace(/<p[^>]*>\s*<\/p>/gi, "");
  text = text.replace(
    /<li[^>]*>([\s\S]*?)<\/li>/gi,
    (_match, content) =>
      `<li>${content.replace(/<\/?(p|div)[^>]*>/gi, "")}</li>`,
  );
  text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_match, inner) => {
    let i = 1;
    return inner.replace(
      /<li>([\s\S]*?)<\/li>/gi,
      (_m: string, content: string) => `\n${i++}. ${content.trim()}`,
    );
  });
  text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_match, inner) =>
    inner.replace(
      /<li>([\s\S]*?)<\/li>/gi,
      (_m: string, content: string) => `\n• ${content.trim()}`,
    ),
  );
  text = text.replace(/<\/(p|div)>/gi, "\n\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(
    /<(\/?)([a-z0-9]+)[^>]*>/gi,
    (match, _slash, tagName: string) =>
      ["strong", "b", "i", "em", "u"].includes(tagName.toLowerCase())
        ? match
        : "",
  );
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n\s*\n/g, "\n\n");
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  const tokens = text.split(/(<\/?(?:strong|b|i|em|u)[^>]*>)/gi);
  let isBold = false,
    isItalic = false,
    isUnderline = false;
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
