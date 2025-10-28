import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { QualityBadge } from "@/components/QualityBadge";
import { ProductSection } from "@/components/ProductSection";
import { LocationSection } from "@/components/LocationSection";
import { Footer } from "@/components/Footer";

const singleAxleProducts = [
  { id: "1", name: "Атлант 2013-05", price: "от 110 000 ₽", availability: "В наличии" },
  { id: "2", name: "Атлант 2013-03", price: "от 135 000 ₽", availability: "В наличии" },
  { id: "3", name: "Атлант 2011-03", price: "от 118 000 ₽", availability: "Под заказ", discount: "СКИДКА 10%" },
  { id: "4", name: "Атлант 2013-03", price: "от 125 000 ₽", availability: "В наличии" },
  { id: "5", name: "Атлант 2015-05", price: "от 142 000 ₽", availability: "В наличии" },
  { id: "6", name: "Атлант 2017-03", price: "от 128 000 ₽", availability: "Под заказ" },
  { id: "7", name: "Атлант 2019-05", price: "от 155 000 ₽", availability: "В наличии" },
  { id: "8", name: "Атлант 2020-03", price: "от 138 000 ₽", availability: "В наличии" },
  { id: "9", name: "Атлант 2021-05", price: "от 162 000 ₽", availability: "Под заказ" },
  { id: "10", name: "Атлант 2022-03", price: "от 145 000 ₽", availability: "В наличии" },
];

const dualAxleProducts = [
  { id: "11", name: "Титан 2013-05", price: "от 155 000 ₽", oldPrice: "от 172 000 ₽", availability: "В наличии", discount: "СКИДКА 10%" },
  { id: "12", name: "Титан 2013-03", price: "от 168 000 ₽", availability: "В наличии" },
  { id: "13", name: "Титан 2015-05", price: "от 178 000 ₽", availability: "Под заказ" },
  { id: "14", name: "Титан 2017-03", price: "от 185 000 ₽", availability: "В наличии" },
  { id: "15", name: "Титан 2019-05", price: "от 195 000 ₽", availability: "В наличии" },
  { id: "16", name: "Титан 2020-03", price: "от 188 000 ₽", availability: "Под заказ" },
  { id: "17", name: "Титан 2021-05", price: "от 205 000 ₽", availability: "В наличии" },
  { id: "18", name: "Титан 2022-03", price: "от 198 000 ₽", availability: "В наличии" },
  { id: "19", name: "Титан 2023-05", price: "от 215 000 ₽", availability: "Под заказ" },
  { id: "20", name: "Титан 2024-03", price: "от 208 000 ₽", availability: "В наличии" },
];

const waterTechProducts = [
  { id: "21", name: "Аква 2013-05", price: "от 95 000 ₽", availability: "В наличии" },
  { id: "22", name: "Аква 2013-03", price: "от 108 000 ₽", availability: "В наличии" },
  { id: "23", name: "Аква 2015-05", price: "от 115 000 ₽", availability: "Под заказ" },
  { id: "24", name: "Аква 2017-03", price: "от 122 000 ₽", availability: "В наличии" },
  { id: "25", name: "Аква 2019-05", price: "от 132 000 ₽", availability: "В наличии" },
  { id: "26", name: "Аква 2020-03", price: "от 125 000 ₽", availability: "Под заказ" },
  { id: "27", name: "Аква 2021-05", price: "от 142 000 ₽", availability: "В наличии" },
  { id: "28", name: "Аква 2022-03", price: "от 135 000 ₽", availability: "В наличии" },
  { id: "29", name: "Аква 2023-05", price: "от 152 000 ₽", availability: "Под заказ" },
  { id: "30", name: "Аква 2024-03", price: "от 145 000 ₽", availability: "В наличии" },
];

const quadProducts = [
  { id: "31", name: "Квадро 2013-05", price: "от 88 000 ₽", availability: "В наличии" },
  { id: "32", name: "Квадро 2013-03", price: "от 98 000 ₽", availability: "В наличии" },
  { id: "33", name: "Квадро 2015-05", price: "от 105 000 ₽", availability: "Под заказ" },
  { id: "34", name: "Квадро 2017-03", price: "от 112 000 ₽", availability: "В наличии" },
  { id: "35", name: "Квадро 2019-05", price: "от 122 000 ₽", availability: "В наличии" },
  { id: "36", name: "Квадро 2020-03", price: "от 115 000 ₽", availability: "Под заказ" },
  { id: "37", name: "Квадро 2021-05", price: "от 132 000 ₽", availability: "В наличии" },
  { id: "38", name: "Квадро 2022-03", price: "от 125 000 ₽", availability: "В наличии" },
  { id: "39", name: "Квадро 2023-05", price: "от 142 000 ₽", availability: "Под заказ" },
  { id: "40", name: "Квадро 2024-03", price: "от 135 000 ₽", availability: "В наличии" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <BenefitsSection />
        <QualityBadge />
        <ProductSection id="single-axle" title="Одноосные" products={singleAxleProducts} />
        <ProductSection id="dual-axle" title="Двуосные" products={dualAxleProducts} />
        <ProductSection id="water-tech" title="Прицепы для водной техники" products={waterTechProducts} />
        <ProductSection id="quad" title="Прицепы к квадроциклам" products={quadProducts} />
        <LocationSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
