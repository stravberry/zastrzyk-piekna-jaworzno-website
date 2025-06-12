import React, { useState } from "react";
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
import { Edit, Eye, Save, Plus, Mail, Code, FileText } from "lucide-react";
import TemplateRefreshButton from "@/components/admin/email-templates/TemplateRefreshButton";

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

  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_type', { ascending: true });
      
      if (error) throw error;
      return data as EmailTemplate[];
    }
  });

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

  if (isLoading) {
    return <div className="p-6 text-center">Ładowanie szablonów...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Szablony Email</h1>
          <p className="text-muted-foreground">
            Zarządzaj eleganckich szablonów wiadomości email wysyłanych do pacjentów
          </p>
        </div>
        <TemplateRefreshButton onRefresh={() => setSelectedTemplate(null)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista szablonów */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Dostępne szablony
                </CardTitle>
                <CardDescription>
                  Wybierz szablon do edycji lub podglądu
                </CardDescription>
              </div>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nowy szablon
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates?.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id ? 'border-pink-300 bg-pink-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{template.name}</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Aktywny" : "Nieaktywny"}
                    </Badge>
                    <Badge variant="outline">
                      {getTemplateTypeLabel(template.template_type)}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                <p className="text-xs text-gray-500 mb-3">{getTemplateDescription(template.name)}</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template);
                      setIsEditing(true);
                    }}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edytuj
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTemplate(template);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Podgląd
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Edytor/Podgląd szablonu */}
        {selectedTemplate && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {isEditing ? <Edit className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    {isEditing ? 'Edycja szablonu' : 'Podgląd szablonu'}
                  </CardTitle>
                  <CardDescription>
                    {selectedTemplate.name} - {getTemplateDescription(selectedTemplate.name)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setIsEditing(false)}
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
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Zapisz
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edytuj
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">Podgląd</TabsTrigger>
                  <TabsTrigger value="content">Treść</TabsTrigger>
                  <TabsTrigger value="settings">Ustawienia</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-4">
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Przykładowe dane:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(previewData).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {value}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border rounded-lg">
                      <div className="p-3 border-b bg-gray-50">
                        <p className="font-medium text-sm">
                          Temat: {processTemplate(selectedTemplate.subject, previewData)}
                        </p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        <iframe
                          srcDoc={processTemplate(selectedTemplate.html_content, previewData)}
                          className="w-full h-96 border-0"
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
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminEmailTemplates;
