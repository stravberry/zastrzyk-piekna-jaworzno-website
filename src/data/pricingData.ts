
import { PriceCategory } from "@/components/pricing/PriceCard";

export const priceCategories: PriceCategory[] = [
  {
    id: "stimulators",
    title: "Stymulatory i redermalizatory tkankowe",
    items: [
      // KWAS POLIMLEKOWY
      { name: "Sculptra (1 amp.)", price: "1800 zł", description: "Najsilniejszy dostępny na rynku stymulator kolagenu", badge: "new" },
      
      // KOLAGEN
      { name: "Karisma", price: "1000 zł" },
      { name: "Linerase, Nithya, Collease+", price: "950 zł" },
      { name: "Monoderma Fillagen", price: "850 zł" },
      { name: "Tropokolagen MD Tissue", price: "Od 400 zł", description: "1 amp. - 400 zł, 2 amp. - 700 zł, 3 amp. - 900 zł", badge: "promotion" },
      
      // AMINOKWASY
      { name: "Sunekos 1200", price: "1000 zł" },
      { name: "Jalupro", price: "800 zł" },
      { name: "Sunekos 200", price: "600 zł" },
      { name: "Revok 50", price: "900 zł", badge: "new" },
      
      // POLINUKLEOTYDY
      { name: "Nucleofill (strong/medium)", price: "950 zł" },
      { name: "Nucleofill soft eyes", price: "900 zł" },
      
      // KWAS HIALURONOWY
      { name: "Profhilo", price: "1100 zł" },
      { name: "Sisthema Hevo+T, Jalupro Super Hydro", price: "950 zł" },
      { name: "Ejal40, Neauvia Hydro Deluxe", price: "650 zł" },
      
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
      { name: "PLASMOO", price: "1200 zł", description: "Innowacyjny zabieg wykorzystujący 4 frakcje materiału autologicznego", badge: "new" },
      { name: "Full Face Natural", price: "1500 zł", description: "Autologiczny wypełniacz dający efekt naturalnej wolumetrii" },
    ]
  },
  {
    id: "makeup",
    title: "Makijaż permanentny",
    items: [
      { name: "Brwi Ombre", price: "850 zł" },
      { name: "Korekta (po 6 tyg.)", price: "100 zł" },
      { name: "Odświeżenie makijażu", price: "500 zł", badge: "promotion" },
    ]
  },
  {
    id: "lip-revitalization",
    title: "Rewitalizacja ust bez trwałego efektu powiększenia",
    items: [
      { name: "Xela Rederm", price: "850 zł", description: "Możliwość regeneracji to przy Xela Rederm 1,1%" },
      { name: "SkinFill Bacio", price: "850 zł" },
      { name: "Osocze bogatopłytkowe", price: "700 zł" },
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
      { name: "Koktajl Monaco - lifting królewski", price: "950 zł", badge: "new" },
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
      { name: "Twarz (Lemonbottle)", price: "400 zł", badge: "promotion" },
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
