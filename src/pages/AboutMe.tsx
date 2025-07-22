
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { User, Award, GraduationCap, Heart, Shield, BookOpen, Instagram, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const AboutMe = () => {
  const isMobile = useIsMobile();
  
  const advantages = [
    {
      number: "01",
      icon: User,
      title: "Indywidualne podejście",
      color: "from-pink-400 to-pink-600",
      bgColor: "bg-pink-50",
      delay: "0ms"
    },
    {
      number: "02", 
      icon: Award,
      title: "Kosmetolog Roku",
      color: "from-gold-400 to-gold-600",
      bgColor: "bg-gold-50",
      delay: "100ms"
    },
    {
      number: "03",
      icon: GraduationCap,
      title: "Magister kosmetologii",
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-50",
      delay: "200ms"
    },
    {
      number: "04",
      icon: Heart,
      title: "Specjalizacja anti-aging",
      color: "from-rose-400 to-rose-600",
      bgColor: "bg-rose-50",
      delay: "300ms"
    },
    {
      number: "05",
      icon: Shield,
      title: "Certyfikowane preparaty",
      color: "from-emerald-400 to-emerald-600",
      bgColor: "bg-emerald-50",
      delay: "400ms"
    },
    {
      number: "06",
      icon: BookOpen,
      title: "Ciągły rozwój",
      color: "from-blue-400 to-blue-600",
      bgColor: "bg-blue-50",
      delay: "500ms"
    },
    {
      number: "07",
      icon: Instagram,
      title: "Aktywność online",
      color: "from-violet-400 to-violet-600",
      bgColor: "bg-violet-50",
      delay: "600ms"
    },
    {
      number: "08",
      icon: Star,
      title: "Widoczne efekty",
      color: "from-amber-400 to-amber-600",
      bgColor: "bg-amber-50",
      delay: "700ms"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-pink-50 py-16 md:py-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
                  <span className="text-pink-500">O mnie </span>
                  <span>- Anna Gajęcka</span>
                </h1>
                <div className="bg-white p-5 rounded-lg shadow-sm border border-pink-100 mb-6">
                  <p className="text-gray-700 italic">
                    "Jestem kosmetologiem z powołania, a każdy zabieg to dla mnie
                    możliwość stworzenia czegoś pięknego. Moim celem jest nie tylko
                    poprawianie urody, ale przede wszystkim poprawa samopoczucia
                    i pewności siebie moich klientek."
                  </p>
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Kosmetolog Roku województwa śląskiego z pasją do estetycznego piękna i
                  naturalnych efektów. Indywidualne podejście do każdego klienta to mój
                  priorytet.
                </p>
                <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
                  <Link to="/kontakt">Umów wizytę</Link>
                </Button>
              </div>
              <div className="relative">
                <img alt="Anna Gajęcka - Kosmetolog" className="w-full h-auto rounded-lg shadow-lg" src="/lovable-uploads/3ffa044e-7598-4eaf-a751-a518d7f12c8b.jpg" />
                <div className="absolute -bottom-5 -left-5 bg-white p-4 rounded-lg shadow-lg border border-pink-100">
                  <span className="block text-lg font-semibold text-gold-500">
                    Magister Kosmetologii
                  </span>
                  <span className="block text-sm text-gray-600">
                    Uniwersytet Śląski
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Biography Section */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-8 font-playfair text-center">
              <span>Moja </span>
              <span className="text-pink-500">Historia</span>
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6 text-gray-600">
              <p>
                Nazywam się Anna Gajęcka, jestem absolwentką Uniwersytetu Śląskiego, magistrem kosmetologii, 
                studentką pielęgniarstwa, właścicielką gabinetu kosmetologii Zastrzyk_piekna, 
                laureatką konkursu na Kosmetologa Roku województwa śląskiego oraz niezaprzeczalną pasjonatką zawodu.
              </p>
              <p>Moją specjalnością są terapie przeciwstarzeniowe, modelowanie ust oraz makijaż permanentny brwi.

Branża beauty to ocean niekończących się możliwości. Motywuje mnie to do ciągłego podnoszenia kwalifikacji i umiejętności oraz pozyskiwania wiedzy w zakresie rozwijającej się medycyny estetycznej i kosmetologii.</p>
              <p>Moją specjalnością są zdecydowanie terapie przeciwstarzeniowe, ale te wymagają czasu, wytrwałości i konsekwencji ze strony klientki. Ze względu na wrodzone zdolności manualne uwielbiam zabiegi, które dają natychmiastowy efekt i są w stanie zmienić nasz wygląd w przeciągu jednego zabiegu.

Zapraszam na mój Instagram @zastrzyk_piekna oraz zachęcam do obejrzenia wszystkich rolek edukacyjnych znajdujących się na moim profilu.</p>
              
            </div>
          </div>
        </section>

        {/* Advantages Section - Visual & Animated */}
        <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-gold-50 relative overflow-hidden">
          {/* Floating background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-pink-200/30 rounded-full animate-float"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-gold-200/40 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-200/30 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-40 right-10 w-12 h-12 bg-rose-200/40 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
          </div>
          
          <div className="container-custom relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-playfair">
                <span>Dlaczego warto wybrać </span>
                <span className="text-pink-500">mój gabinet?</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-gold-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {advantages.map((advantage, index) => {
                const IconComponent = advantage.icon;
                return (
                  <div 
                    key={index}
                    className="group relative"
                    style={{
                      animation: `slideUp 0.8s ease-out ${advantage.delay} both`
                    }}
                  >
                    {/* Main card */}
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 h-full shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer border border-white/50">
                      {/* Gradient overlay on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${advantage.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-500`}></div>
                      
                      {/* Floating number */}
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg font-playfair shadow-lg group-hover:animate-pulse">
                        {advantage.number}
                      </div>
                      
                      {/* Icon container */}
                      <div className="relative mb-6">
                        <div className={`w-16 h-16 ${advantage.bgColor} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-8 h-8 text-gray-700 group-hover:text-pink-600 transition-colors duration-300" />
                        </div>
                        
                        {/* Animated ring */}
                        <div className="absolute inset-0 w-16 h-16 mx-auto border-2 border-pink-200 rounded-2xl opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500"></div>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-center font-semibold text-gray-800 group-hover:text-pink-600 transition-colors duration-300 font-playfair text-sm md:text-base leading-tight">
                        {advantage.title}
                      </h3>
                      
                      {/* Animated bottom accent */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-pink-500 to-gold-500 group-hover:w-3/4 transition-all duration-500 rounded-full"></div>
                    </div>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-gold-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10 scale-110"></div>
                  </div>
                );
              })}
            </div>
            
            {/* Central connecting element */}
            <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-pink-200/50 to-gold-200/50 rounded-full blur-3xl animate-pulse"></div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-pink-500 to-pink-600 text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-6 font-playfair">
              Zapraszam do gabinetu kosmetologii estetycznej
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Przekonaj się o skuteczności moich zabiegów i profesjonalnym podejściu do każdego klienta.
              Umów się na wizytę już dzisiaj!
            </p>
            <Button asChild size="lg" className="bg-white text-pink-600 hover:bg-pink-50">
              <Link to="/kontakt">Umów wizytę</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutMe;
