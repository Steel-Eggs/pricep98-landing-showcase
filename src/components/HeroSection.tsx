import { useState, useEffect } from "react";
import trailerImage from "@/assets/trailer-hero.webp";
import { CallbackModal } from "./CallbackModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export const HeroSection = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 12,
    minutes: 30,
    seconds: 0,
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    
    if (match) {
      let formatted = "+7";
      if (match[2]) formatted += ` (${match[2]}`;
      if (match[3]) formatted += `) ${match[3]}`;
      if (match[4]) formatted += `-${match[4]}`;
      if (match[5]) formatted += `-${match[5]}`;
      return formatted;
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !agreed) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }
    toast.success("Спасибо! Мы скоро свяжемся с вами");
    setName("");
    setPhone("");
    setAgreed(false);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-background py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 relative">
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Более 50 моделей легковых прицепов!
              </h1>
              <div className="inline-block bg-accent text-accent-foreground px-6 py-3 rounded-lg shadow-lg">
                <p className="text-xl md:text-2xl font-bold mb-1">Прицеп Титан 2013-05</p>
                <p className="text-lg">со СКИДКОЙ 10%</p>
              </div>
            </div>

            <div className="relative mb-8 animate-scale-in">
              <img 
                src={trailerImage} 
                alt="Прицеп Титан 2013-05" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl animate-slide-up">
              <p className="text-center text-lg md:text-xl font-semibold mb-6 text-foreground">
                АКЦИЯ<br />
                До конца акции осталось
              </p>
              
              <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-2xl mx-auto">
                {[
                  { value: timeLeft.days, label: "дней" },
                  { value: timeLeft.hours, label: "часов" },
                  { value: timeLeft.minutes, label: "минут" },
                  { value: timeLeft.seconds, label: "секунд" },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="bg-primary text-primary-foreground rounded-xl p-3 md:p-6 shadow-lg mb-2">
                      <span className="text-3xl md:text-5xl font-bold block">
                        {String(item.value).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-xs md:text-sm text-muted-foreground font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl p-6 shadow-xl border border-border sticky top-24 animate-fade-in">
              <h3 className="text-xl font-bold mb-6 text-center">Отправить заявку</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="hero-name">Имя</Label>
                  <Input
                    id="hero-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hero-phone">Телефон</Label>
                  <Input
                    id="hero-phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (___) ___-__-__"
                    className="mt-1"
                  />
                </div>
                
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="hero-agree"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  />
                  <label htmlFor="hero-agree" className="text-xs text-muted-foreground leading-tight cursor-pointer">
                    Я согласен с политикой конфиденциальности
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent-hover transition-all shadow-md"
                >
                  Отправить
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
