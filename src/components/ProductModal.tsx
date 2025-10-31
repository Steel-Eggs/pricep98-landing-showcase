import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import trailerNoTent from "@/assets/trailer-no-tent.webp";
import trailerH1220 from "@/assets/trailer-tent-h1220.webp";
import trailerSloped from "@/assets/trailer-tent-sloped.webp";

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

type WheelType = "R13" | "R16";
type HubType = "VAZ";
type TentType = "none" | "h-1220" | "sloped";

interface Accessory {
  id: string;
  name: string;
  price: number;
}

const TENT_IMAGES: Record<TentType, string> = {
  "h-1220": trailerH1220,
  "none": trailerNoTent,
  "sloped": trailerSloped
};

const ACCESSORIES: Accessory[] = [
  { id: "acc1", name: "Поворотный кронштейн опорного колеса", price: 2800 },
  { id: "acc2", name: "Дополнительное колесо R13", price: 3500 },
  { id: "acc3", name: "Усиленная сцепка", price: 4200 },
  { id: "acc4", name: "Противооткатные упоры", price: 1800 },
  { id: "acc5", name: "Запасной тент", price: 8500 }
];

export const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const [selectedWheel, setSelectedWheel] = useState<WheelType>("R13");
  const [selectedHub, setSelectedHub] = useState<HubType>("VAZ");
  const [selectedTent, setSelectedTent] = useState<TentType>("h-1220");
  const [selectedAccessories, setSelectedAccessories] = useState<Set<string>>(new Set());

  const basePrice = product ? parseInt(product.price.replace(/\D/g, "")) : 0;

  const totalPrice = useMemo(() => {
    let total = basePrice;
    selectedAccessories.forEach(accId => {
      const accessory = ACCESSORIES.find(a => a.id === accId);
      if (accessory) total += accessory.price;
    });
    return total;
  }, [basePrice, selectedAccessories]);

  if (!product) return null;

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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto animate-scale-in bg-gradient-to-br from-background via-background to-primary/5">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{product.name}</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Image & Tabs (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"></div>
              <div className="aspect-video rounded-xl overflow-hidden bg-muted shadow-lg border-2 border-border hover:border-primary/40 transition-all duration-300">
                <img
                  src={TENT_IMAGES[selectedTent]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>

            {/* Tabs Section moved here */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="description" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Описание</TabsTrigger>
                <TabsTrigger value="specifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Характеристики</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="space-y-4 mt-6">
                <div className="max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    "Титан 2ос 3519" - лучше всех справляется с большими нагрузками и идеально 
                    подходит для перевозки тяжёлых грузов: перевозка спец техники, грузоперевозки, 
                    бизнес.
                  </p>
                  
                  <h4 className="text-base font-bold text-foreground mt-4 mb-2">Особенности модели:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>- внутренний размер кузова 3.5 метра в длину и 1.9 метра в ширину для перевозок всего и массивного;</li>
                    <li>- эргономичная и лёгкая конструкция позволяет экономить на топливе;</li>
                    <li>- тормозная система прицепа обеспечивает безопасность и надёжность автомобиля;</li>
                    <li>- о коррозии можно забыть: на раму и дышло наносится защитное покрытие методом горячей оцинковки;</li>
                    <li>- дышло профильная 80х60х2 мм., а рама - 60х40х3 мм.;</li>
                    <li>- в комплекте идут 4 х листовые рессоры.</li>
                  </ul>

                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Передний и задний борт - откидные. На дно прицепа устанавливается влагостойкая 
                    фанера толщиной 9 мм.
                  </p>

                  <p className="text-muted-foreground leading-relaxed mt-3">
                    Официальная гарантия от нашего завода - 12 месяцев!
                  </p>

                  <p className="text-muted-foreground leading-relaxed mt-3 font-medium">
                    Будем рады видеть вас в числе покупателей нашей компании!
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-3 text-muted-foreground">Внешние размеры кузова, мм.</td>
                        <td className="py-3 font-medium text-right">3500х1960х330</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Parameters & Price (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Discount Badge */}
            {product.discount && (
              <span className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                {product.discount}
              </span>
            )}

            {/* Price */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border-2 border-primary/20">
              {product.oldPrice && (
                <p className="text-lg text-muted-foreground line-through">
                  {product.oldPrice}
                </p>
              )}
              <p className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {totalPrice.toLocaleString('ru-RU')} ₽
              </p>
            </div>

            {/* Availability */}
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <p className="text-sm font-medium text-primary">{product.availability}</p>
            </div>

            {/* Configuration Section */}
            <Card className="p-4 space-y-4 border-2 border-border hover:border-primary/20 transition-colors bg-gradient-to-br from-card to-card/50">
              {/* Wheel Selection */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-foreground">Колёса</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={selectedWheel === "R13" ? "default" : "outline"}
                    onClick={() => setSelectedWheel("R13")}
                    className="flex-1 hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    R13
                  </Button>
                  <Button
                    type="button"
                    variant={selectedWheel === "R16" ? "default" : "outline"}
                    onClick={() => setSelectedWheel("R16")}
                    className="flex-1 hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    R16
                  </Button>
                </div>
              </div>

              {/* Hub Selection */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-foreground">Ступица</h3>
                <Button
                  type="button"
                  variant="default"
                  className="w-full hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  ВАЗ
                </Button>
              </div>

              {/* Tent Type Selection */}
              <div className="space-y-3">
                <h3 className="font-bold text-base text-foreground">Тент и каркас</h3>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant={selectedTent === "none" ? "default" : "outline"}
                    onClick={() => setSelectedTent("none")}
                    className="w-full hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    Нет
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTent === "h-1220" ? "default" : "outline"}
                    onClick={() => setSelectedTent("h-1220")}
                    className="w-full hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    h-1220
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTent === "sloped" ? "default" : "outline"}
                    onClick={() => setSelectedTent("sloped")}
                    className="w-full hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    h-1220 скос
                  </Button>
                </div>
              </div>
            </Card>

            {/* Accessories */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-foreground">Комплектующие:</h3>
              <Card className="p-4 space-y-3 border-2 border-border hover:border-primary/20 transition-colors bg-gradient-to-br from-card to-card/50">
                {ACCESSORIES.map(accessory => (
                  <Label
                    key={accessory.id}
                    className="flex items-center justify-between cursor-pointer p-3 hover:bg-primary/10 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-primary/20"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedAccessories.has(accessory.id)}
                        onCheckedChange={() => handleAccessoryToggle(accessory.id)}
                      />
                      <span className="text-sm font-medium">{accessory.name}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      +{accessory.price.toLocaleString('ru-RU')} ₽
                    </span>
                  </Label>
                ))}
              </Card>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full transition-all shadow-lg hover:shadow-xl bg-red-600 hover:bg-red-700 text-white border-0 hover:-translate-y-1 transform"
              size="lg"
            >
              ЗАКАЗАТЬ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
