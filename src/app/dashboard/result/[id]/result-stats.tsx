import { Card } from "@/components/ui/card";
import { Users, Camera, Calendar, FileCheck } from "lucide-react";

interface ResultStatsProps {
  attendeeCount: number;
  photoCount: number;
  date: string;
}

export function ResultStats({
  attendeeCount,
  photoCount,
  date,
}: ResultStatsProps) {
  const dateLabel = new Date(date).toLocaleDateString("id-ID", {
    timeZone: "Asia/Makassar",
    day: "numeric",
    month: "short",
  });

  const items = [
    {
      icon: Users,
      color: "text-primary bg-primary/10",
      label: "Hadir",
      value: `${attendeeCount} Orang`,
    },
    {
      icon: Camera,
      color: "text-indigo-500 bg-indigo-500/10",
      label: "Dokumentasi",
      value: `${photoCount} Foto`,
    },
    {
      icon: Calendar,
      color: "text-orange-500 bg-orange-500/10",
      label: "Tanggal",
      value: dateLabel,
    },
    {
      icon: FileCheck,
      color: "text-emerald-500 bg-emerald-500/10",
      label: "Integritas",
      value: "Valid",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {items.map(({ icon: Icon, color, label, value }) => (
        <Card
          key={label}
          className="p-3 flex items-center gap-3 rounded-xl border border-border bg-card"
        >
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <p className="text-sm font-bold text-foreground truncate">
              {value}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}
