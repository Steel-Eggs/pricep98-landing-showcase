import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSiteSetting } from "@/hooks/useSiteSettings";

interface TermsOfServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TermsOfServiceDialog = ({ open, onOpenChange }: TermsOfServiceDialogProps) => {
  const termsOfService = useSiteSetting("terms_of_service");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Пользовательское соглашение</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {termsOfService || "Пользовательское соглашение загружается..."}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
