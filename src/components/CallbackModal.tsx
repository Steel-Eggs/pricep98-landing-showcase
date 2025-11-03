import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CallbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CallbackModal = ({ open, onOpenChange }: CallbackModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "").substring(0, 10); // Ограничение на 10 цифр
    
    if (!cleaned) return ""; // Если нет цифр, возвращаем пустую строку
    
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    
    if (match) {
      let formatted = "+7";
      if (match[1]) formatted += ` (${match[1]}`;
      if (match[2]) formatted += `) ${match[2]}`;
      if (match[3]) formatted += `-${match[3]}`;
      if (match[4]) formatted += `-${match[4]}`;
      return formatted;
    }
    return "";
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !agreed) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    try {
      const { error } = await supabase.functions.invoke("send-order-notification", {
        body: {
          type: "callback",
          name,
          phone,
        },
      });

      if (error) throw error;

      toast.success("Спасибо! Мы скоро свяжемся с вами");
      setName("");
      setPhone("");
      setAgreed(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending callback request:", error);
      toast.error("Произошла ошибка. Попробуйте позже");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogTitle className="text-xl font-bold">Обратный звонок</DialogTitle>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+7 (___) ___-__-__"
              className="mt-1"
            />
          </div>
          
          <div className="flex items-start gap-2">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label htmlFor="agree" className="text-xs text-muted-foreground leading-tight cursor-pointer">
              Я согласен с политикой конфиденциальности
            </label>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent-hover transition-all"
          >
            Отправить
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
