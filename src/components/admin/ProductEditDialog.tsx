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
import { Trash2, Plus } from 'lucide-react';

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

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('display_order');
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
      
      loadSpecifications(product.id);
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
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Очистить данные перед отправкой
      const cleanedData = {
        ...formData,
        // Преобразовать пустые строки в null для timestamp полей
        hero_timer_end: formData.hero_timer_end?.trim() ? formData.hero_timer_end : null,
        // Преобразовать пустые строки в null для текстовых полей
        base_image_url: formData.base_image_url?.trim() || null,
        description: formData.description?.trim() || null,
        discount_label: formData.discount_label?.trim() || null,
        // Преобразовать 0 в null для опциональных числовых полей
        old_price: formData.old_price || null,
      };

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Редактировать прицеп' : 'Новый прицеп'}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Основное</TabsTrigger>
            <TabsTrigger value="config">Конфигурация</TabsTrigger>
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
              <Label>URL базового изображения</Label>
              <Input value={formData.base_image_url} onChange={(e) => setFormData({ ...formData, base_image_url: e.target.value })} />
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
