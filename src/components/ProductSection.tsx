import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";

interface Product {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  availability: string;
}

interface ProductSectionProps {
  id: string;
  title: string;
  products: Product[];
}

export const ProductSection = ({ id, title, products }: ProductSectionProps) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const displayedProducts = showAll ? products : products.slice(0, 4);

  return (
    <section id={id} className="py-16 md:py-20 scroll-mt-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          {title}
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {displayedProducts.map((product, idx) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <ProductCard
                {...product}
                onClick={() => setSelectedProduct(product)}
              />
            </div>
          ))}
        </div>

        {products.length > 4 && (
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAll(!showAll)}
              className="hover:bg-primary hover:text-primary-foreground transition-all shadow-md"
            >
              {showAll ? "Свернуть" : "Показать все модели"}
              <ChevronDown
                className={`ml-2 w-5 h-5 transition-transform ${
                  showAll ? "rotate-180" : ""
                }`}
              />
            </Button>
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
};
