import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { CallbackModal } from "./CallbackModal";
import { useProductTents } from "@/hooks/useTents";
import { useAccessories } from "@/hooks/useAccessories";
import { useProductSpecifications } from "@/hooks/useProductDetails";
import { ProductImagePlaceholder } from "./ProductImagePlaceholder";
import type { Product } from "@/types/product";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductModal = ({ product, open, onOpenChange }: ProductModalProps) => {
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [selectedWheels, setSelectedWheels] = useState<string>(
    product.wheel_options?.default || "2 колеса R13"
  );
  const [selectedHub, setSelectedHub] = useState<string>(
    product.hub_options?.default || "Жигулевская ступица"
  );
  const [selectedTentId, setSelectedTentId] = useState<string | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<Set<string>>(new Set());

  const { data: productTents = [], isLoading: tentsLoading } = useProductTents(product.id);
  const { data: accessories = [], isLoading: accessoriesLoading } = useAccessories();
  const { data: specifications = [], isLoading: specificationsLoading } = useProductSpecifications(product.id);

  // Set default tent on load
  useEffect(() => {
    if (productTents.length > 0 && !selectedTentId) {
      const defaultTent = productTents.find(pt => pt.is_default);
      if (defaultTent) {
        setSelectedTentId(defaultTent.tent_id);
      }
    }
  }, [productTents, selectedTentId]);

  const selectedProductTent = productTents.find(pt => pt.tent_id === selectedTentId);
  const currentImage = selectedProductTent?.image_url || product.base_image_url;

  const totalPrice = useMemo(() => {
    let price = product.base_price;
    
    // Add tent price
    if (selectedProductTent) {
      price += selectedProductTent.price;
    }
    
    // Add accessories prices
    accessories.forEach(accessory => {
      if (selectedAccessories.has(accessory.id)) {
        price += accessory.default_price;
      }
    });
    
    return price;
  }, [product.base_price, selectedProductTent, accessories, selectedAccessories]);

  const handleAccessoryToggle = (accessoryId: string) => {
    const newSelected = new Set(selectedAccessories);
    if (newSelected.has(accessoryId)) {
      newSelected.delete(accessoryId);
    } else {
      newSelected.add(accessoryId);
    }
    setSelectedAccessories(newSelected);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleOrder = () => {
    setShowCallbackModal(true);
  };

  const handleCallbackSubmit = async (name: string, phone: string) => {
    try {
      const selectedAccessoryNames = accessories
        .filter(acc => selectedAccessories.has(acc.id))
        .map(acc => acc.name);

      const accessoriesPrices = accessories
        .filter(acc => selectedAccessories.has(acc.id))
        .map(acc => ({
          name: acc.name,
          price: acc.default_price,
        }));

      const { error } = await supabase.functions.invoke("send-order-notification", {
        body: {
          type: "order",
          productName: product.name,
          configuration: {
            wheels: selectedWheels,
            hub: selectedHub,
            tent: selectedProductTent?.tent?.name,
            accessories: selectedAccessoryNames,
          },
          basePrice: product.base_price,
          oldPrice: product.old_price,
          tentName: selectedProductTent?.tent?.name,
          tentPrice: selectedProductTent?.price,
          accessoriesPrices,
          totalPrice,
          name,
          phone,
          isFromHero: false,
        },
      });

      if (error) throw error;

      toast.success("Спасибо за заказ! Мы скоро свяжемся с вами");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending order:", error);
      toast.error("Произошла ошибка. Попробуйте позже");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto animate-scale-in bg-gradient-to-br from-background via-background to-primary/5">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {product.name}
            </DialogTitle>
          </DialogHeader>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Image & Tabs */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"></div>
                <div className="aspect-video rounded-xl overflow-hidden bg-muted shadow-lg border-2 border-border hover:border-primary/40 transition-all duration-300">
                  {!currentImage ? (
                    <ProductImagePlaceholder name={product.name} className="w-full h-full" />
                  ) : (
                    <>
                      <img
                        src={currentImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </>
                  )}
                </div>
              </div>

              {/* Tabs Section */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="description" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Описание
                  </TabsTrigger>
                  <TabsTrigger value="specifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Характеристики
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="space-y-4 mt-6">
                  {product.description ? (
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Описание скоро будет добавлено
                    </p>
                  )}
                  
                  {product.features && product.features.length > 0 && (
                    <ul className="space-y-2 text-sm">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>
                
                <TabsContent value="specifications" className="mt-6">
                  {specificationsLoading ? (
                    <p className="text-sm text-muted-foreground">Загрузка...</p>
                  ) : specifications.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <tbody>
                          {specifications.map((spec) => (
                            <tr key={spec.id} className="border-b border-border">
                              <td className="py-3 text-muted-foreground">{spec.spec_name}</td>
                              <td className="py-3 font-medium text-right">{spec.spec_value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Характеристики скоро будут добавлены
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Configuration & Price */}
            <div className="lg:col-span-1 space-y-6">
              {/* Discount Badge */}
              {product.discount_label && (
                <span className="inline-block bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                  {product.discount_label}
                </span>
              )}

              {/* Price */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-6 border-2 border-primary/20">
                {product.old_price && (
                  <p className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.old_price)}
                  </p>
                )}
                <p className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formatPrice(totalPrice)}
                </p>
              </div>

              {/* Availability */}
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                <p className="text-sm font-medium text-primary">{product.availability}</p>
              </div>

              {/* Configuration Section */}
              <div className="p-4 space-y-4 rounded-lg border-2 border-border hover:border-primary/20 transition-colors bg-gradient-to-br from-card to-card/50">
                {/* Wheel Selection */}
                {product.wheel_options?.options && product.wheel_options.options.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-base text-foreground">Колёса</h3>
                    <div className="flex gap-2">
                      {product.wheel_options.options.map((wheel) => (
                        <Button
                          key={wheel}
                          type="button"
                          variant={selectedWheels === wheel ? "default" : "outline"}
                          onClick={() => setSelectedWheels(wheel)}
                          className="flex-1 hover:shadow-lg transition-all hover:-translate-y-0.5"
                        >
                          {wheel}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hub Selection */}
                {product.hub_options?.options && product.hub_options.options.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-base text-foreground">Ступица</h3>
                    <div className="flex gap-2">
                      {product.hub_options.options.map((hub) => (
                        <Button
                          key={hub}
                          type="button"
                          variant={selectedHub === hub ? "default" : "outline"}
                          onClick={() => setSelectedHub(hub)}
                          className="flex-1 hover:shadow-lg transition-all hover:-translate-y-0.5"
                        >
                          {hub}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tent Selection */}
                {!tentsLoading && productTents.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-base text-foreground">Тент и каркас</h3>
                    <div className="flex flex-col gap-2">
                      {productTents.map((productTent) => (
                        <Button
                          key={productTent.tent_id}
                          type="button"
                          variant={selectedTentId === productTent.tent_id ? "default" : "outline"}
                          onClick={() => setSelectedTentId(productTent.tent_id)}
                          className="w-full hover:shadow-lg transition-all hover:-translate-y-0.5 flex justify-between items-center"
                        >
                          <span>{productTent.tent?.name || "Без названия"}</span>
                          <span className="text-xs opacity-70">
                            {productTent.price > 0 ? `+${formatPrice(productTent.price)}` : 
                             productTent.price < 0 ? formatPrice(productTent.price) : 
                             "базовая"}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accessories */}
              {!accessoriesLoading && accessories.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-foreground">Комплектующие:</h3>
                  <div className="p-4 space-y-3 rounded-lg border-2 border-border hover:border-primary/20 transition-colors bg-gradient-to-br from-card to-card/50">
                    {accessories.map((accessory) => (
                      <label
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
                          +{formatPrice(accessory.default_price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Button */}
              <Button
                size="lg"
                className="w-full text-lg py-6 hover:shadow-2xl transition-all hover:-translate-y-1"
                onClick={handleOrder}
              >
                ЗАКАЗАТЬ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CallbackModal
        open={showCallbackModal}
        onOpenChange={setShowCallbackModal}
      />
    </>
  );
};
