import { useState, useEffect } from "react";
import trailerImage from "@/assets/trailer-hero.webp";
import { CallbackModal } from "./CallbackModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { DecorativeBlob } from "./DecorativeBlob";

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
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Decorative Blobs */}
      <DecorativeBlob color="primary" size="xl" className="top-10 -left-20 opacity-30" />
      <DecorativeBlob color="accent" size="lg" className="bottom-20 right-10 opacity-20" />
      <DecorativeBlob color="primary" size="md" className="top-1/3 right-1/4 opacity-25" />
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={trailerImage} 
          alt="Прицеп Титан 2013-05" 
          className="w-full h-full object-cover"
        />
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/40"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Left Section: Title, Offer, and Timer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Offer */}
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                Более 50 моделей легковых прицепов!
              </h1>
              <div className="inline-block bg-accent text-accent-foreground px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg">
                <p className="text-lg md:text-xl lg:text-2xl font-bold">Прицеп Титан 2013-05</p>
                <p className="text-base md:text-lg">со СКИДКОЙ 10%</p>
              </div>
            </div>

            {/* Timer */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl animate-scale-in max-w-2xl">
              <p className="text-center text-base md:text-lg font-semibold mb-4 text-foreground">
                АКЦИЯ • До конца акции осталось
              </p>
              
              <div className="grid grid-cols-4 gap-2 md:gap-4">
                {[
                  { value: timeLeft.days, label: "дней" },
                  { value: timeLeft.hours, label: "часов" },
                  { value: timeLeft.minutes, label: "минут" },
                  { value: timeLeft.seconds, label: "секунд" },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="bg-primary text-primary-foreground rounded-lg md:rounded-xl p-2 md:p-4 shadow-lg mb-1 md:mb-2">
                      <span className="text-2xl md:text-4xl lg:text-5xl font-bold block">
                        {String(item.value).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-xs md:text-sm text-foreground font-medium">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section: Contact Form */}
          <div className="lg:col-span-1">
            <div className="relative bg-card/95 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-xl border-2 border-primary/30 animate-fade-in">
              {/* Glowing border effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 blur-xl -z-10"></div>
              <h3 className="text-lg md:text-xl font-bold mb-4 text-center">Отправить заявку</h3>
              
              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div>
                  <Label htmlFor="hero-name" className="text-sm">Имя</Label>
                  <Input
                    id="hero-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hero-phone" className="text-sm">Телефон</Label>
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
