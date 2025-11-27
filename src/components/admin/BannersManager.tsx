import { useState, useRef } from 'react';
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
import { Plus, Pencil, Trash2, Upload, X, ImageIcon } from 'lucide-react';

export const BannersManager = () => {
  const { data: banners, isLoading } = useAllBanners();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
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
      button_text: banner.button_text || '',
      button_url: banner.button_url || '',
      image_url: banner.image_url || '',
      is_active: banner.is_active,
      display_order: banner.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `banner-${Date.now()}.${fileExt}`;

      console.log('Uploading file:', {
        name: fileName,
        type: file.type,
        size: file.size
      });

      // Upload file directly (same approach as trailer-images)
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('banners')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      console.log('Upload success:', uploadData);

      const { data: publicUrlData } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);

      // Add cache-busting parameter to force fresh load
      const imageUrlWithCacheBust = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      console.log('Public URL:', imageUrlWithCacheBust);

      setFormData(prev => ({ ...prev, image_url: imageUrlWithCacheBust }));
      toast.success('Изображение загружено');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Ошибка загрузки изображения');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
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
            <TableHead className="w-16">Порядок</TableHead>
            <TableHead className="w-20">Фото</TableHead>
            <TableHead>Заголовок</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead className="w-20">Активен</TableHead>
            <TableHead className="text-right w-28">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {banners?.map((banner) => (
            <TableRow key={banner.id}>
              <TableCell>{banner.display_order}</TableCell>
              <TableCell>
                {banner.image_url ? (
                  <div className="w-16 h-10 bg-muted border border-border rounded overflow-hidden">
                    <img 
                      key={banner.image_url}
                      src={`${banner.image_url}${banner.image_url.includes('?') ? '&' : '?'}t=${banner.updated_at}`} 
                      alt="" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-10 bg-muted border border-border rounded flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium max-w-[200px] truncate">
                {banner.title}
              </TableCell>
              <TableCell className="max-w-[300px] truncate">
                {banner.subtitle || '—'}
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
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="ПОДАРОК КАЖДОМУ ПОКУПАТЕЛЮ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Описание</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Выбирай любой прицеп — получай опорное колесо в подарок!"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Изображение (фон)</Label>
              {formData.image_url ? (
                <div className="relative">
                  <img
                    key={formData.image_url}
                    src={formData.image_url.includes('?') ? formData.image_url : `${formData.image_url}?t=${Date.now()}`}
                    alt="Превью баннера"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-muted-foreground">Загрузка...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Нажмите для загрузки изображения
                      </span>
                      <span className="text-xs text-muted-foreground">
                        PNG, JPG, WebP до 5MB
                      </span>
                    </>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="button_text">Текст кнопки</Label>
                <Input
                  id="button_text"
                  value={formData.button_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                  placeholder="Подробнее"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="button_url">Ссылка кнопки</Label>
                <Input
                  id="button_url"
                  value={formData.button_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, button_url: e.target.value }))}
                  placeholder="#trailers"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">Порядок отображения</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Активен</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading}>
              {editingBanner ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
