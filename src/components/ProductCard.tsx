import { useState } from "react";
import { Button } from "@/components/ui/button";
import trailerImage from "@/assets/trailer-hero.webp";

interface ProductCardProps {
  name: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  availability: string;
  onClick: () => void;
}

export const ProductCard = ({ name, price, oldPrice, discount, availability, onClick }: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className="bg-card rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-border cursor-pointer group"
      onClick={onClick}
    >
      {discount && (
        <div className="relative">
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
            {discount}
          </span>
        </div>
      )}
      
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted"></div>
        )}
        <img
          src={trailerImage}
          alt={name}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      <div className="p-4">
        <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded mb-2">
          {availability}
        </span>
        
        <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        <div className="flex items-end justify-between mb-4">
          <div>
            {oldPrice && (
              <p className="text-sm text-muted-foreground line-through">
                {oldPrice}
              </p>
            )}
            <p className="text-2xl font-bold text-foreground">
              {price}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="hover:bg-primary hover:text-primary-foreground transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Подробнее
          </Button>
          <Button 
            variant="default"
            size="sm"
            className="bg-accent hover:bg-accent-hover transition-all"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Узнать цену
          </Button>
        </div>
      </div>
    </div>
  );
};
