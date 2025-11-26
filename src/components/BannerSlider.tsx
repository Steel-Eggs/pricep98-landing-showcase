import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActiveBanners } from "@/hooks/useBanners";
import { cn } from "@/lib/utils";

export const BannerSlider = () => {
  const { data: banners, isLoading } = useActiveBanners();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 3000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [emblaApi, banners]);

  if (isLoading || !banners || banners.length === 0) {
    return (
      <section className="relative w-full h-[500px] bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
    );
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {banners.map((banner) => (
            <div key={banner.id} className="embla__slide flex-[0_0_100%] min-w-0">
              <div
                className={cn(
                  "relative w-full h-[500px] lg:h-[600px] flex items-center justify-center",
                  "bg-gradient-to-br",
                  banner.background_gradient
                )}
                style={
                  banner.image_url
                    ? {
                        backgroundImage: `linear-gradient(to bottom right, rgba(0,0,0,0.6), rgba(0,0,0,0.4)), url(${banner.image_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                <div className="container mx-auto px-4 z-10">
                  <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                      {banner.title}
                    </h1>
                    {banner.subtitle && (
                      <p className="text-lg md:text-xl lg:text-2xl text-white/90 drop-shadow-md max-w-3xl mx-auto">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.button_text && banner.button_url && (
                      <div className="pt-4">
                        <Button
                          size="lg"
                          variant="secondary"
                          className="text-lg px-8 py-6 hover-scale"
                          onClick={() => {
                            if (banner.button_url?.startsWith("#")) {
                              document
                                .querySelector(banner.button_url)
                                ?.scrollIntoView({ behavior: "smooth" });
                            } else {
                              window.location.href = banner.button_url || "#";
                            }
                          }}
                        >
                          {banner.button_text}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      {banners.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-white/20 text-white"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-white/20 text-white"
            onClick={scrollNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className="w-2 h-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
