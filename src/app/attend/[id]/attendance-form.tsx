"use client";

import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eraser, Loader2, CheckCircle2, Info } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "Nama lengkap wajib diisi"),
  department: z.string().min(3, "Bidang/Unit wajib diisi"),
  role: z.enum(["pimpinan", "pejabat", "peserta"]),
  signature: z.string().min(1, "Tanda tangan wajib diisi"),
});

export function AttendanceForm({
  onSubmit,
}: {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
}) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(400);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", department: "", role: "peserta", signature: "" },
  });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current)
        setCanvasWidth(containerRef.current.offsetWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 bg-card/80 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] border shadow-xl"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest ml-1">
                  Nama Lengkap
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Dr. H. Budi Santoso"
                    className="h-12 rounded-xl bg-background border-muted-foreground/20 px-4 focus-visible:ring-primary"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest ml-1">
                    Instansi / Bidang
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Bidang Pajak"
                      className="h-12 rounded-xl bg-background border-muted-foreground/20 px-4 focus-visible:ring-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest ml-1">
                    Peran
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl bg-background border-muted-foreground/20 px-4 focus:ring-primary">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="pimpinan">Pimpinan</SelectItem>
                      <SelectItem value="pejabat">Kabid / Kasubbid</SelectItem>
                      <SelectItem value="peserta">Staff / Peserta</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="signature"
            render={() => (
              <FormItem>
                <div className="flex justify-between items-end px-1 mb-1">
                  <FormLabel className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">
                    Paraf Digital
                  </FormLabel>
                  <button
                    type="button"
                    onClick={() => {
                      sigCanvas.current?.clear();
                      form.setValue("signature", "");
                    }}
                    className="text-[10px] text-destructive font-bold flex items-center gap-1 hover:opacity-70 transition-opacity"
                  >
                    <Eraser className="size-3" /> HAPUS
                  </button>
                </div>
                <FormControl>
                  <div
                    ref={containerRef}
                    className="w-full border-2 border-dashed border-primary/30 rounded-2xl bg-muted/10 overflow-hidden focus-within:border-primary transition-colors"
                  >
                    <SignatureCanvas
                      ref={sigCanvas}
                      penColor="#000"
                      onEnd={() =>
                        form.setValue(
                          "signature",
                          sigCanvas.current
                            ?.getTrimmedCanvas()
                            .toDataURL("image/png") || "",
                          { shouldValidate: true },
                        )
                      }
                      canvasProps={{
                        width: canvasWidth,
                        height: 130, // DIKECILKAN agar lebih rapi
                        className: "cursor-crosshair w-full",
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />
        </div>

        {/* INFO BOX: Penjelasan Revisi vs Duplikat */}
        {/* <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex gap-3 text-sm">
          <Info className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-muted-foreground leading-relaxed text-[11px] md:text-xs">
            <strong className="text-foreground">Sistem Anti-Duplikat:</strong> 1
            Perangkat hanya untuk 1 Nama. Jika ada kesalahan penulisan bidang
            atau bentuk paraf, Anda dapat absen ulang untuk{" "}
            <strong>merevisi</strong> selama menggunakan nama yang persis sama.
          </div>
        </div> */}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full h-14 rounded-xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="animate-spin size-6" />
          ) : (
            <>
              Kirim Presensi <CheckCircle2 className="ml-2 size-5" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
