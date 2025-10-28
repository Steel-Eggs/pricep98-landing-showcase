import { Award } from "lucide-react";

export const QualityBadge = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative mb-8 animate-scale-in">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
              <Award className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">№1</span>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
            ПРИЦЕПЫ<span className="text-primary">98</span>
          </h2>
          
          <div className="relative">
            <p className="text-xl md:text-2xl font-semibold text-muted-foreground mb-2 animate-slide-up">
              лучший продавец прицепов 2024 года
            </p>
            <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
