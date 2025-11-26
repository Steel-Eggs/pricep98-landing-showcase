import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { Save, Loader2 } from "lucide-react";

export const SiteSettingsManager = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();

  const [formData, setFormData] = useState({
    contact_email: "",
    phone: "",
    address_city: "",
    address_full: "",
    working_hours: "",
    coordinates: "",
    youtube_url: "",
    vk_url: "",
    privacy_policy: "",
    terms_of_service: "",
    show_hero_section: "false",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        contact_email: settings.contact_email || "",
        phone: settings.phone || "",
        address_city: settings.address_city || "",
        address_full: settings.address_full || "",
        working_hours: settings.working_hours || "",
        coordinates: settings.coordinates || "",
        youtube_url: settings.youtube_url || "",
        vk_url: settings.vk_url || "",
        privacy_policy: settings.privacy_policy || "",
        terms_of_service: settings.terms_of_service || "",
        show_hero_section: settings.show_hero_section || "false",
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (field: string) => {
    try {
      await updateSetting.mutateAsync({
        key: field,
        value: formData[field as keyof typeof formData],
      });
      toast.success("Настройка сохранена");
    } catch (error) {
      toast.error("Ошибка сохранения");
      console.error(error);
    }
  };

  const handleSaveAll = async () => {
    try {
      for (const [key, value] of Object.entries(formData)) {
        await updateSetting.mutateAsync({ key, value });
      }
      toast.success("Все настройки сохранены");
    } catch (error) {
      toast.error("Ошибка сохранения");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Настройки сайта</h2>
        <Button onClick={handleSaveAll} disabled={updateSetting.isPending}>
          <Save className="w-4 h-4 mr-2" />
          Сохранить всё
        </Button>
      </div>

      {/* Настройки отображения */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки отображения</CardTitle>
          <CardDescription>Управление главной секцией сайта</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_hero_section">Показывать Hero-секцию</Label>
              <p className="text-sm text-muted-foreground">
                Переключение между Hero-секцией и слайдером баннеров
              </p>
            </div>
            <Switch
              id="show_hero_section"
              checked={formData.show_hero_section === "true"}
              onCheckedChange={(checked) => {
                const newValue = checked ? "true" : "false";
                setFormData({ ...formData, show_hero_section: newValue });
                handleSave("show_hero_section");
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Контакты */}
      <Card>
        <CardHeader>
          <CardTitle>Контакты</CardTitle>
          <CardDescription>Email для уведомлений и телефон</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="contact_email">Email для уведомлений</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                placeholder="info@example.com"
              />
              <Button
                onClick={() => handleSave("contact_email")}
                disabled={updateSetting.isPending}
                variant="outline"
              >
                Сохранить
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Телефон</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+7 (___) ___-__-__"
              />
              <Button
                onClick={() => handleSave("phone")}
                disabled={updateSetting.isPending}
                variant="outline"
              >
                Сохранить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Адрес и локация */}
      <Card>
        <CardHeader>
          <CardTitle>Адрес и локация</CardTitle>
          <CardDescription>Адрес магазина и координаты для карты</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address_city">Город</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="address_city"
                value={formData.address_city}
                onChange={(e) => handleChange("address_city", e.target.value)}
                placeholder="Санкт-Петербург"
              />
              <Button
                onClick={() => handleSave("address_city")}
                disabled={updateSetting.isPending}
                variant="outline"
              >
                Сохранить
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="address_full">Полный адрес</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="address_full"
                value={formData.address_full}
                onChange={(e) => handleChange("address_full", e.target.value)}
                placeholder="Санкт-Петербург, ул. Примерная, д. 123"
              />
              <Button
                onClick={() => handleSave("address_full")}
                disabled={updateSetting.isPending}
                variant="outline"
              >
                Сохранить
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="working_hours">Режим работы</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="working_hours"
                value={formData.working_hours}
                onChange={(e) => handleChange("working_hours", e.target.value)}
                placeholder="Пн-Вс 9:00 - 21:00"
              />
              <Button
                onClick={() => handleSave("working_hours")}
                disabled={updateSetting.isPending}
                variant="outline"
              >
                Сохранить
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="coordinates">Координаты (широта,долгота)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="coordinates"
                value={formData.coordinates}
                onChange={(e) => handleChange("coordinates", e.target.value)}
                placeholder="59.9311,30.3609"
              />
              <Button
                onClick={() => handleSave("coordinates")}
                disabled={updateSetting.isPending}
                variant="outline"
              >
                Сохранить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Социальные сети */}
      <Card>
        <CardHeader>
          <CardTitle>Социальные сети</CardTitle>
          <CardDescription>Ссылки на YouTube и VK</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="youtube_url">YouTube URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="youtube_url"
                type="url"
                value={formData.youtube_url}
                onChange={(e) => handleChange("youtube_url", e.target.value)}
                placeholder="https://www.youtube.com/channel/..."
              />
              <Button
                onClick={() => handleSave("youtube_url")}
                disabled={updateSetting.isPending}
                variant="outline"
              >
                Сохранить
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="vk_url">VK URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="vk_url"
                type="url"
                value={formData.vk_url}
                onChange={(e) => handleChange("vk_url", e.target.value)}
                placeholder="https://vk.com/..."
              />
              <Button
                onClick={() => handleSave("vk_url")}
                disabled={updateSetting.isPending}
                variant="outline"
              >
                Сохранить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Юридические документы */}
      <Card>
        <CardHeader>
          <CardTitle>Юридические документы</CardTitle>
          <CardDescription>Политика конфиденциальности и пользовательское соглашение</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="privacy_policy">Политика конфиденциальности</Label>
            <div className="space-y-2 mt-1">
              <Textarea
                id="privacy_policy"
                value={formData.privacy_policy}
                onChange={(e) => handleChange("privacy_policy", e.target.value)}
                placeholder="Введите текст политики конфиденциальности..."
                rows={10}
              />
              <Button
                onClick={() => handleSave("privacy_policy")}
                disabled={updateSetting.isPending}
                variant="outline"
              >
                Сохранить
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="terms_of_service">Пользовательское соглашение</Label>
            <div className="space-y-2 mt-1">
              <Textarea
                id="terms_of_service"
                value={formData.terms_of_service}
                onChange={(e) => handleChange("terms_of_service", e.target.value)}
                placeholder="Введите текст пользовательского соглашения..."
                rows={10}
              />
              <Button
                onClick={() => handleSave("terms_of_service")}
                disabled={updateSetting.isPending}
                variant="outline"
              >
                Сохранить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
