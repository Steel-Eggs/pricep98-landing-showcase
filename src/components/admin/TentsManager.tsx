import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import type { Tent } from '@/types/product';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableRow = ({ tent, onEdit, onDelete }: { tent: Tent; onEdit: (tent: Tent) => void; onDelete: (id: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tent.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing hover:text-primary transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </div>
      </TableCell>
      <TableCell>{tent.name}</TableCell>
      <TableCell>{tent.slug}</TableCell>
      <TableCell>{tent.default_price} ₽</TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(tent)}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            if (confirm('Удалить этот тент?')) {
              onDelete(tent.id);
            }
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export const TentsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTent, setEditingTent] = useState<Tent | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', default_price: 0 });
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: tents, isLoading } = useQuery({
    queryKey: ['admin-tents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tents')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Tent[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingTent) {
        const { error } = await supabase
          .from('tents')
          .update(formData)
          .eq('id', editingTent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tents')
          .insert(formData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tents'] });
      queryClient.invalidateQueries({ queryKey: ['tents'] });
      toast.success(editingTent ? 'Тент обновлён' : 'Тент создан');
      handleClose();
    },
    onError: (error) => {
      toast.error('Ошибка: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tents')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tents'] });
      queryClient.invalidateQueries({ queryKey: ['tents'] });
      toast.success('Тент удалён');
    },
    onError: (error) => {
      toast.error('Ошибка: ' + error.message);
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      const promises = updates.map(({ id, display_order }) =>
        supabase
          .from('tents')
          .update({ display_order })
          .eq('id', id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tents'] });
      queryClient.invalidateQueries({ queryKey: ['tents'] });
    },
  });

  const handleEdit = (tent: Tent) => {
    setEditingTent(tent);
    setFormData({
      name: tent.name,
      slug: tent.slug,
      default_price: tent.default_price,
    });
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingTent(null);
    setFormData({ name: '', slug: '', default_price: 0 });
  };

  const handleSave = () => {
    if (!formData.name || !formData.slug) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    saveMutation.mutate();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && tents) {
      const oldIndex = tents.findIndex((t) => t.id === active.id);
      const newIndex = tents.findIndex((t) => t.id === over.id);

      const newTents = arrayMove(tents, oldIndex, newIndex);
      
      // Update display_order for all affected items
      const updates = newTents.map((tent, index) => ({
        id: tent.id,
        display_order: index,
      }));

      updateOrderMutation.mutate(updates);
    }
  };

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление тентами</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить тент
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Цена по умолчанию</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={tents?.map(t => t.id) || []}
              strategy={verticalListSortingStrategy}
            >
              {tents?.map((tent) => (
                <SortableRow
                  key={tent.id}
                  tent={tent}
                  onEdit={handleEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTent ? 'Редактировать тент' : 'Добавить тент'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Название *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="naprimer-bez-tenta"
              />
            </div>
            <div>
              <Label htmlFor="default_price">Цена по умолчанию</Label>
              <Input
                id="default_price"
                type="number"
                value={formData.default_price}
                onChange={(e) => setFormData({ ...formData, default_price: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Отмена</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
