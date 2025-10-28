import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import trailerImage from "@/assets/trailer-hero.webp";

interface Product {
  id: string;
  name: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  availability: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <img
              src={trailerImage}
              alt={product.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          <div className="space-y-4">
            {product.discount && (
              <span className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold">
                {product.discount}
              </span>
            )}

            <div>
              {product.oldPrice && (
                <p className="text-lg text-muted-foreground line-through">
                  {product.oldPrice}
                </p>
              )}
              <p className="text-4xl font-bold text-foreground">
                {product.price}
              </p>
            </div>

            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm font-medium text-primary">{product.availability}</p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <h3 className="font-bold text-foreground text-base">Характеристики:</h3>
              <p>• Грузоподъемность: до 750 кг</p>
              <p>• Размеры кузова: 2.0 x 1.3 м</p>
              <p>• Тормозная система: наката</p>
              <p>• Рессорная подвеска</p>
              <p>• Оцинкованный кузов</p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <h3 className="font-bold text-foreground text-base">В комплекте:</h3>
              <p>• Колёса R13</p>
              <p>• Тент и дуги</p>
              <p>• Светотехника</p>
              <p>• Документы</p>
            </div>

            <Button 
              className="w-full bg-accent hover:bg-accent-hover transition-all shadow-md"
              size="lg"
            >
              Узнать подробности
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
