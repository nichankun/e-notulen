"use client";

import Image from "next/image";
import { Clock, Heart, Image as ImageIcon } from "lucide-react";

export function BrandingSection() {
  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left mt-8 md:mt-0">
      <h1 className="text-5xl md:text-6xl font-black text-primary tracking-tighter mb-4 md:mb-6">
        e-Notulen
      </h1>

      <h2 className="text-2xl sm:text-3xl md:text-4xl leading-snug md:leading-tight font-bold text-foreground mb-8 max-w-md px-4 md:px-0">
        Digitalisasi <br className="hidden lg:block" />
        laporan dan <br className="hidden lg:block" />
        <span className="text-primary lg:text-foreground">absensi rapat.</span>
      </h2>

      {/* Collage Ilustrasi */}
      <div className="relative h-72 w-full hidden lg:block mt-4">
        {/* Card 1 - Back */}
        <div className="absolute top-4 left-0 w-56 h-48 bg-card rounded-2xl border shadow-sm rotate-[-8deg] p-4 flex flex-col gap-2 transition-transform hover:rotate-[-5deg]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted"></div>
            <div className="w-24 h-3 rounded-full bg-muted"></div>
          </div>
          <div className="w-full h-24 bg-muted/50 rounded-xl mt-2 flex items-center justify-center">
            <ImageIcon className="text-muted-foreground/50 h-8 w-8" />
          </div>
        </div>

        {/* Card 2 - Main */}
        <div className="absolute top-0 left-24 w-60 h-64 bg-primary/5 rounded-2xl border shadow-2xl rotate-[4deg] p-3 flex flex-col z-10 backdrop-blur-sm transition-transform hover:rotate-2">
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="w-16 h-1 rounded-full bg-primary/20"></div>
            <div className="flex items-center gap-1 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
              <Clock className="w-3 h-3" /> 09:00
            </div>
          </div>
          <div className="flex-1 bg-primary/10 rounded-xl mb-2 overflow-hidden relative border border-primary/10">
            <Image
              src="/rapat.png"
              alt="Meeting"
              fill
              sizes="200px"
              className="object-cover opacity-80 mix-blend-multiply dark:mix-blend-screen"
              priority
            />
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-6 h-6 rounded-full border-2 border-background bg-primary -mr-3 z-20"></div>
            <div className="w-6 h-6 rounded-full border-2 border-background bg-blue-400 z-10"></div>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute top-36 left-12 w-12 h-12 bg-card rounded-full shadow-lg border flex items-center justify-center z-20 animate-bounce">
          <Heart className="h-5 w-5 text-destructive fill-destructive" />
        </div>
        <div className="absolute top-10 right-16 text-4xl z-0 opacity-80">
          📅
        </div>
      </div>
    </div>
  );
}
