import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LocationSection = () => {
  const handleNavigate = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const coords = "59.9311,30.3609"; // Примерные координаты Санкт-Петербурга
    
    if (isMobile) {
      window.open(`yandexnavi://build_route_on_map?lat_to=59.9311&lon_to=30.3609`, "_blank");
    } else {
      window.open(`https://yandex.ru/maps/?rtext=~59.9311,30.3609`, "_blank");
    }
  };

  return (
    <section id="location" className="py-16 md:py-20 bg-secondary/30 scroll-mt-24">
      <div className="container mx-auto px-4">
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
                    Санкт-Петербург, ул. Примерная, д. 123
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Время работы: Пн-Вс 9:00 - 21:00
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
                  <a href="tel:+79219103850" className="font-medium hover:text-primary transition-colors">
                    +7 (921) 910-38-50
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

          <div className="relative h-[400px] lg:h-[500px] rounded-xl overflow-hidden shadow-lg">
            <iframe
              src="https://yandex.ru/map-widget/v1/?ll=30.361,59.931&z=12&l=map"
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
