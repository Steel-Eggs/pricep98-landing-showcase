import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, GripVertical } from 'lucide-react';
import { ProductEditDialog } from './ProductEditDialog';
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

interface Product {
  id: string;
  name: string;
  base_price: number;
  availability: string;
  base_image_url: string | null;
  category_id: string;
  display_order: number;
  categories?: { name: string };
}

const SortableRow = ({ product, onEdit }: { product: Product; onEdit: (product: Product) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

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
      <TableCell>
        {product.base_image_url && (
          <img src={product.base_image_url} alt={product.name} className="w-16 h-16 object-cover rounded" />
        )}
      </TableCell>
      <TableCell>{product.name}</TableCell>
      <TableCell>{product.categories?.name}</TableCell>
      <TableCell>{product.base_price} ₽</TableCell>
      <TableCell>{product.availability}</TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
          <Pencil className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export const ProductsManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      const promises = updates.map(({ id, display_order }) =>
        supabase
          .from('products')
          .update({ display_order })
          .eq('id', id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && products) {
      const oldIndex = products.findIndex((p) => p.id === active.id);
      const newIndex = products.findIndex((p) => p.id === over.id);

      const newProducts = arrayMove(products, oldIndex, newIndex);
      
      // Update display_order for all affected items
      const updates = newProducts.map((product, index) => ({
        id: product.id,
        display_order: index,
      }));

      updateOrderMutation.mutate(updates);
    }
  };

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление прицепами</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить прицеп
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
              <TableHead>Изображение</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Наличие</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SortableContext
              items={products?.map(p => p.id) || []}
              strategy={verticalListSortingStrategy}
            >
              {products?.map((product) => (
                <SortableRow
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                />
              ))}
            </SortableContext>
          </TableBody>
        </Table>
      </DndContext>

      <ProductEditDialog 
        open={isDialogOpen}
        onClose={handleClose}
        product={editingProduct}
      />
    </div>
  );
};
