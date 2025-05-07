
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Instagram, Clock } from "lucide-react";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form handling logic would go here
    console.log("Form submitted");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <section className="bg-pink-50 py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-playfair">
              <span className="text-pink-500">Kontakt </span>
              <span>z Gabinetem</span>
            </h1>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Skontaktuj się z nami, aby umówić wizytę w gabinecie kosmetologii estetycznej
              Zastrzyk Piękna w Jaworznie lub zadać pytanie dotyczące zabiegów.
            </p>
          </div>
        </section>

        {/* Contact Info & Form */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="order-2 lg:order-1">
                <div className="bg-pink-50/50 p-8 rounded-lg h-full">
                  <h2 className="text-2xl font-bold mb-6 font-playfair">
                    Informacje kontaktowe
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-start">
                      <MapPin className="text-pink-500 w-5 h-5 mt-1 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Adres</h3>
                        <p className="text-gray-600">ul. Przykładowa 123</p>
                        <p className="text-gray-600">43-600 Jaworzno</p>
                        <p className="text-gray-600">woj. śląskie</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Phone className="text-pink-500 w-5 h-5 mt-1 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Telefon</h3>
                        <a href="tel:+48123456789" className="text-gray-600 hover:text-pink-500 transition-colors">
                          +48 123 456 789
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Mail className="text-pink-500 w-5 h-5 mt-1 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                        <a href="mailto:kontakt@zastrzykpiekna.pl" className="text-gray-600 hover:text-pink-500 transition-colors">
                          kontakt@zastrzykpiekna.pl
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Instagram className="text-pink-500 w-5 h-5 mt-1 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Instagram</h3>
                        <a href="https://instagram.com/zastrzyk_piekna" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-500 transition-colors">
                          @zastrzyk_piekna
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Clock className="text-pink-500 w-5 h-5 mt-1 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Godziny otwarcia</h3>
                        <p className="text-gray-600">Poniedziałek - Piątek: 10:00 - 18:00</p>
                        <p className="text-gray-600">Sobota: 10:00 - 14:00</p>
                        <p className="text-gray-600">Niedziela: Zamknięte</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl font-bold mb-6 font-playfair">
                  Formularz kontaktowy
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2">
                      Imię i nazwisko
                    </label>
                    <input
                      type="text"
                      id="name"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                      Adres email
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-2">
                      Numer telefonu
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-gray-700 mb-2">
                      Temat
                    </label>
                    <select
                      id="subject"
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    >
                      <option value="">Wybierz temat</option>
                      <option value="appointment">Umówienie wizyty</option>
                      <option value="info">Pytanie o zabieg</option>
                      <option value="price">Pytanie o cenę</option>
                      <option value="other">Inny temat</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-gray-700 mb-2">
                      Wiadomość
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    ></textarea>
                  </div>

                  <div className="flex items-center">
                    <input type="checkbox" id="consent" className="mr-2" required />
                    <label htmlFor="consent" className="text-sm text-gray-600">
                      Wyrażam zgodę na przetwarzanie moich danych osobowych w celu odpowiedzi na zapytanie.
                    </label>
                  </div>

                  <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white w-full">
                    Wyślij wiadomość
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 bg-pink-50">
          <div className="container-custom">
            <h2 className="text-2xl font-bold mb-8 text-center font-playfair">
              Jak do nas trafić?
            </h2>
            <div className="rounded-lg overflow-hidden shadow-md h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2555.034745259741!2d19.271557800000003!3d50.197916099999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4716c5f8279c8b99%3A0x95ab9f3a1c2236d4!2sHollywood%20Fit%20Candy!5e0!3m2!1spl!2spl!4v1714589606694!5m2!1spl!2spl"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa lokalizacji gabinetu Zastrzyk Piękna"
              ></iframe>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
