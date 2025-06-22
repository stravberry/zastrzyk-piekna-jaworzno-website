
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

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
  const [lastResult, setLastResult] = useState<{ 
    success: boolean; 
    message: string; 
    details?: string;
    usedDomain?: string;
  } | null>(null);

  const handleSendTest = async () => {
    if (!selectedTemplate) {
      toast.error('Wybierz szablon do testowania');
      return;
    }

    if (!recipientEmail) {
      toast.error('Podaj adres email odbiorcy');
      return;
    }

    console.log('[EMAIL TEST] Starting test email send');
    setIsSending(true);
    setLastResult(null);

    try {
      console.log('[EMAIL TEST] Calling supabase function with:', {
        templateName: selectedTemplate,
        recipientEmail,
        testDataKeys: Object.keys(testData)
      });

      const { data, error } = await supabase.functions.invoke('test-email-template', {
        body: {
          templateName: selectedTemplate,
          recipientEmail,
          testData
        }
      });

      console.log('[EMAIL TEST] Function response:', { data, error });

      if (error) {
        console.error('[EMAIL TEST] Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        const result = {
          success: true,
          message: data.message,
          usedDomain: data.usedDomain
        };
        setLastResult(result);
        toast.success(`Email testowy został wysłany pomyślnie!${data.usedDomain ? ` (${data.usedDomain})` : ''}`);
        console.log('[EMAIL TEST] Success:', result);
      } else {
        const errorResult = {
          success: false,
          message: data?.error || 'Wystąpił błąd podczas wysyłania',
          details: data?.details
        };
        setLastResult(errorResult);
        throw new Error(errorResult.message);
      }
    } catch (error: any) {
      console.error('[EMAIL TEST] Error sending test email:', error);
      const errorMessage = error.message || 'Wystąpił błąd podczas wysyłania testu';
      const errorResult = {
        success: false,
        message: errorMessage,
        details: error.stack || error.toString()
      };
      setLastResult(errorResult);
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
          {/* Domain Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Informacja o domenie:</strong> System najpierw próbuje wysłać z domeny zastrzykpiekna.eu. 
              Jeśli domena nie jest zweryfikowana w Resend, automatycznie użyje domeny domyślnej (onboarding@resend.dev).
            </AlertDescription>
          </Alert>

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

          <div className="flex justify-between items-start">
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
              <div className="flex-1 ml-4">
                <Alert className={lastResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  {lastResult.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription>
                    <div className={`text-sm ${lastResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      <div className="font-medium">{lastResult.message}</div>
                      {lastResult.usedDomain && (
                        <div className="text-xs mt-1">Wysłano z: {lastResult.usedDomain}</div>
                      )}
                      {lastResult.details && !lastResult.success && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs">Szczegóły błędu</summary>
                          <pre className="text-xs mt-1 whitespace-pre-wrap bg-red-100 p-2 rounded">
                            {lastResult.details}
                          </pre>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {/* Troubleshooting Help */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Rozwiązywanie problemów:</strong>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Sprawdź czy klucz RESEND_API_KEY jest ustawiony w ustawieniach Supabase</li>
                <li>Zweryfikuj domenę zastrzykpiekna.eu w panelu Resend</li>
                <li>Sprawdź logi Edge Function w przypadku błędów</li>
                <li>Upewnij się że adres email odbiorcy jest prawidłowy</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTestingPanel;
