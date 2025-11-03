import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trash2, Plus, Upload, X } from 'lucide-react';

interface ProductEditDialogProps {
  open: boolean;
  onClose: () => void;
  product: any | null;
}

export const ProductEditDialog = ({ open, onClose, product }: ProductEditDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    base_image_url: '',
    base_price: 0,
    old_price: 0,
    discount_label: '',
    availability: 'В наличии',
    description: '',
    show_in_hero: false,
    hero_timer_end: '',
    wheel_options: { default: '2 колеса R13', options: ['2 колеса R13'] },
    hub_options: { default: 'ВАЗ', options: ['ВАЗ'] },
    features: [] as string[],
  });

  const [specifications, setSpecifications] = useState<Array<{ spec_name: string; spec_value: string; display_order: number }>>([]);
  const [newFeature, setNewFeature] = useState('');
  const [newWheelOption, setNewWheelOption] = useState('');
  const [newHubOption, setNewHubOption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productTents, setProductTents] = useState<Array<{
    tent_id: string;
    price: number;
    is_default: boolean;
    image_file?: File;
    image_preview?: string;
    image_url?: string;
  }>>([]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('display_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: tents } = useQuery({
    queryKey: ['tents'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tents').select('*').order('default_price');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category_id: product.category_id || '',
        base_image_url: product.base_image_url || '',
        base_price: product.base_price || 0,
        old_price: product.old_price || 0,
        discount_label: product.discount_label || '',
        availability: product.availability || 'В наличии',
        description: product.description || '',
        show_in_hero: product.show_in_hero || false,
        hero_timer_end: product.hero_timer_end || '',
        wheel_options: product.wheel_options || { default: '2 колеса R13', options: ['2 колеса R13'] },
        hub_options: product.hub_options || { default: 'ВАЗ', options: ['ВАЗ'] },
        features: product.features || [],
      });
      
      setImagePreview(product.base_image_url || null);
      loadSpecifications(product.id);
      loadProductTents(product.id);
    } else {
      resetForm();
    }
  }, [product]);

  const loadSpecifications = async (productId: string) => {
    const { data, error } = await supabase
      .from('specifications')
      .select('*')
      .eq('product_id', productId)
      .order('display_order');
    
    if (!error && data) {
      setSpecifications(data);
    }
  };

  const loadProductTents = async (productId: string) => {
    const { data, error } = await supabase
      .from('product_tents')
      .select('*')
      .eq('product_id', productId);
    
    if (!error && data) {
      setProductTents(data.map(pt => ({
        tent_id: pt.tent_id,
        price: pt.price,
        is_default: pt.is_default,
        image_url: pt.image_url || '',
        image_preview: pt.image_url || '',
      })));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: '',
      base_image_url: '',
      base_price: 0,
      old_price: 0,
      discount_label: '',
      availability: 'В наличии',
      description: '',
      show_in_hero: false,
      hero_timer_end: '',
      wheel_options: { default: '2 колеса R13', options: ['2 колеса R13'] },
      hub_options: { default: 'ВАЗ', options: ['ВАЗ'] },
      features: [],
    });
    setSpecifications([]);
    setImageFile(null);
    setImagePreview(null);
    setProductTents([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Пожалуйста, выберите изображение');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5 МБ');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, base_image_url: '' });
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('trailer-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('trailer-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Загрузить изображение, если выбрано
      let imageUrl = formData.base_image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Очистить данные перед отправкой
      const cleanedData = {
        ...formData,
        base_image_url: imageUrl?.trim() || null,
        // Преобразовать пустые строки в null для timestamp полей
        hero_timer_end: formData.hero_timer_end?.trim() ? formData.hero_timer_end : null,
        // Преобразовать пустые строки в null для текстовых полей
        description: formData.description?.trim() || null,
        discount_label: formData.discount_label?.trim() || null,
        // Преобразовать 0 в null для опциональных числовых полей
        old_price: formData.old_price || null,
      };

      // Если товар помечен как hero, сбросить этот флаг у всех других товаров
      if (cleanedData.show_in_hero) {
        const { error: resetError } = await supabase
          .from('products')
          .update({ show_in_hero: false })
          .neq('id', product?.id || '00000000-0000-0000-0000-000000000000');
        
        if (resetError) throw resetError;
      }

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(cleanedData)
          .eq('id', product.id);
        if (error) throw error;

        // Update specifications
        await supabase.from('specifications').delete().eq('product_id', product.id);
        if (specifications.length > 0) {
          await supabase.from('specifications').insert(
            specifications.map(spec => ({ ...spec, product_id: product.id }))
          );
        }

        // Update product_tents
        await supabase.from('product_tents').delete().eq('product_id', product.id);
        for (const pt of productTents) {
          let tentImageUrl = pt.image_url;
          if (pt.image_file) {
            tentImageUrl = await uploadImage(pt.image_file);
          }
          await supabase.from('product_tents').insert({
            product_id: product.id,
            tent_id: pt.tent_id,
            price: pt.price,
            is_default: pt.is_default,
            image_url: tentImageUrl || null,
          });
        }
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(cleanedData)
          .select()
          .single();
        if (error) throw error;

        if (specifications.length > 0 && newProduct) {
          await supabase.from('specifications').insert(
            specifications.map(spec => ({ ...spec, product_id: newProduct.id }))
          );
        }

        // Insert product_tents for new product
        if (productTents.length > 0 && newProduct) {
          for (const pt of productTents) {
            let tentImageUrl = pt.image_url;
            if (pt.image_file) {
              tentImageUrl = await uploadImage(pt.image_file);
            }
            await supabase.from('product_tents').insert({
              product_id: newProduct.id,
              tent_id: pt.tent_id,
              price: pt.price,
              is_default: pt.is_default,
              image_url: tentImageUrl || null,
            });
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(product ? 'Прицеп обновлён' : 'Прицеп создан');
      onClose();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  const addWheelOption = () => {
    if (newWheelOption.trim()) {
      setFormData({
        ...formData,
        wheel_options: {
          ...formData.wheel_options,
          options: [...formData.wheel_options.options, newWheelOption.trim()]
        }
      });
      setNewWheelOption('');
    }
  };

  const addHubOption = () => {
    if (newHubOption.trim()) {
      setFormData({
        ...formData,
        hub_options: {
          ...formData.hub_options,
          options: [...formData.hub_options.options, newHubOption.trim()]
        }
      });
      setNewHubOption('');
    }
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { spec_name: '', spec_value: '', display_order: specifications.length }]);
  };

  const updateSpecification = (index: number, field: string, value: string | number) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: value };
    setSpecifications(updated);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const addProductTent = (tentId: string) => {
    const tent = tents?.find(t => t.id === tentId);
    if (!tent) return;
    
    const exists = productTents.some(pt => pt.tent_id === tentId);
    if (exists) {
      toast.error('Этот тент уже добавлен');
      return;
    }

    setProductTents([...productTents, {
      tent_id: tentId,
      price: tent.default_price,
      is_default: productTents.length === 0,
      image_url: '',
      image_preview: '',
    }]);
  };

  const removeProductTent = (tentId: string) => {
    setProductTents(productTents.filter(pt => pt.tent_id !== tentId));
  };

  const updateProductTent = (tentId: string, field: string, value: any) => {
    setProductTents(productTents.map(pt => 
      pt.tent_id === tentId ? { ...pt, [field]: value } : pt
    ));
  };

  const setDefaultTent = (tentId: string) => {
    setProductTents(productTents.map(pt => ({
      ...pt,
      is_default: pt.tent_id === tentId
    })));
  };

  const handleTentImageChange = (tentId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Пожалуйста, выберите изображение');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5 МБ');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductTents(productTents.map(pt => 
          pt.tent_id === tentId 
            ? { ...pt, image_file: file, image_preview: reader.result as string }
            : pt
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeTentImage = (tentId: string) => {
    setProductTents(productTents.map(pt => 
      pt.tent_id === tentId 
        ? { ...pt, image_file: undefined, image_preview: '', image_url: '' }
        : pt
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Редактировать прицеп' : 'Новый прицеп'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Основное</TabsTrigger>
            <TabsTrigger value="config">Конфигурация</TabsTrigger>
            <TabsTrigger value="tents">Тенты</TabsTrigger>
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="specs">Характеристики</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label>Название</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Категория</Label>
              <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Изображение товара</Label>
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-contain rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <div className="text-sm text-muted-foreground mb-2">
                      Нажмите для выбора изображения
                    </div>
                    <div className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP до 5 МБ
                    </div>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Базовая цена (₽)</Label>
                <Input type="number" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Старая цена (₽)</Label>
                <Input type="number" value={formData.old_price} onChange={(e) => setFormData({ ...formData, old_price: parseFloat(e.target.value) })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Метка скидки</Label>
              <Input value={formData.discount_label} onChange={(e) => setFormData({ ...formData, discount_label: e.target.value })} placeholder="СКИДКА 10%" />
            </div>

            <div className="space-y-2">
              <Label>Наличие</Label>
              <Select value={formData.availability} onValueChange={(value) => setFormData({ ...formData, availability: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="В наличии">В наличии</SelectItem>
                  <SelectItem value="Под заказ">Под заказ</SelectItem>
                  <SelectItem value="Нет в наличии">Нет в наличии</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.show_in_hero}
                onCheckedChange={(checked) => setFormData({ ...formData, show_in_hero: checked as boolean })}
              />
              <Label>Показывать в Hero-секции</Label>
            </div>

            {formData.show_in_hero && (
              <div className="space-y-2">
                <Label>Время окончания акции</Label>
                <Input
                  type="datetime-local"
                  value={formData.hero_timer_end}
                  onChange={(e) => setFormData({ ...formData, hero_timer_end: e.target.value })}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <div className="space-y-2">
              <Label>Колёса (по умолчанию)</Label>
              <Input
                value={formData.wheel_options.default}
                onChange={(e) => setFormData({
                  ...formData,
                  wheel_options: { ...formData.wheel_options, default: e.target.value }
                })}
              />
              <div className="space-y-2">
                <Label>Доступные опции колёс</Label>
                {formData.wheel_options.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input value={option} disabled />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newWheelOption}
                    onChange={(e) => setNewWheelOption(e.target.value)}
                    placeholder="Новая опция"
                  />
                  <Button type="button" onClick={addWheelOption}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Ступица (по умолчанию)</Label>
              <Input
                value={formData.hub_options.default}
                onChange={(e) => setFormData({
                  ...formData,
                  hub_options: { ...formData.hub_options, default: e.target.value }
                })}
              />
              <div className="space-y-2">
                <Label>Доступные опции ступиц</Label>
                {formData.hub_options.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input value={option} disabled />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newHubOption}
                    onChange={(e) => setNewHubOption(e.target.value)}
                    placeholder="Новая опция"
                  />
                  <Button type="button" onClick={addHubOption}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tents" className="space-y-4">
            <div className="space-y-2">
              <Label>Добавить тент</Label>
              <Select onValueChange={addProductTent}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тент" />
                </SelectTrigger>
                <SelectContent>
                  {tents?.filter(t => !productTents.some(pt => pt.tent_id === t.id)).map((tent) => (
                    <SelectItem key={tent.id} value={tent.id}>
                      {tent.name} ({tent.default_price} ₽)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {productTents.map((pt) => {
                const tent = tents?.find(t => t.id === pt.tent_id);
                return (
                  <div key={pt.tent_id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{tent?.name}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProductTent(pt.tent_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Цена (₽)</Label>
                      <Input
                        type="number"
                        value={pt.price}
                        onChange={(e) => updateProductTent(pt.tent_id, 'price', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={pt.is_default}
                        onCheckedChange={() => setDefaultTent(pt.tent_id)}
                      />
                      <Label>По умолчанию</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Изображение тента</Label>
                      {pt.image_preview ? (
                        <div className="relative">
                          <img
                            src={pt.image_preview}
                            alt="Tent preview"
                            className="w-full h-48 object-contain rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => removeTentImage(pt.tent_id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-8 text-center">
                          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <Label htmlFor={`tent-image-${pt.tent_id}`} className="cursor-pointer">
                            <div className="text-sm text-muted-foreground mb-2">
                              Нажмите для выбора изображения
                            </div>
                            <div className="text-xs text-muted-foreground">
                              PNG, JPG, WEBP до 5 МБ
                            </div>
                          </Label>
                          <Input
                            id={`tent-image-${pt.tent_id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleTentImageChange(pt.tent_id, e)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="description" className="space-y-4">
            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label>Особенности</Label>
              {formData.features.map((feature, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={feature} disabled />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Новая особенность"
                />
                <Button type="button" onClick={addFeature}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Характеристики</Label>
                <Button type="button" size="sm" onClick={addSpecification}>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить
                </Button>
              </div>
              {specifications.map((spec, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    placeholder="Название"
                    value={spec.spec_name}
                    onChange={(e) => updateSpecification(idx, 'spec_name', e.target.value)}
                  />
                  <Input
                    placeholder="Значение"
                    value={spec.spec_value}
                    onChange={(e) => updateSpecification(idx, 'spec_value', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Порядок"
                    className="w-24"
                    value={spec.display_order}
                    onChange={(e) => updateSpecification(idx, 'display_order', parseInt(e.target.value))}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSpecification(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={() => saveMutation.mutate()}>Сохранить</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
