import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DecorativeBlob } from "./DecorativeBlob";
import { useSiteSetting } from "@/hooks/useSiteSettings";

export const LocationSection = () => {
  const addressFull = useSiteSetting("address_full");
  const workingHours = useSiteSetting("working_hours");
  const phone = useSiteSetting("phone");
  const coordinates = useSiteSetting("coordinates");

  const handleNavigate = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const coords = coordinates || "59.9311,30.3609";
    const [lat, lon] = coords.split(",");
    
    if (isMobile) {
      window.open(`yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lon}`, "_blank");
    } else {
      window.open(`https://yandex.ru/maps/?rtext=~${coords}`, "_blank");
    }
  };

  return (
    <section id="location" className="relative py-16 md:py-20 bg-secondary/30 scroll-mt-24 overflow-hidden">
      {/* Decorative Elements */}
      <DecorativeBlob color="primary" size="xl" className="top-0 right-0 opacity-15" />
      <DecorativeBlob color="accent" size="lg" className="bottom-0 left-0 opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Где купить
        </h2>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-md border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Наш адрес</h3>
                  <p className="text-muted-foreground mb-4">
                    {addressFull || "Санкт-Петербург, ул. Примерная, д. 123"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Время работы: {workingHours || "Пн-Вс 9:00 - 21:00"}
                  </p>
                  <Button
                    onClick={handleNavigate}
                    className="bg-primary hover:bg-primary-hover transition-all"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Построить маршрут
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md border border-border">
              <h3 className="font-bold text-lg mb-4">Контакты</h3>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="text-muted-foreground">Телефон:</span>{" "}
                  <a href={`tel:${phone.replace(/\D/g, '')}`} className="font-medium hover:text-primary transition-colors">
                    {phone || "+7 (921) 910-38-50"}
                  </a>
                </p>
                <p>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <a href="mailto:info@pricep98.ru" className="font-medium hover:text-primary transition-colors">
                    info@pricep98.ru
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20">
            {/* Decorative map frame */}
            <div className="absolute inset-0 rounded-xl border-4 border-transparent bg-gradient-to-br from-primary/30 via-transparent to-accent/30 pointer-events-none z-10"></div>
            <iframe
              src={`https://yandex.ru/map-widget/v1/?ll=${coordinates ? coordinates.split(',').reverse().join(',') : '30.361,59.931'}&z=12&l=map`}
              width="100%"
              height="100%"
              frameBorder="0"
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};
