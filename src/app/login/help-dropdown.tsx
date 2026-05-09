"use client";

import Link from "next/link";
import { BookOpen, PlayCircle } from "lucide-react";

export function HelpDropdown() {
  return (
    <div className="flex items-center gap-5">
      <Link
        href="https://drive.google.com/file/d/11eawgLNMwFTX_IfgW4doaDxkbZZ-Fhxq/view?usp=drive_link"
        target="_blank"
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <BookOpen className="h-3.5 w-3.5" />
        Buku Panduan
      </Link>
      <span className="text-muted-foreground/30 text-xs">·</span>
      <Link
        href="https://youtube.com"
        target="_blank"
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <PlayCircle className="h-3.5 w-3.5" />
        Video Tutorial
      </Link>
    </div>
  );
}
