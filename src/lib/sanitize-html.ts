const ALLOWED_TAGS = new Set([
  "p",
  "h3",
  "ul",
  "ol",
  "li",
  "strong",
  "b",
  "i",
  "em",
  "u",
  "br",
]);

/**
 * Keep only the small HTML subset used by the summary renderer and remove all
 * attributes. This prevents event handlers, URLs, styles, and active elements
 * from being persisted or rendered as trusted markup.
 */
export function sanitizeSummaryHtml(input: string): string {
  return input
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(
      /<\s*(\/?)\s*([a-z][a-z0-9:-]*)\b[^>]*>/gi,
      (tag, closing: string, rawName: string) => {
        const name = rawName.toLowerCase();
        if (!ALLOWED_TAGS.has(name)) return "";
        if (closing) return `</${name}>`;
        return name === "br" ? "<br>" : `<${name}>`;
      },
    )
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
}
