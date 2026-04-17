import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FinishMeetingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFinish: () => void;
  isRouting: boolean;
}

export function FinishMeetingDialog({
  isOpen,
  onOpenChange,
  onFinish,
  isRouting,
}: FinishMeetingDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white rounded-2xl border-gray-100 p-6 md:p-8">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold text-gray-900 text-xl tracking-tight">
            Selesaikan Rapat?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-500 text-[15px] mt-2">
            Data absensi dan notulensi akan diarsipkan secara permanen. Anda
            tidak dapat mengubahnya lagi setelah ini.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3 mt-4">
          <AlertDialogCancel
            disabled={isRouting}
            className="rounded-full h-11 px-6 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium"
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onFinish();
            }}
            className="bg-[#0866ff] hover:bg-[#1877f2] text-white rounded-full h-11 px-6 font-bold transition-colors"
            disabled={isRouting}
          >
            {isRouting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Ya, Selesaikan"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
