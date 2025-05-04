
import React, { useEffect } from "react";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Piotr P.",
      testimonial: "Miałem okazję być u Pani Ani na zabiegu który miał poprawić stan mojej skóry wokół oczu. Bałem się strasznie, ale Pani Ania wszystko mi wyjasniła i oddałem się w jej ręcę i zdecydowanie nie żałuję! Zabieg wykonany bardzo profesjonalnie, za jakiś czas znowu zawitam na kolejną serię zabiegów pod oczy. Pozdrawiam Panią Anię :)",
      rating: 5,
    },
    {
      id: 2,
      name: "Joanna P.",
      testimonial: "Korzystam od kilku dobrych lat z różnych zabiegów wykonywanych przez Anię i nigdy się nie zawiodłam! Ogromny profesjonalizm, idealnie dobrane zabiegi i niezwykła troska o pacjenta. Przepięknie urządzony gabinet, w którym czuję się bardzo komfortowo. Polecam każdemu, kto chce o siebie zadbać na najwyższym poziomie!",
      rating: 5,
    },
    {
      id: 3,
      name: "Paulina C.",
      testimonial: "Polecam Kosmetolog Anie. Miałam robione usta i efekt przeszedł moje najśmielsze oczekiwania – są idealnie wymodelowane i wyglądają bardzo naturalnie. Usta były wcześniej modelowane i rozpuszczane więc po przejściach. Pani Ania która się mną zajmowała, to prawdziwa profesjonalistka, Atmosfera w gabinecie byla cudowna – czułam się tam bardzo swobodnie i zaopiekowana.",
      rating: 5,
    },
    {
      id: 4,
      name: "Edyta K.",
      testimonial: "Ania, przesympatyczna i co najważniejsze, właściwa osoba na właściwym miejscu. Swoją pracę wykonuje z najwyższą starannością, higieną, perfekcją. Widać, że sprawia Jej radość. Bardzo mądra i ambitna. Chętnie odpowiada na zadane pytania, lubi dzielić się swoją wiedzą ☺️ Serdecznie polecam wszelkie zabiegi u Ani, która wie co robi, dzięki czemu, zdobyła tytuł: Kosmetolog roku 2024 🫶🏻❤️ Polecam 🥰",
      rating: 5,
    },
    {
      id: 5,
      name: "Beata T.",
      testimonial: "Wprawdzie do tego salonu ma daleko, ale warto. Zanim postanowiłam skorzystać z usług obserwowałam prace Ani. Z relacji widziałam sukcesywny rozwój nie tylko praktyczny, ale też zdobywanie wiedzy naukowej. Jak dla mnie precyzyjnie, estetycznie, w rozsądnej cenie. Na pewno kolejne zabiegi będę wykonywać tam, nie warto ze swoim zdrowiem i wyglądem iść byle gdzie. Polecam w stu procentach !!!",
      rating: 5,
    },
  ];

  const isMobile = useIsMobile();

  // Group testimonials differently based on screen size
  const testimonialGroups = [];
  const itemsPerGroup = isMobile ? 1 : 3; // Show 1 testimonial on mobile, 3 on desktop
  
  for (let i = 0; i < testimonials.length; i += itemsPerGroup) {
    testimonialGroups.push(testimonials.slice(i, i + itemsPerGroup));
  }

  // Auto-advance carousel
  const [api, setApi] = React.useState<any>();
  const [current, setCurrent] = React.useState(0);

  // Setup carousel auto-scroll with faster rotation
  useEffect(() => {
    if (!api) return;

    // Faster carousel rotation: 4 seconds instead of 6
    const interval = setInterval(() => {
      api.scrollNext();
    }, 4000); // Change slide every 4 seconds (faster than before)

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [api]);

  // Update current index when slide changes
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            <span>Opinie </span>
            <span className="text-pink-500">Klientek i Klientów</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Poznaj doświadczenia naszych klientek i klientów, które skorzystali z zabiegów w gabinecie
            kosmetologicznym Zastrzyk Piękna w Jaworznie.
          </p>
        </div>

        <div className="mx-auto max-w-5xl">
          <Carousel
            setApi={setApi}
            className="relative"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {testimonialGroups.map((group, groupIndex) => (
                <CarouselItem key={groupIndex}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {group.map((testimonial) => (
                      <div
                        key={testimonial.id}
                        className="bg-pink-50/30 p-6 rounded-lg shadow-sm border border-pink-100 h-full"
                      >
                        <div className="flex mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              size={18}
                              className="text-gold-400 fill-gold-400"
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 italic mb-4">"{testimonial.testimonial}"</p>
                        <p className="text-pink-500 font-medium">{testimonial.name}</p>
                      </div>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-2 mt-6">
              {testimonialGroups.map((_, index) => (
                <button
                  key={index}
                  className={`h-2.5 w-2.5 rounded-full ${
                    current === index ? "bg-pink-500" : "bg-pink-200"
                  }`}
                  onClick={() => api?.scrollTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
