
import React from "react";

const MapSection = () => {
  return (
    <section className="py-16 bg-pink-50">
      <div className="container-custom">
        <h2 className="text-2xl font-bold mb-8 text-center font-playfair">
          Jak do nas trafić?
        </h2>
        <div className="rounded-lg overflow-hidden shadow-md h-96">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2554.911413479363!2d19.25055177681162!3d50.20018317182461!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4716da93eed93775%3A0x11972b82a09975d4!2sGrunwaldzka%20106%2C%2043-600%20Jaworzno!5e0!3m2!1spl!2spl!4v1714589987341!5m2!1spl!2spl"
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
  );
};

export default MapSection;
