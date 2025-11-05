import { useState, useEffect, useRef } from "react";
import trailerImage from "@/assets/trailer-hero.webp";
import { ProductModal } from "./ProductModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useHeroProduct } from "@/hooks/useProductDetails";
import { useProductTents } from "@/hooks/useTents";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    THREE: any;
  }
}

export const HeroSection = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 12,
    minutes: 30,
    seconds: 0,
  });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7 (");
  const [agreed, setAgreed] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { data: heroProduct, isLoading } = useHeroProduct();
  const { data: productTents = [] } = useProductTents(heroProduct?.id || "");

  // Timer countdown based on hero_timer_end
  useEffect(() => {
    if (!heroProduct?.hero_timer_end) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    
    const targetTime = new Date(heroProduct.hero_timer_end).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [heroProduct?.hero_timer_end]);

  // Three.js 3D Background
  useEffect(() => {
    if (!canvasRef.current || !window.THREE) return;

    const THREE = window.THREE;
    const container = canvasRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Gradient background
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(0.5, '#8b5cf6');
      gradient.addColorStop(1, '#f97316');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2, 512);
    }
    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0x3b82f6, 0.8);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xf97316, 0.6);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    // Create 3D objects
    const geometry1 = new THREE.TorusGeometry(1.5, 0.5, 16, 100);
    const material1 = new THREE.MeshStandardMaterial({ 
      color: 0x8b5cf6,
      metalness: 0.7,
      roughness: 0.2,
    });
    const torus = new THREE.Mesh(geometry1, material1);
    torus.position.set(-3, 2, -5);
    scene.add(torus);

    const geometry2 = new THREE.SphereGeometry(1.2, 32, 32);
    const material2 = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6,
      metalness: 0.6,
      roughness: 0.3,
    });
    const sphere = new THREE.Mesh(geometry2, material2);
    sphere.position.set(4, -2, -8);
    scene.add(sphere);

    const geometry3 = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const material3 = new THREE.MeshStandardMaterial({ 
      color: 0xf97316,
      metalness: 0.5,
      roughness: 0.4,
    });
    const cube = new THREE.Mesh(geometry3, material3);
    cube.position.set(-4, -3, -6);
    scene.add(cube);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 500;
    const posArray = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 30;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 5;

    // Animation
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate objects
      torus.rotation.x += 0.003;
      torus.rotation.y += 0.005;
      
      sphere.rotation.x += 0.002;
      sphere.rotation.z += 0.004;
      
      cube.rotation.x += 0.004;
      cube.rotation.y += 0.003;

      // Parallax effect
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      // Rotate particles
      particlesMesh.rotation.y += 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      geometry1.dispose();
      geometry2.dispose();
      geometry3.dispose();
      particlesGeometry.dispose();
      material1.dispose();
      material2.dispose();
      material3.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  const formatPhone = (value: string) => {
    // Удаляем все нечисловые символы
    const cleaned = value.replace(/\D/g, "");
    
    // Убираем префикс "7" если он есть в начале (это код страны, не часть номера)
    const phoneNumber = cleaned.startsWith('7') ? cleaned.slice(1) : cleaned;
    
    // Ограничиваем до 10 цифр (номер без кода страны)
    const limited = phoneNumber.substring(0, 10);
    
    // Форматируем
    const match = limited.match(/^(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
    
    if (match) {
      let formatted = "+7";
      if (match[1]) {
        formatted += ` (${match[1]}`;
        if (match[1].length === 3) formatted += ")";
      } else {
        formatted += " (";
      }
      if (match[2]) formatted += ` ${match[2]}`;
      if (match[3]) formatted += `-${match[3]}`;
      if (match[4]) formatted += `-${match[4]}`;
      return formatted;
    }
    
    return "+7 (";
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Если пользователь пытается удалить "+7 (", не даём это сделать
    if (input.length < 4) {
      setPhone("+7 (");
      return;
    }
    
    const formatted = formatPhone(input);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !agreed) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    if (!heroProduct) {
      toast.error("Товар не найден");
      return;
    }

    try {
      // Find default tent
      const defaultTent = productTents.find(pt => pt.is_default);
      const defaultWheels = heroProduct.wheel_options?.default || "2 колеса R13";
      const defaultHub = heroProduct.hub_options?.default || "Жигулевская ступица";
      
      // Calculate total price with default configuration
      const tentPrice = defaultTent?.price || 0;
      const totalPrice = heroProduct.base_price + tentPrice;

      const { error } = await supabase.functions.invoke("send-order-notification", {
        body: {
          type: "order",
          productName: heroProduct.name,
          configuration: {
            wheels: defaultWheels,
            hub: defaultHub,
            tent: defaultTent?.tent?.name,
            accessories: [],
          },
          basePrice: heroProduct.base_price,
          oldPrice: heroProduct.old_price,
          tentName: defaultTent?.tent?.name,
          tentPrice: tentPrice,
          accessoriesPrices: [],
          totalPrice,
          name,
          phone,
          isFromHero: true,
        },
      });

      if (error) throw error;

      toast.success("Спасибо! Мы скоро свяжемся с вами");
      setName("");
      setPhone("+7 (");
      setAgreed(false);
    } catch (error) {
      console.error("Error sending order request:", error);
      toast.error("Произошла ошибка. Попробуйте позже");
    }
  };

  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* 3D Background */}
      <div ref={canvasRef} className="absolute inset-0 z-0" />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-[1]"></div>

      <div className="container mx-auto px-4 pt-24 md:pt-28 lg:pt-32 pb-8 md:pb-12 relative z-10">
        {/* Title */}
        <div className="animate-fade-in mb-3">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground whitespace-nowrap">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Более 50 моделей{" "}
            </span>
            <span className="relative">
              легковых прицепов!
              <Sparkles className="absolute -top-2 -right-10 w-8 h-8 text-accent animate-pulse" />
            </span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-5 items-start">
          {/* Left Section: Product Card */}
          <div className="lg:col-span-2">
            {isLoading || !heroProduct ? (
              <div className="relative bg-card rounded-xl overflow-hidden shadow-2xl border-2 border-primary/40 animate-pulse">
                <div className="aspect-[16/8] bg-muted"></div>
                <div className="bg-gradient-to-r from-primary via-accent to-primary p-6">
                  <div className="h-20 bg-white/20 rounded"></div>
                </div>
              </div>
            ) : (
              <div
              className="relative bg-card rounded-xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 border-2 border-primary/40 cursor-pointer group animate-scale-in"
              onClick={() => setIsProductModalOpen(true)}
            >
              {/* Discount Badge - Right Side */}
              <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-6 py-3 rounded-lg text-base font-bold z-20 shadow-lg animate-pulse">
                {heroProduct.discount_label}
              </div>

              {/* Product Image with Overlay Info */}
              <div className="relative aspect-[16/8] bg-secondary overflow-hidden">
                {!imageLoaded && (
                  <div className="absolute inset-0 animate-pulse bg-muted"></div>
                )}
                <img
                  src={heroProduct.base_image_url || trailerImage}
                  alt={heroProduct.name}
                  className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
                {/* Enhanced gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                
                {/* Availability Badge - Bottom Left */}
                <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm text-primary text-sm font-medium px-4 py-2 rounded-full shadow-lg">
                  {heroProduct.availability}
                </div>
                
                {/* Product Name and Prices - Bottom Center */}
                <div className="absolute bottom-16 left-6 right-6">
                  <h3 className="font-bold text-3xl md:text-4xl mb-2 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                    {heroProduct.name}
                  </h3>
                  <div className="flex items-end gap-3 mb-3">
                    {heroProduct.old_price && (
                      <p className="text-lg md:text-xl text-white/70 line-through drop-shadow-lg">
                        от {heroProduct.old_price.toLocaleString('ru-RU')} ₽
                      </p>
                    )}
                    <p className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                      от {heroProduct.base_price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
                
                {/* Button - Bottom */}
                <div className="absolute bottom-4 left-6 right-6 flex justify-center">
                  <Button 
                    variant="outline" 
                    className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-white/50 w-full md:w-auto md:px-8 text-lg py-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsProductModalOpen(true);
                    }}
                  >
                    Подробнее
                  </Button>
                </div>
              </div>

              {/* Timer - Compact Horizontal */}
              <div className="bg-gradient-to-r from-primary via-accent to-primary p-4 md:p-6">
                <p className="text-white text-center text-base md:text-lg font-semibold mb-3">
                  ⏰ До конца акции осталось:
                </p>
                <div className="grid grid-cols-4 gap-3 md:gap-4">
                  {[
                    { value: timeLeft.days, label: "дней" },
                    { value: timeLeft.hours, label: "часов" },
                    { value: timeLeft.minutes, label: "минут" },
                    { value: timeLeft.seconds, label: "секунд" },
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="bg-white/90 rounded-lg p-3 md:p-4 mb-2">
                        <span className="text-3xl md:text-4xl lg:text-5xl font-black text-primary">
                          {String(item.value).padStart(2, "0")}
                        </span>
                      </div>
                      <span className="text-sm md:text-base text-white font-medium uppercase">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Right Section: Contact Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-card/95 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-2xl border-2 border-primary/30 animate-fade-in">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 blur-xl -z-10"></div>
              
              <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Отправить заявку
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div>
                  <Label htmlFor="hero-name" className="text-base md:text-lg font-semibold">Имя</Label>
                  <Input
                    id="hero-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    className="mt-2 h-12 md:h-14 text-base md:text-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="hero-phone" className="text-base md:text-lg font-semibold">Телефон</Label>
                  <Input
                    id="hero-phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (___) ___-__-__"
                    className="mt-2 h-12 md:h-14 text-base md:text-lg"
                  />
                </div>
                
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="hero-agree"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="hero-agree" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    Я согласен с политикой конфиденциальности
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 md:h-14 bg-accent hover:bg-accent-hover transition-all shadow-lg text-lg md:text-xl font-semibold"
                >
                  Отправить
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {heroProduct && (
        <ProductModal 
          product={heroProduct}
          open={isProductModalOpen}
          onOpenChange={(open) => setIsProductModalOpen(open)}
        />
      )}
    </section>
  );
};