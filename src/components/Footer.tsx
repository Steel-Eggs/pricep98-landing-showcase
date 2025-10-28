import { Phone, Mail, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoMono from "@/assets/logo-mono.png";
import developerLogo from "@/assets/developer-logo.png";

export const Footer = () => {
  const menuItems = [
    { label: "Одноосные", href: "#single-axle" },
    { label: "Двуосные", href: "#dual-axle" },
    { label: "Для водной техники", href: "#water-tech" },
    { label: "К квадроциклам", href: "#quad" },
    { label: "Где купить", href: "#location" },
  ];

  return (
    <footer className="bg-gradient-to-br from-foreground to-foreground/90 text-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <img src={logoMono} alt="ПРИЦЕП98" className="h-10 mb-4" />
            <p className="text-sm text-background/70 mb-4">
              Качественные прицепы по доступным ценам с 2014 года
            </p>
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-xs ml-2 text-background/70">Рейтинг в Яндекс</span>
            </div>
            <div className="flex gap-3">
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              >
                <span className="text-sm font-bold">YT</span>
              </a>
              <a
                href="https://vk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-background/10 rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              >
                <span className="text-sm font-bold">VK</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Меню</h3>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Контакты</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                <a href="tel:+79219103850" className="text-background/70 hover:text-background transition-colors">
                  +7 (921) 910-38-50
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                <a href="mailto:info@pricep98.ru" className="text-background/70 hover:text-background transition-colors">
                  info@pricep98.ru
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-background/70">
                  Санкт-Петербург,<br />ул. Примерная, д. 123
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Быстрая связь</h3>
            <Button 
              className="w-full bg-accent hover:bg-accent-hover mb-4"
              size="lg"
            >
              <Phone className="w-4 h-4 mr-2" />
              Позвонить
            </Button>
            <div className="text-xs text-background/70 space-y-2">
              <a href="#" className="block hover:text-background transition-colors">
                Политика конфиденциальности
              </a>
              <a href="#" className="block hover:text-background transition-colors">
                Пользовательское соглашение
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-6 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 order-2 md:order-1">
              <img 
                src={developerLogo} 
                alt="Steel Eggs" 
                className="h-7 w-auto opacity-80 hover:opacity-100 transition-opacity" 
              />
              <span className="text-sm text-background/60">
                разработка и развитие сайтов
              </span>
            </div>
            
            <p className="text-sm text-background/70 order-1 md:order-2">
              2025 © Все права защищены. ПРИЦЕП98
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
