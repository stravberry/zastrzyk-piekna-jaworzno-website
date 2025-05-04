
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight } from "lucide-react";

const Pricing = () => {
  type PriceItem = {
    name: string;
    price: string;
    description?: string;
  };

  type PriceCategory = {
    id: string;
    title: string;
    items: PriceItem[];
  };

  const priceCategories: PriceCategory[] = [
    {
      id: "stimulators",
      title: "Stymulatory i redermalizatory tkankowe",
      items: [
        // KWAS POLIMLEKOWY
        { name: "Sculptra (1 amp.)", price: "1800 zł", description: "Najsilniejszy dostępny na rynku stymulator kolagenu" },
        
        // KOLAGEN
        { name: "Karisma", price: "1000 zł" },
        { name: "Linerase, Nithya, Collease+", price: "950 zł" },
        { name: "Monoderma Fillagen", price: "850 zł" },
        { name: "Tropokolagen MD Tissue (1 amp.)", price: "400 zł" },
        { name: "Tropokolagen MD Tissue (2 amp.)", price: "700 zł" },
        { name: "Tropokolagen MD Tissue (3 amp.)", price: "900 zł" },
        
        // AMINOKWASY
        { name: "Sunekos 1200", price: "1000 zł" },
        { name: "Jalupro", price: "800 zł" },
        { name: "Sunekos 200", price: "600 zł" },
        { name: "Revok 50", price: "900 zł" },
        
        // POLINUKLEOTYDY
        { name: "Nucleofill (strong/medium)", price: "950 zł" },
        { name: "Nucleofill soft eyes", price: "900 zł" },
        
        // KWAS HIALURONOWY
        { name: "Profhilo", price: "1100 zł" },
        { name: "Sisthema Hevo+T, Jalupro Super Hydro", price: "950 zł" },
        { name: "Ejal40, Neauvia Hydro Deluxe", price: "650 zł" },
        
        // BURSZTYNIAN SODU
        { name: "Bursztynian sodu 2,2%", price: "850 zł", description: "Możliwość regeneracji i nawilżenia ust bez wpływu na ich wielkość/kształt" },
        { name: "Bursztynian sodu 1,8%", price: "800 zł" },
        { name: "Bursztynian sodu 1,1%", price: "750 zł" },
        
        // PCL
        { name: "Ellanse S", price: "1400 zł" },
        { name: "Ellanse M", price: "1600 zł" },
        { name: "Gouri", price: "1100 zł", description: "Daje naturalny efekt odmłodzenia i poprawy jakości skóry, bez dużej objętości" },
        
        // NICI PDO / PLLA
        { name: "Nici PDO", price: "39 zł/nić", description: "Subtelne wygładzenie zmarszczek, poprawa napięcia skóry, efekt na ok. 1 rok" },
        { name: "Nici PLLA", price: "49 zł/nić", description: "Silniejsze działanie biostymulujące, bardziej zauważalna poprawa gęstości i jędrności skóry" },
      ]
    },
    {
      id: "autology",
      title: "Autologia (zabiegi z wykorzystaniem własnej krwi)",
      items: [
        { name: "Fibryna strukturalna", price: "800-1000 zł" },
        { name: "Fibryna bogatokomórkowa", price: "800-1000 zł" },
        { name: "Osocze bogatopłytkowe (wampirzy lifting)", price: "700 zł" },
        { name: "PLASMOO", price: "1200 zł", description: "Innowacyjny zabieg wykorzystujący 4 frakcje materiału autologicznego" },
        { name: "Full Face Natural", price: "1500 zł", description: "Autologiczny wypełniacz dający efekt naturalnej wolumetrii" },
      ]
    },
    {
      id: "makeup",
      title: "Makijaż permanentny",
      items: [
        { name: "Brwi Ombre", price: "850 zł" },
        { name: "Korekta (po 6 tyg.)", price: "100 zł" },
        { name: "Odświeżenie makijażu", price: "500 zł" },
      ]
    },
    {
      id: "lips",
      title: "Modelowanie i powiększanie ust",
      items: [
        { name: "Modelowanie ust", price: "700 zł" },
        { name: "Hialuronidaza", price: "700 zł", description: "Każdy kolejny zabieg 450 zł jeśli zajdzie taka potrzeba" },
        { name: "Wolumetria kwasem hialuronowym 1 ml", price: "700 zł" },
        { name: "Wolumetria kwasem hialuronowym 2 ml", price: "1300 zł" },
        { name: "Wolumetria kwasem hialuronowym 3 ml", price: "1900 zł" },
        { name: "Korekta marionetek", price: "1000 zł", description: "Użycie usieciowanego kwasu hialuronowego w obszarze tzw. kokardki" },
        { name: "Koktajl Monaco - lifting królewski", price: "950 zł" },
      ]
    },
    {
      id: "mesotherapy",
      title: "Mezoterapia igłowa",
      items: [
        { name: "Mezoterapia twarzy", price: "500 zł" },
        { name: "Mezoterapia szyi", price: "550 zł" },
        { name: "Mezoterapia dekoltu", price: "600 zł" },
        { name: "Mezoterapia okolicy oczu", price: "350 zł" },
        { name: "Nucleofill Hair (owłosiona skóra głowy)", price: "900 zł" },
        { name: "Dr Cyj (owłosiona skóra głowy)", price: "650 zł" },
      ]
    },
    {
      id: "lipolysis",
      title: "Lipoliza iniekcyjna",
      items: [
        { name: "Twarz (Lemonbottle)", price: "400 zł" },
        { name: "Ciało (Lipolax+)", price: "od 400 do 700 zł", description: "Redukcja lokalnej tkanki tłuszczowej. Podczas jednego zabiegu można podać max.20ml preparatu" },
      ]
    },
    {
      id: "peels",
      title: "Peelingi chemiczne",
      items: [
        { name: "Retix C4%", price: "350 zł" },
        { name: "PQ AGE", price: "350 zł" },
        { name: "PRX T33", price: "350 zł" },
        { name: "BioRePeel", price: "400 zł" },
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-pink-50 py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
              <span className="text-pink-500">Cennik </span>
              <span>Zabiegów</span>
            </h1>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Zapoznaj się z cennikiem zabiegów kosmetologicznych w gabinecie kosmetologicznym w Jaworznie.
              Zabiegi wykonywane są z najwyższej jakości certyfikowanych produktów.
            </p>
          </div>
        </section>

        {/* Quick Navigation */}
        <div className="bg-white py-6 shadow-sm sticky top-16 z-10">
          <div className="container-custom">
            <ScrollArea className="w-full">
              <div className="flex space-x-4 pb-2 overflow-x-auto min-w-full">
                {priceCategories.map((category) => (
                  <a 
                    key={category.id}
                    href={`#${category.id}`}
                    className="px-4 py-2 whitespace-nowrap bg-pink-50 text-pink-600 rounded-md hover:bg-pink-100 transition-colors font-medium flex items-center"
                  >
                    {category.title}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </a>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Pricing Section - All Categories */}
        <section className="py-16 bg-white">
          <div className="container-custom space-y-16">
            {priceCategories.map((category) => (
              <div key={category.id} id={category.id} className="scroll-mt-32">
                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-pink-100 mb-8">
                  <div className="bg-pink-500 py-4 px-6">
                    <h2 className="text-xl md:text-2xl font-bold text-white font-playfair">
                      {category.title}
                    </h2>
                  </div>

                  <div className="p-1">
                    <table className="w-full">
                      <thead className="bg-pink-50">
                        <tr>
                          <th className="py-3 px-6 text-left text-gray-700">Nazwa zabiegu</th>
                          <th className="py-3 px-6 text-right text-gray-700">Cena</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.items.map((item, index) => (
                          <React.Fragment key={index}>
                            <tr className={index % 2 === 0 ? "bg-white" : "bg-pink-50/30"}>
                              <td className="py-4 px-6">
                                <span className="font-medium">{item.name}</span>
                              </td>
                              <td className="py-4 px-6 text-right text-pink-600 font-medium">
                                {item.price}
                              </td>
                            </tr>
                            {item.description && (
                              <tr className={index % 2 === 0 ? "bg-white" : "bg-pink-50/30"}>
                                <td colSpan={2} className="py-2 px-6 text-sm text-gray-600 italic border-b border-pink-100/50">
                                  {item.description}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-center mt-12 space-y-6">
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ceny zabiegów mogą się różnić w zależności od obszaru zabiegowego i indywidualnych potrzeb.
                Szczegółowa wycena zostanie przedstawiona podczas konsultacji.
              </p>
              <Button asChild className="bg-pink-500 hover:bg-pink-600 text-white">
                <Link to="/kontakt">Umów konsultację</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Info Box */}
        <section className="py-12 bg-pink-50">
          <div className="container-custom">
            <div className="bg-white p-6 rounded-lg shadow-md border border-pink-100 max-w-3xl mx-auto">
              <h3 className="text-xl font-semibold mb-4 text-pink-500 font-playfair">
                Informacje dodatkowe
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span>Ceny zabiegów obejmują konsultację kosmetologiczną.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span>Zalecane serie zabiegowe oraz odstępy między zabiegami ustalane są indywidualnie.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span>Płatność możliwa gotówką lub kartą płatniczą.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span>W przypadku odwołania wizyty, prosimy o informację minimum 24 godziny przed planowanym terminem.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
