import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronRight, 
  Droplet, 
  Sparkles, 
  Dna, 
  FlaskConical, 
  ArrowRight, 
  Heart, 
  CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const AntiAgingTherapies = () => {
  // Referencja do sekcji zabiegów autologicznych
  const autologousRef = React.useRef<HTMLDivElement>(null);
  const stimulatorsRef = React.useRef<HTMLDivElement>(null);

  // Funkcja do przewijania do odpowiedniej sekcji
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Dane o zabiegach autologicznych
  const autologousTreatments = [
    {
      id: 1,
      name: "PRP – Osocze bogatopłytkowe",
      nickname: "„Wampirzy lifting”",
      form: "Lekko złocista, płynna frakcja krwi",
      content: "Skoncentrowane płytki krwi z czynnikami wzrostu (PDGF, TGF-β, VEGF)",
      goal: "Stymulacja fibroblastów, poprawa mikrokrążenia, jędrności i regeneracji skóry",
      effect: "Napięcie, elastyczność, promienność i nawilżenie skóry, poprawa kolorytu, redukcja drobnych zmarszczek",
      additional: "Leczenie łysienia, blizn, rozstępów, rewitalizacja skóry wokół oczu, terapia suchości",
      icon: <Droplet className="w-8 h-8 text-pink-500" />,
      image: "/lovable-uploads/8911cfd6-7a54-4b02-8722-20c61218807d.png"
    },
    {
      id: 2,
      name: "F-PRF – Fibryna strukturalna bogatopłytkowa",
      nickname: "",
      form: "Gęsta, żelowa struktura (siateczka/rusztowanie)",
      content: "Płytki krwi + leukocyty",
      goal: "Powolne, długotrwałe uwalnianie czynników wzrostu (do 7–10 dni)",
      effect: "Długotrwała regeneracja, odbudowa objętości w okolicy policzków, doliny łez, fałd nosowo-wargowych, poprawa napięcia i jędrności",
      additional: "Idealna przy wiotkiej, cienkiej skórze uszu, szczególnie u osób starszych lub po wielu latach noszenia ciężkiej biżuterii, leczenie blizn potrądzikowych i rozstępów, terapia wypadania włosów",
      icon: <Dna className="w-8 h-8 text-pink-500" />,
      image: "/lovable-uploads/a49b2ad5-04a2-47df-b4f5-9c377ef464a3.png"
    },
    {
      id: 3,
      name: "I-PRF – Iniekcyjna fibryna bogatokomórkowa",
      nickname: "",
      form: "Płynna, idealna do delikatnych okolic (np. okolice oczu)",
      content: "Wysokie stężenie płytek krwi, leukocytów, najsilniejszy wpływ na chemotaksję komórek",
      goal: "Intensywna stymulacja skóry – produkcja kolagenu, angiogeneza",
      effect: "Odżywienie, poprawa elastyczności, redukcja drobnych zmarszczek",
      additional: "Twarz, szyja, dekolt, okolica oka",
      icon: <FlaskConical className="w-8 h-8 text-pink-500" />,
      image: "/lovable-uploads/28e228b7-3605-4c15-9731-3c72e9585d6b.png"
    },
    {
      id: 4,
      name: "PLASMOO",
      nickname: "Innowacyjna nowość",
      form: "Najnowsza metoda łącząca 4 frakcje autologiczne",
      content: "",
      goal: "Intensywna, wielopoziomowa regeneracja skóry",
      effect: "Połączenie wszystkich wymienionych wyżej efektów",
      additional: "",
      icon: <Sparkles className="w-8 h-8 text-pink-500" />,
      image: "/lovable-uploads/4e36b405-2b0b-48e1-a707-234600f8a1c0.png"
    }
  ];

  // Zalety zabiegów autologicznych
  const autologousAdvantages = [
    {
      title: "Przyciąganie komórek macierzystych",
      description: "Przewaga nad klasycznymi stymulatorami: przyciągają komórki macierzyste (MSC) i pobudzają je do przekształcania w nowe fibroblasty, co sprzyja intensywnej odnowie skóry"
    },
    {
      title: "Pełne bezpieczeństwo",
      description: "Zabiegi są w pełni biokompatybilne – wykorzystują tylko własne komórki, więc ryzyko alergii lub odrzutu jest zminimalizowane"
    },
    {
      title: "Naturalność efektów",
      description: "Efekty są subtelne, ale trwałe i wyglądają naturalnie"
    },
    {
      title: "Potwierdzona efektywność",
      description: "To materiał o udowodnionej skuteczności, stosowany od wielu lat w różnych dziedzinach medycyny, w tym w ortopedii, ginekologii czy stomatologii"
    }
  ];

  // Dane o stymulatorach tkankowych
  const tissueStimulators = [
    {
      category: "Naturalne składniki",
      items: [
        "Kwas hialuronowy",
        "Polinukleotydy",
        "Aminokwasy",
        "Tropokolagen",
        "Kolagen"
      ]
    },
    {
      category: "Syntetyczne polimery",
      items: [
        "Kwas L-polimlekowy (PLLA) – jeden z najsilniejszych stymulatorów kolagenu",
        "Polidioksanon (PDO) – znany głównie z formy nici, najnowsze doniesienia wskazują na jego nową, płynną postać do iniekcji",
        "Polikaprolakton (PCL)"
      ]
    }
  ];

  // Działanie czynników wzrostu
  const growthFactors = [
    { name: "PDGF", fullName: "Płytkopochodny czynnik wzrostu" },
    { name: "TGF-β", fullName: "Transformujący czynnik wzrostu" },
    { name: "VEGF", fullName: "Naczyniowo-śródbłonkowy czynnik wzrostu" }
  ];

  const growthFactorEffects = [
    "Aktywują fibroblasty do produkcji kolagenu i elastyny",
    "Stymulują mezenchymalne komórki macierzyste do różnicowania (więcej komórek skóry, więcej fibroblastów, więcej kolagenu)",
    "Przyspieszają regenerację i poprawiają napięcie skóry",
    "Wpływają na angiogenezę (tworzenie się nowych naczyń krwionośnych)"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-pink-50/80 to-white py-16 md:py-28 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-300 via-pink-50 to-transparent"></div>
          </div>
          
          <div className="container-custom relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair mb-6">
                  <span className="text-pink-500">Terapie </span>
                  <span className="relative">
                    przeciwstarzeniowe
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-gold-400"></span>
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-700 mb-8">
                  Nowoczesne rozwiązania, które skutecznie spowalniają procesy starzenia 
                  i wspierają <span className="font-semibold">naturalną regenerację</span> tkanek.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                    size="lg"
                    onClick={() => scrollToSection(autologousRef)}
                  >
                    Zabiegi autologiczne
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-pink-200 hover:bg-pink-50"
                    size="lg"
                    onClick={() => scrollToSection(stimulatorsRef)}
                  >
                    Stymulatory tkankowe
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-full bg-pink-100 absolute -top-10 -right-10 w-28 h-28 z-0 animate-pulse"></div>
                <div className="aspect-square rounded-full bg-gold-100 absolute -bottom-5 -left-5 w-20 h-20 z-0 animate-pulse"></div>
                <img 
                  src="/lovable-uploads/8911cfd6-7a54-4b02-8722-20c61218807d.png" 
                  alt="Terapie przeciwstarzeniowe" 
                  className="rounded-lg shadow-xl relative z-10 w-full h-auto aspect-[4/3] object-cover transform-gpu transition-transform duration-700 hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Wprowadzenie */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 font-playfair">
                <span className="text-gray-800">Kompleksowe podejście do </span>
                <span className="text-pink-500">młodości skóry</span>
              </h2>
              
              <p className="text-gray-700 mb-6">
                W gabinecie kosmetologicznym terapie przeciwstarzeniowe można podzielić na 
                <span className="font-semibold"> zabiegi autologiczne</span> oraz 
                <span className="font-semibold"> stymulatory tkankowe</span>, które z kolei dzielą się na te pochodzenia
                naturalnego oraz syntetyczne polimery.
              </p>
              
              <p className="text-gray-700">
                Wszystkie te grupy mają na celu poprawę jakości skóry,
                spowolnienie procesów starzenia i wspieranie naturalnej regeneracji tkanek, 
                jednak różnią się mechanizmem działania oraz zastosowanymi substancjami.
              </p>
            </div>
            
            {/* Wizualna prezentacja podziału terapii */}
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="bg-pink-50/60 rounded-xl p-8 shadow-sm">
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-xs text-center p-4 mb-8 bg-pink-500 text-white rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold">Terapie przeciwstarzeniowe</h3>
                  </div>
                  
                  <div className="w-0.5 h-8 bg-pink-300\"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {/* Lewa strona - Zabiegi autologiczne */}
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-[#9b87f5] text-white rounded-lg shadow-md text-center w-full">
                        <h4 className="font-medium">Zabiegi autologiczne</h4>
                        <p className="text-sm mt-1 text-white/90">Wykorzystują własne komórki organizmu</p>
                      </div>
                      
                      <div className="w-0.5 h-6 bg-[#9b87f5]"></div>
                      
                      <div className="grid grid-cols-2 gap-3 w-full">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-center border border-[#9b87f5]/20">
                          <p className="text-sm font-medium text-gray-800">PRP</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg shadow-sm text-center border border-[#9b87f5]/20">
                          <p className="text-sm font-medium text-gray-800">F-PRF</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg shadow-sm text-center border border-[#9b87f5]/20">
                          <p className="text-sm font-medium text-gray-800">I-PRF</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg shadow-sm text-center border border-[#9b87f5]/20">
                          <p className="text-sm font-medium text-gray-800">PLASMOO</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Prawa strona - Stymulatory tkankowe */}
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-gold-400 text-white rounded-lg shadow-md text-center w-full">
                        <h4 className="font-medium">Stymulatory tkankowe</h4>
                        <p className="text-sm mt-1 text-white/90">Substancje pobudzające regenerację</p>
                      </div>
                      
                      <div className="w-0.5 h-6 bg-gold-400"></div>
                      
                      <div className="grid grid-cols-1 gap-3 w-full">
                        <div className="p-3 bg-white rounded-lg shadow-sm text-center border border-gold-400/20">
                          <p className="text-sm font-medium text-gray-800">Naturalne (kwas hialuronowy, kolagen...)</p>
                        </div>
                        <div className="p-3 bg-white rounded-lg shadow-sm text-center border border-gold-400/20">
                          <p className="text-sm font-medium text-gray-800">Syntetyczne (PLLA, PDO, PCL)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Sekcja zabiegów autologicznych */}
        <section ref={autologousRef} className="py-16 bg-gradient-to-b from-white to-pink-50/30">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
                <span className="text-[#9b87f5]">Zabiegi </span>
                <span className="text-gray-800">autologiczne</span>
              </h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Przyszłość medycyny estetycznej - wykorzystanie własnych komórek do naturalnej regeneracji
              </p>
            </div>
            
            {/* Trend powrotu do naturalności */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-16">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-semibold mb-4 font-playfair">
                    Czym są zabiegi autologiczne?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    W kontekście medycyny estetycznej zabiegi autologiczne zyskują miano 
                    <span className="text-[#9b87f5] font-semibold"> przyszłości tej dziedziny</span>. 
                    Coraz więcej osób odchodzi od sztucznego efektu, zbyt widocznych wypełniaczy i
                    przesadnej ingerencji na rzecz subtelnego, zdrowego wyglądu.
                  </p>
                  <p className="text-gray-700">
                    Obecnie obserwujemy wyraźny trend powrotu do naturalności – nie tylko w stylu życia, ale także w dbaniu o urodę. 
                    Klienci poszukują metod, które nie zmienią ich rysów, ale przywrócą skórze młodość, 
                    jędrność i blask w sposób jak najbardziej zbliżony do procesów naturalnych.
                  </p>
                </div>
                <div className="md:w-1/2 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-radial from-[#9b87f5]/20 to-transparent rounded-full transform scale-110 animate-pulse"></div>
                    <img 
                      src="/lovable-uploads/a49b2ad5-04a2-47df-b4f5-9c377ef464a3.png" 
                      alt="Zabieg autologiczny" 
                      className="rounded-lg shadow-lg relative z-10 max-w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mechanizm działania */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-16">
              <h3 className="text-2xl font-semibold mb-6 font-playfair text-center">
                Jak działają te zabiegi?
              </h3>
              <p className="text-gray-700 mb-6 text-center max-w-3xl mx-auto">
                Mechanizm działania opiera się na wykorzystaniu składników krwi bogatych w czynniki wzrostu:
              </p>
              
              {/* Czynniki wzrostu */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {growthFactors.map((factor, index) => (
                  <div key={index} className="bg-[#9b87f5]/10 p-4 rounded-lg text-center">
                    <div className="font-bold text-[#9b87f5] text-xl mb-1">{factor.name}</div>
                    <div className="text-gray-700 text-sm">{factor.fullName}</div>
                  </div>
                ))}
              </div>
              
              {/* Efekty działania czynników */}
              <h4 className="text-center text-lg font-medium mb-4">Czynniki te:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {growthFactorEffects.map((effect, index) => (
                  <div key={index} className="flex items-start p-3 bg-white border border-[#9b87f5]/20 rounded-lg shadow-sm">
                    <CheckCircle2 className="text-[#9b87f5] w-5 h-5 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-gray-700">{effect}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rodzaje zabiegów */}
            <h3 className="text-2xl font-bold mb-8 font-playfair text-center">
              Rodzaje zabiegów autologicznych
            </h3>
            
            {/* Tabs dla różnych zabiegów */}
            <Tabs defaultValue="prp" className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8 bg-pink-50/50">
                {autologousTreatments.map((treatment) => (
                  <TabsTrigger 
                    key={treatment.id} 
                    value={treatment.name.toLowerCase().split(' ')[0]}
                    className="font-medium data-[state=active]:text-[#9b87f5] data-[state=active]:shadow-sm"
                  >
                    {treatment.name.split('–')[0].trim()}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {autologousTreatments.map((treatment) => (
                <TabsContent 
                  key={treatment.id} 
                  value={treatment.name.toLowerCase().split(' ')[0]}
                  className="animate-fade-in"
                >
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <div className="p-6 md:p-8">
                        <div className="flex items-center mb-4">
                          {treatment.icon}
                          <h4 className="text-xl font-semibold ml-3">{treatment.name}</h4>
                        </div>
                        {treatment.nickname && (
                          <div className="mb-4 inline-block bg-[#9b87f5]/10 px-3 py-1 rounded-full text-sm font-medium text-[#9b87f5]">
                            {treatment.nickname}
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Forma</p>
                            <p className="text-gray-700">{treatment.form}</p>
                          </div>
                          
                          {treatment.content && (
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Zawartość</p>
                              <p className="text-gray-700">{treatment.content}</p>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Cel</p>
                            <p className="text-gray-700">{treatment.goal}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 font-medium">Efekt</p>
                            <p className="text-gray-700">{treatment.effect}</p>
                          </div>
                          
                          {treatment.additional && (
                            <div>
                              <p className="text-sm text-gray-500 font-medium">Dodatkowe zastosowanie</p>
                              <p className="text-gray-700">{treatment.additional}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-6">
                          <Link 
                            to="/kontakt" 
                            className="inline-flex items-center text-[#9b87f5] font-medium transition-colors group"
                          >
                            Umów wizytę
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                      
                      <div className="bg-pink-50 h-full">
                        <img 
                          src={treatment.image} 
                          alt={treatment.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            
            {/* Zalety zabiegów autologicznych */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-8 font-playfair text-center">
                Zalety zabiegów autologicznych
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {autologousAdvantages.map((advantage, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-[#9b87f5]/10 hover:shadow-lg transition-shadow">
                    <div className="text-[#9b87f5] mb-4">
                      <div className="w-12 h-12 rounded-full bg-[#9b87f5]/10 flex items-center justify-center mb-2">
                        <span className="font-bold text-xl">{index + 1}</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-medium mb-2">{advantage.title}</h4>
                    <p className="text-gray-600 text-sm">{advantage.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Sekcja stymulatorów tkankowych */}
        <section ref={stimulatorsRef} className="py-16 bg-white">
          <div className="container-custom">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
                <span className="text-gold-500">Stymulatory </span>
                <span className="text-gray-800">tkankowe</span>
              </h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                Nowoczesne preparaty pobudzające skórę do naturalnej regeneracji
              </p>
            </div>
            
            {/* Opis stymulatorów */}
            <div className="bg-gold-50/50 rounded-xl shadow-md p-8 mb-16">
              <div className="max-w-3xl mx-auto">
                <p className="text-gray-700 mb-6">
                  W moim gabinecie oferuję Państwu zabiegi z użyciem stymulatorów tkankowych –
                  nowoczesnych preparatów, które pobudzają skórę do regeneracji, poprawiają jej gęstość,
                  jędrność i nawilżenie. Ich celem nie jest chwilowy efekt, ale 
                  <span className="font-semibold"> długotrwała poprawa jakości skóry</span>.
                </p>
                <p className="text-gray-700 mb-6">
                  Stosuję <span className="font-semibold">wyłącznie certyfikowane wyroby medyczne</span> o sprawdzonym składzie i skuteczności.
                </p>
                <p className="text-gray-700">
                  Zabiegi stymulujące to doskonały wybór dla osób, które oczekują naturalnych efektów
                  odmłodzenia, bez sztucznego wyglądu i ingerencji w rysy twarzy.
                </p>
              </div>
            </div>
            
            {/* Rodzaje stymulatorów */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {tissueStimulators.map((category, index) => (
                <div 
                  key={index} 
                  className={`bg-white rounded-xl shadow-md p-8 border-l-4 ${
                    index === 0 ? 'border-pink-400' : 'border-gold-400'
                  }`}
                >
                  <h3 className="text-xl font-semibold mb-6">
                    {category.category}
                  </h3>
                  
                  <ul className="space-y-3">
                    {category.items.map((item, i) => (
                      <li key={i} className="flex items-start">
                        <ChevronRight className="text-gold-500 mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            {/* Efekty przed i po */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold mb-8 font-playfair text-center">
                Porównanie efektów
              </h3>
              
              <div className="max-w-4xl mx-auto">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    <CarouselItem className="md:basis-1/2">
                      <div className="p-1">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                          <div className="p-6">
                            <h4 className="text-lg font-semibold mb-4 text-center">Przed zabiegiem</h4>
                            <img 
                              src="/lovable-uploads/28e228b7-3605-4c15-9731-3c72e9585d6b.png" 
                              alt="Przed zabiegiem" 
                              className="w-full h-64 object-cover rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                    <CarouselItem className="md:basis-1/2">
                      <div className="p-1">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                          <div className="p-6">
                            <h4 className="text-lg font-semibold mb-4 text-center">Po zabiegu</h4>
                            <img 
                              src="/lovable-uploads/4e36b405-2b0b-48e1-a707-234600f8a1c0.png" 
                              alt="Po zabiegu" 
                              className="w-full h-64 object-cover rounded-md"
                            />
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <div className="flex justify-center mt-4">
                    <CarouselPrevious className="relative inset-auto left-auto -right-40" />
                    <CarouselNext className="relative inset-auto right-auto -left-40" />
                  </div>
                </Carousel>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ */}
        <section className="py-16 bg-pink-50/30">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
                <span className="text-pink-500">Często zadawane </span>
                <span className="text-gray-800">pytania</span>
              </h2>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    Czy zabiegi autologiczne są bolesne?
                  </AccordionTrigger>
                  <AccordionContent>
                    Komfort podczas zabiegu jest dla mnie priorytetem. Procedura pobierania krwi jest 
                    minimalne bolesna, a sama aplikacja preparatu poprzedzona jest nałożeniem kremu 
                    znieczulającego. Większość pacjentów ocenia dyskomfort jako minimalny lub umiarkowany.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    Jak długo utrzymują się efekty zabiegów?
                  </AccordionTrigger>
                  <AccordionContent>
                    Efekty zabiegów autologicznych rozwijają się stopniowo i mogą utrzymywać się od 6 
                    do nawet 18 miesięcy, w zależności od indywidualnych cech pacjenta i zastosowanej 
                    metody. Z kolei stymulatory tkankowe mogą działać nawet do 24 miesięcy.
                  </AccordionContent>
