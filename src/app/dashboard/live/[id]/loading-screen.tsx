import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
  progress: number;
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div className="flex flex-col justify-center items-center h-[60vh] space-y-4 max-w-sm mx-auto p-4 text-center font-sans">
      <Loader2 className="animate-spin h-10 w-10 text-[#0866ff]" />
      <p className="font-semibold text-gray-700">Menyiapkan Ruang Rapat...</p>
      <Progress
        value={progress}
        className="w-full h-1.5 [&>div]:bg-[#0866ff]"
      />
    </div>
  );
}
