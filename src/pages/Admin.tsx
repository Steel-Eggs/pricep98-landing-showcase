import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoriesManager } from '@/components/admin/CategoriesManager';
import { ProductsManager } from '@/components/admin/ProductsManager';
import { AccessoriesManager } from '@/components/admin/AccessoriesManager';
import { TentsManager } from '@/components/admin/TentsManager';
import { SiteSettingsManager } from '@/components/admin/SiteSettingsManager';
import { LogOut, Package, Tags, Wrench, Tent, Home, Settings } from 'lucide-react';
import logoMono from '@/assets/logo-mono.png';
import { toast } from 'sonner';

const AdminPage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  const handleSignOut = async () => {
    await signOut();
    toast.success('Выход выполнен');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logoMono} alt="ПРИЦЕП98" className="h-8" />
              <h1 className="text-xl font-bold">Административная панель</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate('/')} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                На сайт
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tags className="w-4 h-4" />
              Категории
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Прицепы
            </TabsTrigger>
            <TabsTrigger value="tents" className="flex items-center gap-2">
              <Tent className="w-4 h-4" />
              Тенты
            </TabsTrigger>
            <TabsTrigger value="accessories" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Комплектующие
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Настройки сайта
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="products">
            <ProductsManager />
          </TabsContent>

          <TabsContent value="tents">
            <TentsManager />
          </TabsContent>

          <TabsContent value="accessories">
            <AccessoriesManager />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettingsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const Admin = () => {
  return (
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  );
};

export default Admin;
