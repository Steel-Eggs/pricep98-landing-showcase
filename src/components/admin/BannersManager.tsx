import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, GripVertical, Pencil, Trash2, Eye, EyeOff, Upload } from "lucide-react";
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useUpdateBannerOrder, Banner } from "@/hooks/useBanners";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SortableItem = ({ banner, onEdit, onDelete }: { banner: Banner; onEdit: () => void; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: banner.id });
  const updateBanner = useUpdateBanner();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold truncate">{banner.title}</h4>
          {banner.is_active ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        {banner.subtitle && <p className="text-sm text-muted-foreground line-clamp-2">{banner.subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={banner.is_active}
          onCheckedChange={(checked) => updateBanner.mutate({ id: banner.id, is_active: checked })}
        />
        <Button variant="outline" size="icon" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
};

const BannerForm = ({ banner, onClose }: { banner?: Banner; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    button_text: banner?.button_text || "",
    button_url: banner?.button_url || "",
    background_gradient: banner?.background_gradient || "from-blue-600 to-purple-600",
    image_url: banner?.image_url || "",
    is_active: banner?.is_active ?? true,
    display_order: banner?.display_order || 0,
  });
  const [uploading, setUploading] = useState(false);

  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (banner) {
      updateBanner.mutate({ id: banner.id, ...formData }, { onSuccess: onClose });
    } else {
      createBanner.mutate(formData, { onSuccess: onClose });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("trailer-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("trailer-images").getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
      toast.success("Изображение загружено");
    } catch (error) {
      toast.error("Ошибка загрузки изображения");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Заголовок *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Подзаголовок</Label>
        <Textarea
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="button_text">Текст кнопки</Label>
          <Input
            id="button_text"
            value={formData.button_text}
            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="button_url">Ссылка кнопки</Label>
          <Input
            id="button_url"
            value={formData.button_url}
            onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
            placeholder="#products"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="gradient">Градиент фона (Tailwind классы)</Label>
        <Input
          id="gradient"
          value={formData.background_gradient}
          onChange={(e) => setFormData({ ...formData, background_gradient: e.target.value })}
          placeholder="from-blue-600 to-purple-600"
        />
      </div>

      <div>
        <Label htmlFor="image">Изображение фона</Label>
        <div className="flex gap-2">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
          />
          {formData.image_url && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setFormData({ ...formData, image_url: "" })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {formData.image_url && (
          <img src={formData.image_url} alt="Preview" className="mt-2 h-20 rounded object-cover" />
        )}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Активен</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" disabled={createBanner.isPending || updateBanner.isPending}>
          {banner ? "Сохранить" : "Создать"}
        </Button>
      </div>
    </form>
  );
};

export const BannersManager = () => {
  const { data: banners, isLoading } = useBanners();
  const deleteBanner = useDeleteBanner();
  const updateBannerOrder = useUpdateBannerOrder();
  const [editingBanner, setEditingBanner] = useState<Banner | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!banners || active.id === over.id) return;

    const oldIndex = banners.findIndex((b) => b.id === active.id);
    const newIndex = banners.findIndex((b) => b.id === over.id);
    const newBanners = arrayMove(banners, oldIndex, newIndex);

    updateBannerOrder.mutate(
      newBanners.map((b, index) => ({ id: b.id, display_order: index + 1 }))
    );
  };

  if (isLoading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Управление баннерами</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingBanner(undefined)}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить баннер
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBanner ? "Редактировать баннер" : "Новый баннер"}</DialogTitle>
              </DialogHeader>
              <BannerForm banner={editingBanner} onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!banners || banners.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Нет баннеров</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={banners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {banners.map((banner) => (
                <SortableItem
                  key={banner.id}
                  banner={banner}
                  onEdit={() => {
                    setEditingBanner(banner);
                    setIsDialogOpen(true);
                  }}
                  onDelete={() => {
                    if (confirm("Удалить баннер?")) {
                      deleteBanner.mutate(banner.id);
                    }
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
};
