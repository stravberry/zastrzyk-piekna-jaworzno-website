import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

const AboutMe = () => {
  const isMobile = useIsMobile();
  const comparisonData = [{
    category: "Podejście do klienta",
    others: "Standardowe, często schematyczne",
    clinic: "Indywidualne, holistyczne podejście"
  }, {
    category: "Doświadczenie",
    others: "Różne poziomy",
    clinic: "Laureatka Kosmetologa Roku woj. śląskiego"
  }, {
    category: "Wykształcenie",
    others: "Kursy i szkolenia",
    clinic: "Magister kosmetologii, studentka pielęgniarstwa"
  }, {
    category: "Specjalizacja",
    others: "Ogólna",
    clinic: "Anti-aging, usta, makijaż permanentny brwi"
  }, {
    category: "Jakość preparatów",
    others: "Niejednokrotnie niska",
    clinic: "Tylko sprawdzone, certyfikowane preparaty"
  }, {
    category: "Efekty zabiegów",
    others: "Niekiedy powierzchowne",
    clinic: "Widoczne, precyzyjne i trwałe rezultaty"
  }, {
    category: "Wiedza i rozwój",
    others: "Rzadko aktualizowana",
    clinic: "Ciągłe szkolenia, aktualna wiedza branżowa"
  }, {
    category: "Komunikacja z klientem",
    others: "Głównie telefoniczna",
    clinic: "Dostępność online, Instagram, rolki edukacyjne"
  }];
  return <div className="min-h-screen flex flex-col">
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
              <p>
                Moją specjalnością są terapie przeciwstarzeniowe, modelowanie ust oraz makijaż permanentny brwi.
                "Branża beauty to ocean niekończących się możliwości. Motywuje mnie to do ciągłego podnoszenia kwalifikacji 
                i umiejętności oraz pozyskiwania wiedzy w zakresie rozwijającej się medycyny estetycznej i kosmetologii.
              </p>
              <p>
                Starzenia nie da się zatrzymać, ale można je spowolnić". Holistyczne podejście to klucz to wspaniałego 
                wyglądu i samopoczucia i takie podejście promuje na swoich mediach społecznościowych i w codziennym życiu.
                Moją specjalnością są zdecydowanie terapie przeciwstarzeniowe, ale te wymagają czasu, wytrwałości 
                i konsekwencji ze strony klientki.
              </p>
              <p>
                Ze względu na wrodzone zdolności manualne uwielbiam zabiegi, które dają natychmiastowy efekt i są 
                w stanie zmienić nasz wygląd w przeciągu jednego zabiegu. Zapraszam na mój Instagram @zastrzyk_piekna 
                oraz zachęcam do obejrzenia wszystkich rolek edukacyjnych znajdujących się na moim profilu.
              </p>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 bg-pink-50">
          <div className="container-custom">
            <h2 className="text-3xl font-bold mb-8 font-playfair text-center">
              <span>Dlaczego warto wybrać </span>
              <span className="text-pink-500">mój gabinet?</span>
            </h2>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
              <Table className="w-full text-sm md:text-base">
                <TableHeader>
                  <TableRow className="bg-pink-500 text-white">
                    <TableHead className="py-3 px-2 md:px-4 text-left font-medium text-white">Kategoria</TableHead>
                    <TableHead className="py-3 px-2 md:px-4 text-left font-medium text-white">Inne gabinety</TableHead>
                    <TableHead className="py-3 px-2 md:px-4 text-left font-medium text-white">Zastrzyk Piękna – Anna Gajęcka</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonData.map((item, index) => (
                    <TableRow key={index} className={index % 2 === 0 ? 'bg-pink-50/30' : 'bg-white'}>
                      <TableCell className="py-2 px-2 md:px-4 font-medium text-xs md:text-sm">{item.category}</TableCell>
                      <TableCell className="py-2 px-2 md:px-4 text-gray-600 text-xs md:text-sm">{item.others}</TableCell>
                      <TableCell className="py-2 px-2 md:px-4 text-pink-600 font-medium text-xs md:text-sm">{item.clinic}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
    </div>;
};
export default AboutMe;
