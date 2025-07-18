
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { submitContactForm, ContactFormData } from "@/services/contactService";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";
import { useAdvancedTracking } from "@/hooks/useAdvancedTracking";

const contactSchema = z.object({
  name: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
  email: z.string().email("Nieprawidłowy format email"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Temat musi mieć co najmniej 3 znaki"),
  message: z.string().min(10, "Wiadomość musi mieć co najmniej 10 znaków"),
  consent_given: z.boolean().refine(val => val === true, "Zgoda jest wymagana"),
});

const ContactForm = () => {
  const { trackConversion, trackFormInteraction, trackFormField } = useAdvancedTracking();

  // Fixed default values - all required fields must have defined values
  const defaultValues: ContactFormData = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent_given: false,
  };

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues,
  });

  // Track form start
  React.useEffect(() => {
    trackFormInteraction('contact_form_started', 'Contact Form');
  }, [trackFormInteraction]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      console.log("Submitting form with data:", data);
      
      // Track form submission attempt
      trackFormInteraction('contact_form_submitted', 'Contact Form', {
        has_phone: !!data.phone,
        subject_category: data.subject,
        message_length: data.message.length
      });

      const result = await submitContactForm(data);
      
      if (result.success) {
        // Track successful conversion
        trackConversion('contact_form_success', 'Contact Form Submission', {
          form_type: 'contact',
          contact_method: 'form',
          has_phone: !!data.phone,
          subject: data.subject
        });

        toast.success("Wiadomość została wysłana pomyślnie!");
        form.reset();
      } else {
        console.error("Form submission failed:", result.message);
        
        // Track form error
        trackFormInteraction('contact_form_error', 'Contact Form', {
          error_message: result.message
        });
        
        toast.error(result.message || "Wystąpił błąd podczas wysyłania wiadomości");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      
      // Track form failure
      trackFormInteraction('contact_form_failure', 'Contact Form', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      toast.error("Wystąpił błąd podczas wysyłania wiadomości");
    }
  };

  const handleFieldFocus = (fieldName: string) => {
    trackFormField(`contact_form_field_focus_${fieldName}`, fieldName);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border h-full">
      <div className="flex items-center mb-6">
        <Mail className="text-pink-500 w-6 h-6 mr-3" />
        <h2 className="text-2xl font-bold font-playfair">
          Wyślij wiadomość
        </h2>
      </div>

      <p className="text-gray-600 mb-6">
        Masz pytania dotyczące naszych zabiegów? Chcesz umówić się na konsultację? 
        Skontaktuj się z nami już dziś!
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imię i nazwisko *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Wprowadź swoje imię i nazwisko"
                    onFocus={() => handleFieldFocus('name')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email" 
                      placeholder="twoj@email.com"
                      onFocus={() => handleFieldFocus('email')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="608 123 456"
                      onFocus={() => handleFieldFocus('phone')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temat *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="O czym chcesz napisać?"
                    onFocus={() => handleFieldFocus('subject')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wiadomość *</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Opisz swoje pytanie lub potrzeby..." 
                    rows={5}
                    className="resize-none"
                    onFocus={() => handleFieldFocus('message')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="consent_given"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mt-1"
                    onFocus={() => handleFieldFocus('consent')}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    Wyrażam zgodę na przetwarzanie moich danych osobowych w celu udzielenia odpowiedzi na zapytanie. *
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Wysyłanie...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Wyślij wiadomość
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;
