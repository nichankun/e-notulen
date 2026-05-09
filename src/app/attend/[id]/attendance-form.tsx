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
import { Loader2 } from "lucide-react";

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
        className="space-y-5 border rounded-xl p-6 bg-card"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Dr. H. Budi Santoso" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instansi / Bidang</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Bidang Pajak" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peran</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pimpinan">Pimpinan</SelectItem>
                    <SelectItem value="pejabat">Pejabat</SelectItem>
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
              <div className="flex items-center justify-between">
                <FormLabel>Tanda Tangan</FormLabel>
                <button
                  type="button"
                  onClick={() => {
                    sigCanvas.current?.clear();
                    form.setValue("signature", "");
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Hapus
                </button>
              </div>
              <FormControl>
                <div
                  ref={containerRef}
                  className="w-full border rounded-lg bg-muted/20 overflow-hidden"
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
                      height: 120,
                      className: "cursor-crosshair w-full",
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <p className="text-xs text-muted-foreground">
          1 perangkat hanya untuk 1 nama. Absen ulang dengan nama yang sama
          untuk merevisi data.
        </p>

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            "Kirim Presensi"
          )}
        </Button>
      </form>
    </Form>
  );
}
