import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit, Eye, Save, Plus, Mail, Code, FileText, Sparkles } from "lucide-react";
import TemplateRefreshButton from "@/components/admin/email-templates/TemplateRefreshButton";
import EmailTestingPanel from "@/components/admin/email-templates/EmailTestingPanel";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  text_content: string;
  template_type: string;
  is_active: boolean;
}

const AdminEmailTemplates: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewData, setPreviewData] = useState({
    patient_name: "Anna Kowalska",
    date: "15 czerwca 2024",
    time: "14:30",
    treatment_name: "Botoks czoła",
    duration: "45",
    pre_treatment_notes: "Prosimy o nieużywanie kremów 24h przed zabiegiem"
  });

  const queryClient = useQueryClient();

  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      console.log('Fetching email templates...');
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_type', { ascending: true });
      
      if (error) {
        console.error('Error fetching templates:', error);
        throw error;
      }
      
      console.log('Templates fetched:', data);
      return data as EmailTemplate[];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Auto-refresh templates when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  const updateTemplate = useMutation({
    mutationFn: async (template: Partial<EmailTemplate>) => {
      const { error } = await supabase
        .from('email_templates')
        .update(template)
        .eq('id', selectedTemplate?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast.success('Szablon został zaktualizowany');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error('Błąd podczas aktualizacji szablonu: ' + error.message);
    }
  });

  const processTemplate = (content: string, data: any) => {
    let processed = content;
    
    // Replace variables
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, value as string);
    });
    
    // Handle conditional statements
    processed = processed.replace(
      /\{\{#if pre_treatment_notes\}\}(.*?)\{\{\/if\}\}/gs,
      data.pre_treatment_notes ? '$1' : ''
    );
    
    return processed;
  };

  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case 'reminder': return 'Przypomnienie';
      case 'confirmation': return 'Potwierdzenie';
      case 'cancellation': return 'Anulowanie';
      default: return type;
    }
  };

  const getTemplateDescription = (name: string) => {
    switch (name) {
      case 'reminder_24h': return 'Wysyłane 24 godziny przed wizytą';
      case 'reminder_2h': return 'Wysyłane 2 godziny przed wizytą';
      case 'appointment_confirmation': return 'Wysyłane po potwierdzeniu wizyty';
      default: return 'Szablon email';
    }
  };

  const getTemplateIcon = (name: string) => {
    switch (name) {
      case 'reminder_24h': return '📅';
      case 'reminder_2h': return '⏰';
      case 'appointment_confirmation': return '✅';
      default: return '📧';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie szablonów...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500" />
            Szablony Email
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Zarządzaj eleganckimi szablonami wiadomości email wysyłanych do pacjentów
          </p>
        </div>
        <TemplateRefreshButton onRefresh={() => {
          setSelectedTemplate(null);
          refetch();
        }} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Lista szablonów */}
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  Dostępne szablony
                </CardTitle>
                <CardDescription className="text-sm">
                  Wybierz szablon do edycji lub podglądu
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Nowy szablon</span>
                <span className="xs:hidden">Nowy</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4 sm:p-6">
            {templates?.map((template) => (
              <div
                key={template.id}
                className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id 
                    ? 'border-pink-300 bg-gradient-to-r from-pink-50 to-rose-50 shadow-sm' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl sm:text-2xl">{getTemplateIcon(template.name)}</span>
                    <h4 className="font-medium text-sm sm:text-base truncate">{template.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={template.is_active ? "default" : "secondary"} className="text-xs">
                      {template.is_active ? "Aktywny" : "Nieaktywny"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getTemplateTypeLabel(template.template_type)}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium break-words">{template.subject}</p>
                <p className="text-xs text-gray-500 mb-3">{getTemplateDescription(template.name)}</p>
                <div className="flex flex-col xs:flex-row gap-2">
                  <Button 
                    size="default" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template);
                      setIsEditing(true);
                    }}
                    className="text-sm py-2 px-4 h-10 flex-1 xs:flex-initial min-w-[90px]"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edytuj
                  </Button>
                  <Button 
                    size="default" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template);
                    }}
                    className="text-sm py-2 px-4 h-10 flex-1 xs:flex-initial min-w-[90px]"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Podgląd
                  </Button>
                </div>
              </div>
            ))}
            
            {(!templates || templates.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Brak dostępnych szablonów</p>
                <Button onClick={() => refetch()} className="mt-2" size="sm">
                  Odśwież
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edytor/Podgląd szablonu */}
        {selectedTemplate && (
          <Card className="w-full">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    {isEditing ? <Edit className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    <span className="truncate">{isEditing ? 'Edycja szablonu' : 'Podgląd szablonu'}</span>
                    <span className="text-xl sm:text-2xl ml-2">{getTemplateIcon(selectedTemplate.name)}</span>
                  </CardTitle>
                  <CardDescription className="text-sm break-words">
                    {selectedTemplate.name} - {getTemplateDescription(selectedTemplate.name)}
                  </CardDescription>
                </div>
                <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
                  {isEditing ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 xs:flex-initial"
                      >
                        Anuluj
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => updateTemplate.mutate({
                          subject: selectedTemplate.subject,
                          html_content: selectedTemplate.html_content,
                          text_content: selectedTemplate.text_content,
                          is_active: selectedTemplate.is_active
                        })}
                        disabled={updateTemplate.isPending}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 flex-1 xs:flex-initial"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Zapisz
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 w-full xs:w-auto"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edytuj
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                  <TabsTrigger value="preview" className="text-xs sm:text-sm">Podgląd</TabsTrigger>
                  <TabsTrigger value="content" className="text-xs sm:text-sm">Treść</TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs sm:text-sm">Ustawienia</TabsTrigger>
                  <TabsTrigger value="test" className="text-xs sm:text-sm">Test</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-4">
                  <div className="space-y-4">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                      <p className="text-sm font-medium mb-2 text-blue-800">📋 Przykładowe dane:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {Object.entries(previewData).map(([key, value]) => (
                          <div key={key} className="text-blue-700 break-words">
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden shadow-lg">
                      <div className="p-3 border-b bg-gradient-to-r from-gray-50 to-gray-100">
                        <p className="font-medium text-sm text-gray-800 break-words">
                          📧 Temat: {processTemplate(selectedTemplate.subject, previewData)}
                        </p>
                      </div>
                      <div className="max-h-64 sm:max-h-96 overflow-y-auto">
                        <iframe
                          srcDoc={processTemplate(selectedTemplate.html_content, previewData)}
                          className="w-full h-64 sm:h-96 border-0"
                          title="Email Preview"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Temat wiadomości</Label>
                    <Input
                      id="subject"
                      value={selectedTemplate.subject}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        subject: e.target.value
                      })}
                      disabled={!isEditing}
                      placeholder="Temat email..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="html_content">Treść HTML</Label>
                    <Textarea
                      id="html_content"
                      value={selectedTemplate.html_content}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        html_content: e.target.value
                      })}
                      disabled={!isEditing}
                      rows={12}
                      className="font-mono text-sm"
                      placeholder="HTML content..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text_content">Treść tekstowa</Label>
                    <Textarea
                      id="text_content"
                      value={selectedTemplate.text_content || ''}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        text_content: e.target.value
                      })}
                      disabled={!isEditing}
                      rows={8}
                      placeholder="Plain text content..."
                    />
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Dostępne zmienne:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <span>{'{{patient_name}}'}</span>
                      <span>{'{{date}}'}</span>
                      <span>{'{{time}}'}</span>
                      <span>{'{{treatment_name}}'}</span>
                      <span>{'{{duration}}'}</span>
                      <span>{'{{pre_treatment_notes}}'}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Warunki: {'{{#if pre_treatment_notes}}'}tekst{'{{/if}}'} 
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_active" className="text-sm font-medium">
                        Status szablonu
                      </Label>
                      <p className="text-xs text-gray-500">
                        Tylko aktywne szablony są używane do wysyłania
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={selectedTemplate.is_active}
                      onCheckedChange={(checked) => setSelectedTemplate({
                        ...selectedTemplate,
                        is_active: checked
                      })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Typ szablonu</Label>
                    <Select value={selectedTemplate.template_type} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reminder">Przypomnienie</SelectItem>
                        <SelectItem value="confirmation">Potwierdzenie</SelectItem>
                        <SelectItem value="cancellation">Anulowanie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="test" className="mt-4">
                  <EmailTestingPanel templates={templates || []} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminEmailTemplates;
