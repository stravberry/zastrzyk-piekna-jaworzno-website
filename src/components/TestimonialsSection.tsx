
import React from "react";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "Aleksandra K.",
      testimonial: "Jestem zachwycona efektami po zabiegu modelowania ust. Pani Anna ma niezwykłe wyczucie estetyki i perfekcyjnie dobrała kształt do mojej twarzy.",
      rating: 5,
    },
    {
      id: 2,
      name: "Monika S.",
      testimonial: "Mezoterapia igłowa w wykonaniu Pani Ani to zabieg, który naprawdę działa. Moja skóra jest promienista, nawilżona i znacznie bardziej jędrna.",
      rating: 5,
    },
    {
      id: 3,
      name: "Katarzyna W.",
      testimonial: "Makijaż permanentny brwi odmienił moją twarz. Pani Anna perfekcyjnie dobrała kształt i kolor, efekt jest niezwykle naturalny.",
      rating: 5,
    },
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-playfair">
            <span>Opinie </span>
            <span className="text-pink-500">Klientek</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Poznaj doświadczenia naszych klientek, które skorzystały z zabiegów w gabinecie
            kosmetologicznym Zastrzyk Piękna w Jaworznie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
