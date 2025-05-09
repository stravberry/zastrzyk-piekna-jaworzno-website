
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCodeSettings, updateCodeSettings } from "@/services/codeSettingsService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface CodeSettingsFormValues {
  headCode: string;
  bodyCode: string;
}

const AdminCodeSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("head");

  const form = useForm<CodeSettingsFormValues>({
    defaultValues: {
      headCode: "",
      bodyCode: ""
    }
  });

  const { data: codeSettings, isLoading } = useQuery({
    queryKey: ["codeSettings"],
    queryFn: getCodeSettings
  });

  const mutation = useMutation({
    mutationFn: updateCodeSettings,
    onSuccess: () => {
      toast.success("Kod został zapisany pomyślnie");
    },
    onError: () => {
      toast.error("Wystąpił błąd podczas zapisywania kodu");
    }
  });

  useEffect(() => {
    if (codeSettings) {
      form.reset({
        headCode: codeSettings.headCode || "",
        bodyCode: codeSettings.bodyCode || ""
      });
    }
  }, [codeSettings, form]);

  const onSubmit = (values: CodeSettingsFormValues) => {
    mutation.mutate(values);
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout title="Ustawienia kodu" subtitle="Dodaj kod śledzenia lub inne skrypty do nagłówka i treści strony">
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <InfoIcon className="h-5 w-5 text-blue-500" />
          <AlertTitle>Optymalizacja dla Google Tag Manager</AlertTitle>
          <AlertDescription>
            Strona jest wstępnie skonfigurowana do pracy z Google Tag Manager. Domyślny kod został umieszczony w obu polach. 
            Zastąp "GTM-XXXX" swoim identyfikatorem konta GTM. W panelu GTM możesz skonfigurować śledzenie następujących zdarzeń:
            <ul className="list-disc pl-5 mt-2">
              <li>Wirtualne odsłony stron - zdarzenie "virtualPageview"</li>
              <li>Interakcje użytkownika - zdarzenie "userInteraction"</li>
              <li>Przejścia między stronami - automatycznie śledzone</li>
            </ul>
          </AlertDescription>
        </Alert>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Własny kod HTML</CardTitle>
            <CardDescription>
              Dodaj kod JavaScript, CSS lub inne znaczniki HTML bezpośrednio do sekcji &lt;head&gt; lub &lt;body&gt; strony.
              Jest to przydatne dla narzędzi analitycznych (Google Analytics, Facebook Pixel), skryptów konwersji i innych rozwiązań wymagających bezpośredniego dostępu do DOM.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-60 flex items-center justify-center">
                <p className="text-muted-foreground">Ładowanie ustawień...</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="head">Kod nagłówka (head)</TabsTrigger>
                      <TabsTrigger value="body">Kod treści (body)</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="head" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="headCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kod nagłówka</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                rows={12} 
                                placeholder="<!-- Wstaw kod do sekcji head tutaj (np. tagi meta, Google Analytics) -->"
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormDescription>
                              Ten kod zostanie dodany przed zamknięciem tagu &lt;/head&gt; na wszystkich stronach.
                              <br />
                              Tutaj umieszcza się zazwyczaj kod inicjalizacyjny Google Tag Manager.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                    
                    <TabsContent value="body" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="bodyCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kod treści</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                rows={12}
                                placeholder="<!-- Wstaw kod do sekcji body tutaj (np. czaty, dodatkowe skrypty) -->"
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormDescription>
                              Ten kod zostanie dodany przed zamknięciem tagu &lt;/body&gt; na wszystkich stronach.
                              <br />
                              Tutaj umieszcza się zazwyczaj kod noscript Google Tag Manager oraz skrypty chatów, botów itp.
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>

                  <CardFooter className="px-0">
                    <Button 
                      type="submit" 
                      className="ml-auto bg-pink-500 hover:bg-pink-600" 
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminCodeSettings;
