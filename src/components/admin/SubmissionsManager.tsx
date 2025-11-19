import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Phone, Mail, Package, AlertCircle, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Submission {
  id: string;
  type: 'callback' | 'order' | 'promo';
  name: string;
  phone: string;
  email?: string;
  product_name?: string;
  configuration?: any;
  message?: string;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

const statusColors = {
  new: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const statusLabels = {
  new: 'Новая',
  in_progress: 'В обработке',
  completed: 'Выполнена',
  cancelled: 'Отменена',
};

const statusIcons = {
  new: AlertCircle,
  in_progress: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
};

const typeLabels = {
  callback: 'Обратный звонок',
  order: 'Заказ',
  promo: 'Акция',
};

export function SubmissionsManager() {
  const [selectedType, setSelectedType] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Submission[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('submissions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Статус обновлён');
    },
    onError: () => {
      toast.error('Ошибка при обновлении статуса');
    },
  });

  const deleteSubmissionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Заявка удалена');
    },
    onError: () => {
      toast.error('Ошибка при удалении заявки');
    },
  });

  const filteredSubmissions = submissions?.filter(
    (sub) => selectedType === 'all' || sub.type === selectedType
  );

  const newCount = submissions?.filter((s) => s.status === 'new').length || 0;
  const inProgressCount = submissions?.filter((s) => s.status === 'in_progress').length || 0;

  if (isLoading) {
    return <div className="text-center py-8">Загрузка заявок...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Заявки</h2>
          <p className="text-muted-foreground">
            Управление заявками с сайта
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{newCount}</div>
            <div className="text-xs text-muted-foreground">Новых</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{inProgressCount}</div>
            <div className="text-xs text-muted-foreground">В работе</div>
          </div>
        </div>
      </div>

      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList>
          <TabsTrigger value="all">Все ({submissions?.length || 0})</TabsTrigger>
          <TabsTrigger value="callback">
            Обратные звонки ({submissions?.filter((s) => s.type === 'callback').length || 0})
          </TabsTrigger>
          <TabsTrigger value="order">
            Заказы ({submissions?.filter((s) => s.type === 'order').length || 0})
          </TabsTrigger>
          <TabsTrigger value="promo">
            Акции ({submissions?.filter((s) => s.type === 'promo').length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="space-y-4 mt-6">
          {filteredSubmissions?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Нет заявок
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions?.map((submission) => {
              const StatusIcon = statusIcons[submission.status];
              return (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{submission.name}</CardTitle>
                          <Badge variant="outline">{typeLabels[submission.type]}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(submission.created_at), 'PPp', { locale: ru })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-5 h-5 ${statusColors[submission.status].replace('bg-', 'text-')}`} />
                        <Select
                          value={submission.status}
                          onValueChange={(value) =>
                            updateStatusMutation.mutate({ id: submission.id, status: value })
                          }
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">Новая</SelectItem>
                            <SelectItem value="in_progress">В обработке</SelectItem>
                            <SelectItem value="completed">Выполнена</SelectItem>
                            <SelectItem value="cancelled">Отменена</SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить заявку?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Это действие нельзя отменить. Заявка будет удалена навсегда.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSubmissionMutation.mutate(submission.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${submission.phone}`} className="hover:underline">
                        {submission.phone}
                      </a>
                    </div>
                    
                    {submission.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${submission.email}`} className="hover:underline">
                          {submission.email}
                        </a>
                      </div>
                    )}

                    {submission.product_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{submission.product_name}</span>
                      </div>
                    )}

                    {submission.configuration && (
                      <div className="mt-3 p-3 bg-muted rounded-md">
                        <div className="text-sm font-medium mb-2">Конфигурация:</div>
                        <div className="space-y-1 text-sm">
                          {submission.configuration.wheels && (
                            <div>Колёса: {submission.configuration.wheels}</div>
                          )}
                          {submission.configuration.hub && (
                            <div>Ступица: {submission.configuration.hub}</div>
                          )}
                          {submission.configuration.tent && (
                            <div>Тент: {submission.configuration.tent}</div>
                          )}
                          {submission.configuration.accessories?.length > 0 && (
                            <div>
                              Комплектующие: {submission.configuration.accessories.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {submission.message && (
                      <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                        {submission.message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
