
import { Heart, Award, Star, Sparkles, Shield, GraduationCap, Clock, Trophy } from "lucide-react";

export interface BentoGridItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  size: string;
  badge?: string;
  comparison?: {
    others: string;
    me: string;
  };
}

export const bentoGridData: BentoGridItem[] = [
  {
    id: "approach",
    title: "Indywidualne podejście",
    description: "Każdy klient otrzymuje spersonalizowaną opiekę dostosowaną do jego unikalnych potrzeb",
    icon: Heart,
    gradient: "bg-gradient-to-br from-pink-500 to-pink-600",
    size: "md:col-span-3 lg:col-span-3 h-48",
    comparison: {
      others: "Standardowe",
      me: "Holistyczne"
    }
  },
  {
    id: "award",
    title: "Kosmetolog Roku",
    description: "Laureatka prestiżowego tytułu Kosmetologa Roku województwa śląskiego",
    icon: Award,
    gradient: "bg-gradient-to-br from-gold-500 to-gold-600",
    size: "md:col-span-3 lg:col-span-2 h-48",
    badge: "2024"
  },
  {
    id: "education",
    title: "Wykształcenie",
    description: "Magister kosmetologii z Uniwersytetu Śląskiego, studentka pielęgniarstwa",
    icon: GraduationCap,
    gradient: "bg-gradient-to-br from-purple-500 to-purple-600",
    size: "md:col-span-2 lg:col-span-3 h-48"
  },
  {
    id: "specialization",
    title: "Specjalizacje",
    description: "Anti-aging, modelowanie ust, makijaż permanentny brwi",
    icon: Sparkles,
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    size: "md:col-span-2 lg:col-span-2 h-48"
  },
  {
    id: "experience",
    title: "Doświadczenie",
    description: "Lata praktyki w medycynie estetycznej i kosmetologii",
    icon: Clock,
    gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    size: "md:col-span-2 lg:col-span-2 h-48"
  },
  {
    id: "quality",
    title: "Jakość preparatów",
    description: "Wyłącznie sprawdzone, certyfikowane preparaty najwyższej jakości",
    icon: Shield,
    gradient: "bg-gradient-to-br from-teal-500 to-teal-600",
    size: "md:col-span-3 lg:col-span-3 h-48",
    comparison: {
      others: "Niska jakość",
      me: "Premium produkty"
    }
  },
  {
    id: "results",
    title: "Gwarancja efektów",
    description: "Naturalne, długotrwałe rezultaty dzięki najnowszym technikom",
    icon: Trophy,
    gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
    size: "md:col-span-3 lg:col-span-3 h-48"
  }
];
