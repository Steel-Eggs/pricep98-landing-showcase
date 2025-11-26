import { Award, Sparkles } from "lucide-react";
import logo from "@/assets/logo.svg";
import { DecorativeBlob } from "./DecorativeBlob";

export const QualityBadge = () => {
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
      {/* Decorative Elements */}
      <DecorativeBlob color="primary" size="lg" className="top-0 left-10 opacity-20" />
      <DecorativeBlob color="accent" size="md" className="bottom-0 right-10 opacity-25" />
      
      {/* Floating sparkles */}
      <Sparkles className="absolute top-10 left-1/4 w-8 h-8 text-primary/30 animate-pulse" />
      <Sparkles className="absolute bottom-20 right-1/3 w-6 h-6 text-accent/40 animate-pulse" style={{ animationDelay: "0.5s" }} />
      <Sparkles className="absolute top-1/2 right-10 w-5 h-5 text-primary/20 animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative mb-8 animate-scale-in">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl">
              <Award className="w-16 h-16 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">№1</span>
            </div>
          </div>
          
          <div className="mb-4 animate-fade-in">
            <img 
              src={logo} 
              alt="ПРИЦЕПЫ98" 
              className="h-16 md:h-20 lg:h-24 w-auto"
            />
          </div>
          
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
