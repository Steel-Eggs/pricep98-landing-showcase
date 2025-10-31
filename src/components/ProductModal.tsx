import { X } from "lucide-react";
import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

type TentType = "h-1220" | "none" | "sloped";

interface Accessory {
  id: string;
  name: string;
  price: number;
}

const TENT_IMAGES: Record<TentType, string> = {
  "h-1220": trailerImage, // Заменить на 3519-32-31-1000.webp
  "none": trailerImage,    // Заменить на 3519-32-00-1000.webp
  "sloped": trailerImage   // Заменить на 3519-32-41-1000.webp
};

const ACCESSORIES: Accessory[] = [
  { id: "acc1", name: "Дополнительное колесо R13", price: 3500 },
  { id: "acc2", name: "Усиленная сцепка", price: 4200 },
  { id: "acc3", name: "Противооткатные упоры", price: 1800 },
  { id: "acc4", name: "Запасной тент", price: 8500 },
  { id: "acc5", name: "Светодиодная подсветка", price: 2400 }
];

export const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const [selectedTent, setSelectedTent] = useState<TentType>("h-1220");
  const [selectedAccessories, setSelectedAccessories] = useState<Set<string>>(new Set());

  if (!product) return null;

  const basePrice = parseInt(product.price.replace(/\D/g, ""));

  const totalPrice = useMemo(() => {
    let total = basePrice;
    selectedAccessories.forEach(accId => {
      const accessory = ACCESSORIES.find(a => a.id === accId);
      if (accessory) total += accessory.price;
    });
    return total;
  }, [basePrice, selectedAccessories]);

  const handleAccessoryToggle = (accId: string) => {
    const newSet = new Set(selectedAccessories);
    if (newSet.has(accId)) {
      newSet.delete(accId);
    } else {
      newSet.add(accId);
    }
    setSelectedAccessories(newSet);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-foreground">{product.name}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <img
                src={TENT_IMAGES[selectedTent]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Column - Parameters & Price */}
          <div className="space-y-6">
            {/* Discount Badge */}
            {product.discount && (
              <span className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold">
                {product.discount}
              </span>
            )}

            {/* Price */}
            <div>
              {product.oldPrice && (
                <p className="text-lg text-muted-foreground line-through">
                  {product.oldPrice}
                </p>
              )}
              <p className="text-5xl font-bold text-foreground">
                {totalPrice.toLocaleString('ru-RU')} ₽
              </p>
            </div>

            {/* Availability */}
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm font-medium text-primary">{product.availability}</p>
            </div>

            {/* Tent Type Selection */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-foreground">Тип тента:</h3>
              <div className="space-y-2">
                <Label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                  <input
                    type="radio"
                    name="tent"
                    value="h-1220"
                    checked={selectedTent === "h-1220"}
                    onChange={() => setSelectedTent("h-1220")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">С тентом h-1220 (по умолчанию)</span>
                </Label>
                
                <Label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                  <input
                    type="radio"
                    name="tent"
                    value="none"
                    checked={selectedTent === "none"}
                    onChange={() => setSelectedTent("none")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Нет тента</span>
                </Label>
                
                <Label className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-accent/5 transition-colors">
                  <input
                    type="radio"
                    name="tent"
                    value="sloped"
                    checked={selectedTent === "sloped"}
                    onChange={() => setSelectedTent("sloped")}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Тент со скосом</span>
                </Label>
              </div>
            </div>

            {/* Accessories */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-foreground">Комплектующие:</h3>
              <Card className="p-4 space-y-3">
                {ACCESSORIES.map(accessory => (
                  <Label
                    key={accessory.id}
                    className="flex items-center justify-between cursor-pointer p-2 hover:bg-accent/5 rounded transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedAccessories.has(accessory.id)}
                        onCheckedChange={() => handleAccessoryToggle(accessory.id)}
                      />
                      <span className="text-sm">{accessory.name}</span>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      +{accessory.price.toLocaleString('ru-RU')} ₽
                    </span>
                  </Label>
                ))}
              </Card>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full bg-accent hover:bg-accent/90 transition-all shadow-md"
              size="lg"
            >
              Узнать подробности
            </Button>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="description" className="mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="specifications">Характеристики</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="space-y-4 mt-6">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-bold text-foreground mb-3">О товаре</h3>
              <p className="text-muted-foreground leading-relaxed">
                Легковой прицеп — надёжное решение для перевозки грузов. Прочная конструкция 
                с оцинкованным кузовом гарантирует долговечность и защиту от коррозии. 
                Рессорная подвеска обеспечивает плавный ход и безопасность груза.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                В стандартной комплектации прицеп оснащён тормозной системой наката, 
                полным комплектом светотехники и всеми необходимыми документами для 
                регистрации в ГИБДД.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Технические характеристики</h3>
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Грузоподъёмность:</span>
                  <span className="font-medium">до 750 кг</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Размеры кузова:</span>
                  <span className="font-medium">2.0 × 1.3 м</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Высота борта:</span>
                  <span className="font-medium">0.35 м</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Колёса:</span>
                  <span className="font-medium">R13</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Тормозная система:</span>
                  <span className="font-medium">наката</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Подвеска:</span>
                  <span className="font-medium">рессорная</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Покрытие кузова:</span>
                  <span className="font-medium">оцинковка</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Гарантия:</span>
                  <span className="font-medium">12 месяцев</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-bold text-foreground mb-3">Комплектация:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Колёса R13 с покрышками</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Тент и дуги</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Полный комплект светотехники</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Документы для регистрации</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Инструкция по эксплуатации</span>
                  </li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
