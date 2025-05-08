
import { BlogPost } from "@/types/admin";

// We're defining a partial BlogPost array here - these properties will be expanded 
// in the services with content and SEO data when needed
const blogPostsData = [
  {
    id: 1,
    title: "Jak przygotować się do zabiegu modelowania ust?",
    excerpt: "Dowiedz się, co robić przed zabiegiem wypełniania ust, aby uzyskać najlepsze efekty i zminimalizować ryzyko powikłań.",
    date: "10 kwietnia 2025",
    category: "Modelowanie ust",
    image: "/lovable-uploads/3ffa044e-7598-4eaf-a751-a518d7f12c8b.jpg",
    readTime: "5 min",
    slug: "/blog/jak-przygotowac-sie-do-zabiegu-modelowania-ust",
  },
  {
    id: 2,
    title: "Pielęgnacja skóry po 40-tce - co warto wiedzieć?",
    excerpt: "Poznaj najważniejsze zasady pielęgnacji skóry dojrzałej i sprawdź, które składniki aktywne są niezastąpione w codziennej rutynie.",
    date: "28 marca 2025",
    category: "Anti-aging",
    image: "/lovable-uploads/2e819def-450f-472d-bf96-82773e78b080.jpg",
    readTime: "8 min",
    slug: "/blog/pielegnacja-skory-po-40-tce",
  },
  {
    id: 3,
    title: "Brwi idealne - makijaż permanentny czy laminacja?",
    excerpt: "Porównujemy dwa popularne zabiegi na brwi. Sprawdź, które rozwiązanie będzie lepsze dla Ciebie.",
    date: "15 marca 2025",
    category: "Makijaż permanentny",
    image: "/lovable-uploads/9ab7a07f-c052-4dff-a5bc-07a270a5d943.png",
    readTime: "6 min",
    slug: "/blog/brwi-idealne-makijaz-permanentny-czy-laminacja",
  },
  {
    id: 4,
    title: "Mezoterapia igłowa - wszystko co musisz wiedzieć",
    excerpt: "Szczegółowy przewodnik po mezoterapii igłowej - wskazania, przeciwwskazania, przebieg zabiegu i efekty.",
    date: "2 marca 2025",
    category: "Mezoterapia",
    image: "/lovable-uploads/4213b2f8-4c25-45f4-a2e0-b49b708c6d8c.png",
    readTime: "10 min",
    slug: "/blog/mezoterapia-iglowa-przewodnik",
  },
  {
    id: 5,
    title: "Jak dbać o skórę po peelingach chemicznych?",
    excerpt: "Poznaj zasady pielęgnacji skóry po peelingu chemicznym, aby zmaksymalizować efekty zabiegu i uniknąć podrażnień.",
    date: "18 lutego 2025",
    category: "Peelingi chemiczne",
    image: "/lovable-uploads/a49b2ad5-04a2-47df-b4f5-9c377ef464a3.png",
    readTime: "7 min",
    slug: "/blog/jak-dbac-o-skore-po-peelingach-chemicznych",
  },
  {
    id: 6,
    title: "Autologiczne zabiegi w kosmetologii - przyszłość medycyny estetycznej",
    excerpt: "Dowiedz się więcej o zabiegach wykorzystujących materiał biologiczny pacjenta - fibrynie, osoczu i innych innowacyjnych metodach.",
    date: "5 lutego 2025",
    category: "Autologia",
    image: "/lovable-uploads/8911cfd6-7a54-4b02-8722-20c61218807d.png", 
    readTime: "9 min",
    slug: "/blog/autologiczne-zabiegi-w-kosmetologii",
  },
];

// Export as any since we will expand these in the service layer
export const blogPosts: any[] = blogPostsData;
