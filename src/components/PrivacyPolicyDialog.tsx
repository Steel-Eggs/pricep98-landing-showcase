import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSiteSetting } from "@/hooks/useSiteSettings";

interface PrivacyPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrivacyPolicyDialog = ({ open, onOpenChange }: PrivacyPolicyDialogProps) => {
  const privacyPolicy = useSiteSetting("privacy_policy");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Политика конфиденциальности</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {privacyPolicy || "Политика конфиденциальности загружается..."}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
