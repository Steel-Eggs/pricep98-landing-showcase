import { useState } from "react";
import { Phone, MapPin, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";
import { CallbackModal } from "./CallbackModal";
import { useCategories } from "@/hooks/useCategories";
import { useSiteSetting } from "@/hooks/useSiteSettings";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const { data: categories } = useCategories();
  const addressCity = useSiteSetting("address_city");
  const phone = useSiteSetting("phone");

  const menuItems = [
    ...(categories?.map(cat => ({
      label: cat.name,
      href: `#${cat.slug}`
    })) || []),
    { label: "Где купить", href: "#location" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <div className="flex items-center gap-8">
            <img src={logo} alt="ПРИЦЕП98" className="h-10" />
            <p className="hidden lg:block text-sm text-muted-foreground">
              Ваша надёжность на дорогах
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">{addressCity || "Санкт-Петербург"}</span>
            </div>
            
            <a 
              href={`tel:${phone.replace(/\D/g, '')}`}
              className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
            >
              <Phone className="w-4 h-4" />
              {phone || "+7 (921) 910-38-50"}
            </a>
            
            <Button 
              onClick={() => setIsCallbackOpen(true)}
              variant="default"
              size="sm"
              className="hidden md:flex bg-accent hover:bg-accent-hover transition-all"
            >
              Обратный звонок
            </Button>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <nav className="hidden md:block py-4">
          <ul className="flex items-center justify-center gap-8">
            {menuItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {isMenuOpen && (
          <nav className="md:hidden py-4 animate-fade-in">
            <ul className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="pt-4 border-t border-border">
                <Button 
                  onClick={() => {
                    setIsCallbackOpen(true);
                    setIsMenuOpen(false);
                  }}
                  variant="default"
                  className="w-full bg-accent hover:bg-accent-hover"
                >
                  Обратный звонок
                </Button>
              </li>
            </ul>
          </nav>
        )}
      </div>

      <CallbackModal open={isCallbackOpen} onOpenChange={(open) => setIsCallbackOpen(open)} />
    </header>
  );
};
