import { Truck, Shield, Wrench, CreditCard, Clock, Award } from "lucide-react";
import { DecorativeBlob } from "./DecorativeBlob";

const benefits = [
  {
    icon: Truck,
    title: "Оформление в ГИБДД",
    description: "Экономим Ваш бюджет. Оформляем прицепы как коммерческое лицо и сэкономим на сумме налога!",
  },
  {
    icon: Shield,
    title: "Доставка",
    description: "Доставляем с нашего склада во все регионы страны. Прицепы доходят в целости и сохранности со всеми документами.",
  },
  {
    icon: Wrench,
    title: "Установка фаркопа",
    description: "Продаём прицепные устройства — фаркопы всех видов. Если не знаете нужна ли вам установка и какую выбрать, мы вам поможем бесплатно.",
  },
  {
    icon: CreditCard,
    title: "Можно в кредит",
    description: "Оформить фаркоп и прицеп можно сразу, а можно через кредитную программу через ПАО «Сбербанк» по выгодной ставке от 1,99 до 8,9%.",
  },
  {
    icon: Clock,
    title: "Технический паспорт",
    description: "Выдаём оригиналы всех документов: паспорт, сертификат и технический паспорт завода изготовителя на прицеп.",
  },
  {
    icon: Award,
    title: "Прицеп на прокат",
    description: "Предлагаем Вам сдать прицеп в аренду. Сумма зависит от модели и сдачи. Предоставим подробную консультацию по дням на прокат.",
  },
];

export const BenefitsSection = () => {
  return (
    <section className="relative py-16 md:py-24 bg-secondary/30 overflow-hidden">
      {/* Decorative Background Elements */}
      <DecorativeBlob color="accent" size="lg" className="top-10 -right-20 opacity-20" />
      <DecorativeBlob color="primary" size="xl" className="bottom-0 -left-32 opacity-15" />
      
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          10 лет продаём прицепы по всему Северо-Западу
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Мы предлагаем полный спектр услуг для комфортной покупки и эксплуатации прицепов
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="group relative bg-card rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in border-2 border-transparent hover:border-primary/30 overflow-hidden"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Icon with gradient background */}
              <div className="relative w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <benefit.icon className="w-7 h-7 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
