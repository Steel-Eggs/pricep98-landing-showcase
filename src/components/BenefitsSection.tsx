import { Truck, Shield, Wrench, CreditCard, Clock, Award } from "lucide-react";

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
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
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
              className="bg-card rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in border border-border"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-primary" />
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
