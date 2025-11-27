import { useState } from 'react';
import { useAllBanners, Banner } from '@/hooks/useBanners';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export const BannersManager = () => {
  const { data: banners, isLoading } = useAllBanners();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    background_gradient: 'from-blue-600 to-purple-600',
    button_text: '',
    button_url: '',
    image_url: '',
    is_active: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      background_gradient: 'from-blue-600 to-purple-600',
      button_text: '',
      button_url: '',
      image_url: '',
      is_active: true,
      display_order: 0,
    });
    setEditingBanner(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      background_gradient: banner.background_gradient,
      button_text: banner.button_text || '',
      button_url: banner.button_url || '',
      image_url: banner.image_url || '',
      is_active: banner.is_active,
      display_order: banner.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('Введите заголовок');
      return;
    }

    try {
      const bannerData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || null,
        background_gradient: formData.background_gradient,
        button_text: formData.button_text.trim() || null,
        button_url: formData.button_url.trim() || null,
        image_url: formData.image_url.trim() || null,
        is_active: formData.is_active,
        display_order: formData.display_order,
      };

      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update(bannerData)
          .eq('id', editingBanner.id);

        if (error) throw error;
        toast.success('Баннер обновлён');
      } else {
        const { error } = await supabase
          .from('banners')
          .insert(bannerData);

        if (error) throw error;
        toast.success('Баннер создан');
      }

      queryClient.invalidateQueries({ queryKey: ['all-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Ошибка сохранения');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить баннер?')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Баннер удалён');
      queryClient.invalidateQueries({ queryKey: ['all-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Ошибка удаления');
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['all-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast.error('Ошибка обновления');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Баннеры</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить баннер
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Порядок</TableHead>
            <TableHead>Заголовок</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead>Градиент</TableHead>
            <TableHead>Активен</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners?.map((banner) => (
            <TableRow key={banner.id}>
              <TableCell>{banner.display_order}</TableCell>
              <TableCell className="font-medium max-w-[200px] truncate">
                {banner.title}
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                {banner.subtitle || '—'}
              </TableCell>
              <TableCell>
                <div
                  className={`w-20 h-6 rounded bg-gradient-to-r ${banner.background_gradient}`}
                />
              </TableCell>
              <TableCell>
                <Switch
                  checked={banner.is_active}
                  onCheckedChange={() => toggleActive(banner)}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(banner)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Редактировать баннер' : 'Новый баннер'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="ПОДАРОК КАЖДОМУ ПОКУПАТЕЛЮ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Описание</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Выбирай любой прицеп — получай опорное колесо в подарок!"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradient">Градиент (Tailwind классы)</Label>
              <Input
                id="gradient"
                value={formData.background_gradient}
                onChange={(e) => setFormData({ ...formData, background_gradient: e.target.value })}
                placeholder="from-blue-600 to-purple-600"
              />
              <div
                className={`w-full h-12 rounded bg-gradient-to-r ${formData.background_gradient}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="button_text">Текст кнопки</Label>
                <Input
                  id="button_text"
                  value={formData.button_text}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  placeholder="Подробнее"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button_url">Ссылка кнопки</Label>
                <Input
                  id="button_url"
                  value={formData.button_url}
                  onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                  placeholder="#trailers"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL изображения (фон)</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Порядок отображения</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Активен</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit}>
              {editingBanner ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
