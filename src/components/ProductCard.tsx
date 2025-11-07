import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div 
      className="relative bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-border hover:border-primary/40 cursor-pointer group"
      onClick={onClick}
    >
      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      {product.discount_label && (
        <div className="relative">
          <span className="absolute top-3 left-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg">
            {product.discount_label}
          </span>
        </div>
      )}
      
      <div className="relative aspect-[4/3] bg-secondary overflow-hidden">
        {!product.base_image_url || imageError ? (
          <ProductImagePlaceholder name={product.name} className="w-full h-full" />
        ) : (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-muted"></div>
            )}
            <img
              src={product.base_image_url}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        )}
      </div>

      <div className="p-4">
        <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded mb-2">
          {product.availability}
        </span>
        
        <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        <div className="flex items-end justify-between mb-4">
          <div>
            {product.old_price && (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(product.old_price)}
              </p>
            )}
            <p className="text-2xl font-bold text-foreground">
              от {formatPrice(product.base_price)}
            </p>
          </div>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          className="w-full hover:bg-primary hover:text-primary-foreground transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Подробнее
        </Button>
      </div>
    </div>
  );
};
