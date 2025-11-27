import { useEffect, useCallback, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useBanners } from '@/hooks/useBanners';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const BannerSlider = () => {
  const { data: banners, isLoading } = useBanners();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Auto-play every 3 seconds, pause on hover
  useEffect(() => {
    if (!emblaApi) return;

    const intervalId = setInterval(() => {
      if (!isPaused) {
        emblaApi.scrollNext();
      }
    }, 3000);

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      clearInterval(intervalId);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect, isPaused]);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] md:h-[500px] bg-muted animate-pulse flex items-center justify-center">
        <span className="text-muted-foreground">Загрузка...</span>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section 
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="embla__slide flex-[0_0_100%] min-w-0"
            >
              <div
                className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center bg-primary"
              >
                {/* Background image if exists */}
                {banner.image_url && (
                  <img
                    src={banner.image_url}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Content */}
                <div className="relative z-10 container mx-auto px-4 text-center text-white">
                  <h2 
                    className={cn(
                      "text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6",
                      "animate-fade-in drop-shadow-lg"
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {banner.title}
                  </h2>
                  
                  {banner.subtitle && (
                    <p 
                      className={cn(
                        "text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto mb-6 md:mb-8",
                        "animate-fade-in opacity-90 drop-shadow"
                      )}
                      style={{ animationDelay: `${index * 100 + 100}ms` }}
                    >
                      {banner.subtitle}
                    </p>
                  )}

                  {banner.button_text && banner.button_url && (
                    <a
                      href={banner.button_url}
                      className={cn(
                        "inline-block bg-white text-gray-900 px-8 py-3 rounded-lg",
                        "font-semibold text-lg hover:bg-opacity-90 transition-all",
                        "hover:scale-105 animate-fade-in shadow-xl"
                      )}
                      style={{ animationDelay: `${index * 100 + 200}ms` }}
                    >
                      {banner.button_text}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-12 h-12 backdrop-blur-sm"
            onClick={scrollPrev}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full w-12 h-12 backdrop-blur-sm"
            onClick={scrollNext}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                selectedIndex === index
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/70"
              )}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
