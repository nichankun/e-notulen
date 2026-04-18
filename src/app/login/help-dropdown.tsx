"use client";

import Link from "next/link";
import { HelpCircle, ChevronDown, BookOpen, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function HelpDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 h-8 rounded-full px-4 border border-transparent hover:border-border"
        >
          <HelpCircle className="h-3.5 w-3.5 mr-2" />
          Pusat Bantuan
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-64 rounded-xl shadow-xl p-2 border-border"
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Pusat Bantuan
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg">
          <Link
            href="https://drive.google.com/file/d/11eawgLNMwFTX_IfgW4doaDxkbZZ-Fhxq/view?usp=drive_link"
            target="_blank"
            className="flex gap-3"
          >
            <div className="bg-primary/10 p-2 rounded-md shrink-0">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">
                Buku Panduan
              </span>
              <span className="text-[10px] text-muted-foreground">
                Baca tata cara penggunaan.
              </span>
            </div>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg">
          <Link
            href="https://youtube.com"
            target="_blank"
            className="flex gap-3"
          >
            <div className="bg-destructive/10 p-2 rounded-md shrink-0">
              <PlayCircle className="h-4 w-4 text-destructive" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-foreground">
                Video Tutorial
              </span>
              <span className="text-[10px] text-muted-foreground">
                Tonton langkah visual.
              </span>
            </div>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
