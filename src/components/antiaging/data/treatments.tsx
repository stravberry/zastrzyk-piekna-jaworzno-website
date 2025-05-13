
import React from "react";
import { Droplet, Sparkles, Dna, FlaskConical } from "lucide-react";
import { TreatmentType, AdvantageType, StimulatorCategory, GrowthFactorType } from "../types";

export const autologousTreatments: TreatmentType[] = [
  {
    id: 1,
    name: "PRP – Osocze bogatopłytkowe",
    nickname: "Wampirzy lifting",
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

export const autologousAdvantages: AdvantageType[] = [
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

export const tissueStimulators: StimulatorCategory[] = [
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

export const growthFactors: GrowthFactorType[] = [
  { name: "PDGF", fullName: "Płytkopochodny czynnik wzrostu" },
  { name: "TGF-β", fullName: "Transformujący czynnik wzrostu" },
  { name: "VEGF", fullName: "Naczyniowo-śródbłonkowy czynnik wzrostu" }
];

export const growthFactorEffects: string[] = [
  "Aktywują fibroblasty do produkcji kolagenu i elastyny",
  "Stymulują mezenchymalne komórki macierzyste do różnicowania (więcej komórek skóry, więcej fibroblastów, więcej kolagenu)",
  "Przyspieszają regenerację i poprawiają napięcie skóry",
  "Wpływają na angiogenezę (tworzenie się nowych naczyń krwionośnych)"
];
