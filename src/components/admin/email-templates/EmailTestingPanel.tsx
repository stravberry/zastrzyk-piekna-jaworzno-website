
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template_type: string;
}

interface EmailTestingPanelProps {
  templates: EmailTemplate[];
}

const EmailTestingPanel: React.FC<EmailTestingPanelProps> = ({ templates }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [testData, setTestData] = useState({
    patient_name: 'Anna Kowalska',
    date: '15 czerwca 2024',
    time: '14:30',
    treatment_name: 'Botoks czoła',
    duration: '45',
    pre_treatment_notes: 'Prosimy o nieużywanie kremów 24h przed zabiegiem'
  });
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSendTest = async () => {
    if (!selectedTemplate) {
      toast.error('Wybierz szablon do testowania');
      return;
    }

    if (!recipientEmail) {
      toast.error('Podaj adres email odbiorcy');
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-email-template', {
        body: {
          templateName: selectedTemplate,
          recipientEmail,
          testData
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        setLastResult({ success: true, message: data.message });
        toast.success('Email testowy został wysłany pomyślnie!');
      } else {
        throw new Error(data?.error || 'Wystąpił błąd podczas wysyłania');
      }
    } catch (error: any) {
      console.error('Error sending test email:', error);
      const errorMessage = error.message || 'Wystąpił błąd podczas wysyłania testu';
      setLastResult({ success: false, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleTestDataChange = (field: string, value: string) => {
    setTestData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Test wysyłania maili
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-select">Szablon do testowania</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz szablon..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.name}>
                      {template.name} ({template.template_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-email">Adres email odbiorcy</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="test@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Dane testowe</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Imię i nazwisko</Label>
                <Input
                  id="patient-name"
                  value={testData.patient_name}
                  onChange={(e) => handleTestDataChange('patient_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  value={testData.date}
                  onChange={(e) => handleTestDataChange('date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Godzina</Label>
                <Input
                  id="time"
                  value={testData.time}
                  onChange={(e) => handleTestDataChange('time', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">Zabieg</Label>
                <Input
                  id="treatment"
                  value={testData.treatment_name}
                  onChange={(e) => handleTestDataChange('treatment_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Czas trwania (min)</Label>
                <Input
                  id="duration"
                  value={testData.duration}
                  onChange={(e) => handleTestDataChange('duration', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notatki</Label>
                <Input
                  id="notes"
                  value={testData.pre_treatment_notes}
                  onChange={(e) => handleTestDataChange('pre_treatment_notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={handleSendTest}
              disabled={isSending || !selectedTemplate || !recipientEmail}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Wysyłanie...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Wyślij test
                </div>
              )}
            </Button>

            {lastResult && (
              <div className={`flex items-center gap-2 text-sm ${lastResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {lastResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {lastResult.message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTestingPanel;
