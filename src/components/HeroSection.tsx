import { useState, useEffect } from "react";
import trailerImage from "@/assets/trailer-hero.webp";
import { CallbackModal } from "./CallbackModal";
import { ProductModal } from "./ProductModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { DecorativeBlob } from "./DecorativeBlob";
import { Sparkles } from "lucide-react";

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
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const titanProduct = {
    id: "11",
    name: "Титан 2013-05",
    price: "от 155 000 ₽",
    oldPrice: "от 172 000 ₽",
    availability: "В наличии",
    discount: "СКИДКА 10%"
  };

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
    <section className="relative min-h-[85vh] flex items-start overflow-hidden pt-20">
      {/* Decorative Blobs */}
      <DecorativeBlob color="primary" size="xl" className="top-10 -left-20 opacity-30" />
      <DecorativeBlob color="accent" size="lg" className="bottom-20 right-10 opacity-20" />
      <DecorativeBlob color="primary" size="md" className="top-1/3 right-1/4 opacity-25" />
      
      {/* Background Image with zoom animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src={trailerImage} 
          alt="Прицеп Титан 2013-05" 
          className="w-full h-full object-cover animate-zoom-slow brightness-110 contrast-125"
        />
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/40"></div>
      </div>

      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Left Section: Title, Offer, and Timer */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground relative inline-block mb-6">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                  Более 50 моделей
                </span>
                <br />
                <span className="relative">
                  легковых прицепов!
                  <Sparkles className="absolute -top-2 -right-8 w-6 h-6 text-accent animate-pulse" />
                </span>
              </h1>
            </div>

            {/* Timer */}
            <div className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-2xl animate-scale-in max-w-2xl border-2 border-accent/20">
              <div className="text-center mb-6">
                <span className="inline-block bg-gradient-to-r from-accent to-primary text-white px-6 py-2 rounded-full text-xl md:text-2xl font-black tracking-wider shadow-lg animate-pulse">
                  🔥 АКЦИЯ 🔥
                </span>
                <p className="text-sm md:text-base font-semibold mt-2 text-foreground">
                  До конца акции осталось
                </p>
              </div>
              
              <div className="grid grid-cols-4 gap-3 md:gap-4">
                {[
                  { value: timeLeft.days, label: "дней" },
                  { value: timeLeft.hours, label: "часов" },
                  { value: timeLeft.minutes, label: "минут" },
                  { value: timeLeft.seconds, label: "секунд" },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="bg-gradient-to-br from-primary to-primary-hover text-primary-foreground rounded-xl p-3 md:p-5 shadow-xl mb-2 border-2 border-white/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/20"></div>
                      <span className="text-3xl md:text-5xl lg:text-6xl font-black block relative z-10 drop-shadow-lg">
                        {String(item.value).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-xs md:text-sm text-foreground font-bold uppercase tracking-wide">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section: Contact Form */}
          <div className="lg:col-span-1 space-y-4">
            {/* Discount Offer Banner */}
            <button 
              onClick={() => setIsProductModalOpen(true)}
              className="w-full bg-accent text-accent-foreground px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg hover:scale-105 transition-all cursor-pointer animate-glow-pulse"
            >
              <p className="text-lg md:text-xl lg:text-2xl font-bold">Прицеп Титан 2013-05</p>
              <p className="text-base md:text-lg">со СКИДКОЙ 10%</p>
            </button>

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

      {/* Product Modal */}
      <ProductModal 
        product={titanProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </section>
  );
};
