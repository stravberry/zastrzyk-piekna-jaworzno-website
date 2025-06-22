
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";

const ContactForm = () => {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Contact Information */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Skontaktuj się z nami</h2>
          <p className="text-gray-600 mb-6">
            Masz pytania dotyczące naszych zabiegów? Chcesz umówić się na konsultację? 
            Skontaktuj się z nami już dziś!
          </p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="font-medium">Telefon</p>
                  <p className="text-gray-600">514 902 242</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">zastrzykpiekna.kontakt@gmail.com</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-pink-500" />
                <div>
                  <p className="font-medium">Adres</p>
                  <p className="text-gray-600">Grunwaldzka 106<br />43-600 Jaworzno</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="h-5 w-5 text-pink-500 flex items-center justify-center">
                  <div className="h-3 w-3 bg-pink-500 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium">Godziny</p>
                  <p className="text-gray-600">Czynne całą dobę</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
