import { Header } from "@/components/Header";
// import { HeroSection } from "@/components/HeroSection"; // Закомментировано - можно активировать в админке через настройки
import { BannerSlider } from "@/components/BannerSlider";
import { BenefitsSection } from "@/components/BenefitsSection";
import { QualityBadge } from "@/components/QualityBadge";
import { ProductSection } from "@/components/ProductSection";
import { LocationSection } from "@/components/LocationSection";
import { Footer } from "@/components/Footer";
import { useCategories } from "@/hooks/useCategories";
import { useSiteSetting } from "@/hooks/useSiteSettings";

const Index = () => {
  const { data: categories, isLoading } = useCategories();
  const showHeroSection = useSiteSetting("show_hero_section") === "true";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* {showHeroSection ? <HeroSection /> : <BannerSlider />} */}
        {/* Временно отключена Hero-секция, используется только слайдер */}
        <BannerSlider />
        <BenefitsSection />
        <QualityBadge />
        {!isLoading && categories?.map((category) => (
          <ProductSection 
            key={category.id}
            id={category.slug} 
            title={category.name} 
            categorySlug={category.slug} 
          />
        ))}
        <LocationSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
