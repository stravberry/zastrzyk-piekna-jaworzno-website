
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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

  const { data: codeSettings, isLoading, error, refetch } = useQuery({
    queryKey: ["codeSettings"],
    queryFn: getCodeSettings
  });

  const mutation = useMutation({
    mutationFn: updateCodeSettings,
    onSuccess: () => {
      toast.success("Kod został zapisany pomyślnie");
      // Refresh the page to apply the new code settings
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error) => {
      console.error("Error updating code settings:", error);
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

  if (error) {
    return (
      <div>
        <Alert variant="destructive" className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Wystąpił problem podczas ładowania ustawień kodu. Spróbuj odświeżyć stronę.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()}>Spróbuj ponownie</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Alert className="mb-4 sm:mb-6 border-blue-200 bg-blue-50">
        <InfoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
        <AlertTitle className="text-sm sm:text-base">Optymalizacja dla Google Tag Manager</AlertTitle>
        <AlertDescription className="text-xs sm:text-sm mt-2">
          Strona jest wstępnie skonfigurowana do pracy z Google Tag Manager. Domyślny kod został umieszczony w obu polach. 
          Zastąp "GTM-XXXX" swoim identyfikatorem konta GTM. W panelu GTM możesz skonfigurować śledzenie następujących zdarzeń:
          <ul className="list-disc pl-4 sm:pl-5 mt-2 space-y-1">
            <li>Wirtualne odsłony stron - zdarzenie "virtualPageview"</li>
            <li>Interakcje użytkownika - zdarzenie "userInteraction"</li>
            <li>Przejścia między stronami - automatycznie śledzone</li>
          </ul>
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Własny kod HTML</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Dodaj kod JavaScript, CSS lub inne znaczniki HTML bezpośrednio do sekcji &lt;head&gt; lub &lt;body&gt; strony.
            Jest to przydatne dla narzędzi analitycznych (Google Analytics, Facebook Pixel), skryptów konwersji i innych rozwiązań wymagających bezpośredniego dostępu do DOM.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {isLoading ? (
            <div className="h-40 sm:h-60 flex items-center justify-center">
              <p className="text-muted-foreground text-sm sm:text-base">Ładowanie ustawień...</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4 w-full sm:w-auto grid grid-cols-2 sm:flex">
                    <TabsTrigger value="head" className="text-xs sm:text-sm px-2 sm:px-4">
                      <span className="hidden sm:inline">Kod nagłówka (head)</span>
                      <span className="sm:hidden">Head</span>
                    </TabsTrigger>
                    <TabsTrigger value="body" className="text-xs sm:text-sm px-2 sm:px-4">
                      <span className="hidden sm:inline">Kod treści (body)</span>
                      <span className="sm:hidden">Body</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="head" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="headCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm sm:text-base">Kod nagłówka</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={8}
                              className="font-mono text-xs sm:text-sm min-h-[200px] sm:min-h-[300px]"
                              placeholder="<!-- Wstaw kod do sekcji head tutaj (np. tagi meta, Google Analytics) -->"
                            />
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm">
                            Ten kod zostanie dodany przed zamknięciem tagu &lt;/head&gt; na wszystkich stronach.
                            <br className="hidden sm:block" />
                            <span className="sm:hidden"> </span>
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
                          <FormLabel className="text-sm sm:text-base">Kod treści</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              rows={8}
                              className="font-mono text-xs sm:text-sm min-h-[200px] sm:min-h-[300px]"
                              placeholder="<!-- Wstaw kod do sekcji body tutaj (np. czaty, dodatkowe skrypty) -->"
                            />
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm">
                            Ten kod zostanie dodany przed zamknięciem tagu &lt;/body&gt; na wszystkich stronach.
                            <br className="hidden sm:block" />
                            <span className="sm:hidden"> </span>
                            Tutaj umieszcza się zazwyczaj kod noscript Google Tag Manager oraz skrypty chatów, botów itp.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto bg-pink-500 hover:bg-pink-600 text-sm sm:text-base" 
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCodeSettings;
