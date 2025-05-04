
import React from "react";
import { Star } from "lucide-react";

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-pink-50/30 p-6 rounded-lg shadow-sm border border-pink-100"
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
      </div>
    </section>
  );
};

export default TestimonialsSection;
