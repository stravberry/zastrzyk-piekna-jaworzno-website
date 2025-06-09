
import { Heart, Award, Star, Sparkles, Shield, GraduationCap, Clock, Trophy } from "lucide-react";

export interface FloatingCardData {
  id: string;
  title: string;
  description: string;
  expandedContent: string;
  icon: React.ElementType;
  gradient: string;
  badge?: string;
  comparison?: {
    others: string;
    me: string;
  };
}

export const floatingCardsData: FloatingCardData[] = [
  {
    id: "approach",
    title: "Indywidualne podejście",
    description: "Każdy klient otrzymuje spersonalizowaną opiekę dostosowaną do jego unikalnych potrzeb",
    expandedContent: "Przeprowadzam szczegółową konsultację przed każdym zabiegiem, analizując stan skóry i oczekiwania klienta.",
    icon: Heart,
    gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
    comparison: {
      others: "Standardowe",
      me: "Holistyczne"
    }
  },
  {
    id: "award",
    title: "Kosmetolog Roku",
    description: "Laureatka prestiżowego tytułu Kosmetologa Roku województwa śląskiego",
    expandedContent: "Wyróżnienie przyznane za innowacyjne podejście i najwyższą jakość świadczonych usług kosmetologicznych.",
    icon: Award,
    gradient: "bg-gradient-to-br from-gold-500 to-gold-600",
    badge: "2024"
  },
  {
    id: "education",
    title: "Wykształcenie",
    description: "Magister kosmetologii z Uniwersytetu Śląskiego, studentka pielęgniarstwa",
    expandedContent: "Ciągłe podnoszenie kwalifikacji i uczestnictwo w najnowszych szkoleniach branżowych.",
    icon: GraduationCap,
    gradient: "bg-gradient-to-br from-purple-500 to-purple-600"
  },
  {
    id: "specialization",
    title: "Specjalizacje",
    description: "Anti-aging, modelowanie ust, makijaż permanentny brwi",
    expandedContent: "Specjalizuję się w zabiegach dających natychmiastowy efekt i długotrwałe rezultaty.",
    icon: Sparkles,
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600"
  },
  {
    id: "experience",
    title: "Doświadczenie",
    description: "Lata praktyki w medycynie estetycznej i kosmetologii",
    expandedContent: "Bogate doświadczenie zdobyte w pracy z różnorodnymi przypadkami i typami skóry.",
    icon: Clock,
    gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600"
  },
  {
    id: "quality",
    title: "Jakość preparatów",
    description: "Wyłącznie sprawdzone, certyfikowane preparaty najwyższej jakości",
    expandedContent: "Współpraca tylko z renomowanymi markami kosmetycznymi o udowodnionej skuteczności.",
    icon: Shield,
    gradient: "bg-gradient-to-br from-teal-500 to-teal-600",
    comparison: {
      others: "Niska jakość",
      me: "Premium produkty"
    }
  },
  {
    id: "results",
    title: "Gwarancja efektów",
    description: "Naturalne, długotrwałe rezultaty dzięki najnowszym technikom",
    expandedContent: "Stosowanie najnowszych metod i technologii zapewniających widoczne i trwałe efekty.",
    icon: Trophy,
    gradient: "bg-gradient-to-br from-orange-500 to-orange-600"
  }
];
