
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitContactForm, ContactFormData } from "@/services/contactService";
import { detectSuspiciousActivity, checkRateLimit } from "@/services/securityService";

const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent_given: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Imię i nazwisko jest wymagane";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email jest wymagany";
    } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(formData.email)) {
      newErrors.email = "Nieprawidłowy format email";
    }

    if (formData.phone && formData.phone.replace(/\D/g, '').length < 9) {
      newErrors.phone = "Numer telefonu musi mieć co najmniej 9 cyfr";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Temat jest wymagany";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Wiadomość jest wymagana";
    }

    if (!formData.consent_given) {
      newErrors.consent = "Zgoda na przetwarzanie danych jest wymagana";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Rate limiting check using the enhanced system
    const rateLimitResult = await checkRateLimit('contact_form', 'contact_form_submission', 3, 60);
    if (!rateLimitResult.allowed) {
      toast.error("Zbyt wiele prób. Spróbuj ponownie za godzinę.");
      return;
    }

    // Detect suspicious activity
    if (detectSuspiciousActivity(formData, 'contact_form')) {
      toast.error("Wykryto podejrzaną aktywność. Sprawdź swoją wiadomość.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData);
      
      if (result.success) {
        toast.success(result.message);
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          consent_given: false
        });
        setErrors({});
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error("Wystąpił błąd podczas wysyłania wiadomości");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
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
                  <p className="text-gray-600">+48 123 456 789</p>
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
                  <p className="text-gray-600">kontakt@klinika.pl</p>
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
                  <p className="text-gray-600">ul. Przykładowa 123<br />00-000 Warszawa</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Imię i nazwisko *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                maxLength={100}
                disabled={isSubmitting}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email *"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                maxLength={255}
                disabled={isSubmitting}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Input
                type="tel"
                placeholder="Telefon"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                maxLength={20}
                disabled={isSubmitting}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Input
                placeholder="Temat *"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                maxLength={200}
                disabled={isSubmitting}
                className={errors.subject ? 'border-red-500' : ''}
              />
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
            </div>

            <div>
              <Textarea
                placeholder="Wiadomość *"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                maxLength={2000}
                rows={5}
                disabled={isSubmitting}
                className={errors.message ? 'border-red-500' : ''}
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={formData.consent_given}
                onCheckedChange={(checked) => handleInputChange('consent_given', !!checked)}
                disabled={isSubmitting}
              />
              <label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed">
                Wyrażam zgodę na przetwarzanie moich danych osobowych w celu udzielenia odpowiedzi na zapytanie zgodnie z 
                <a href="/privacy-policy" className="text-pink-500 hover:underline"> polityką prywatności</a>. *
              </label>
            </div>
            {errors.consent && <p className="text-red-500 text-sm">{errors.consent}</p>}

            <Button 
              type="submit" 
              className="w-full bg-pink-500 hover:bg-pink-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Wyślij wiadomość
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactForm;
