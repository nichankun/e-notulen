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
import { Eraser, Loader2, CheckCircle2 } from "lucide-react";

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
        className="space-y-5 bg-card p-6 md:p-10 rounded-[2.5rem] border shadow-2xl"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest ml-1">
                Nama Lengkap
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Input nama lengkap..."
                  className="h-14 rounded-2xl bg-muted/30 border-none px-6"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest ml-1">
                  Unit Kerja
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Contoh: Bidang Pajak"
                    className="h-14 rounded-2xl bg-muted/30 border-none px-6"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest ml-1">
                  Peran
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none px-6">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="pimpinan">Pimpinan</SelectItem>
                    <SelectItem value="pejabat">Pejabat</SelectItem>
                    <SelectItem value="peserta">Staff</SelectItem>
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
              <div className="flex justify-between items-end px-1">
                <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                  Tanda Tangan
                </FormLabel>
                <button
                  type="button"
                  onClick={() => {
                    sigCanvas.current?.clear();
                    form.setValue("signature", "");
                  }}
                  className="text-[11px] text-destructive font-bold flex items-center gap-1"
                >
                  <Eraser className="size-3" /> RESET
                </button>
              </div>
              <FormControl>
                <div
                  ref={containerRef}
                  className="w-full border-2 border-dashed border-muted-foreground/20 rounded-[2rem] bg-muted/20 overflow-hidden"
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
                      height: 200,
                      className: "cursor-crosshair w-full",
                    }}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full h-16 rounded-full font-black text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              ABSEN SEKARANG <CheckCircle2 />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
