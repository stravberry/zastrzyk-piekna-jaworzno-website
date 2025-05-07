
import React from "react";
import { Button } from "@/components/ui/button";

const ContactForm = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form handling logic would go here
    console.log("Form submitted");
  };

  return (
    <div>
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
  );
};

export default ContactForm;
