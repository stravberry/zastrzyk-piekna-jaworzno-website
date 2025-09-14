import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X, Clock, User, Mail } from "lucide-react";
import { ContactSubmission } from "@/services/contactService";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface ContactReplyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submission: ContactSubmission;
  onReplySent: () => void;
}

const ContactReplyDialog: React.FC<ContactReplyDialogProps> = ({
  isOpen,
  onClose,
  submission,
  onReplySent
}) => {
  const [replyData, setReplyData] = useState({
    subject: `Re: ${submission.subject}`,
    message: ""
  });
  const [isSending, setIsSending] = useState(false);

  const handleSendReply = async () => {
    if (!replyData.message.trim()) {
      toast.error("Wiadomość nie może być pusta");
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-reply', {
        body: {
          to_email: submission.email,
          to_name: submission.name,
          subject: replyData.subject,
          message: replyData.message,
          original_submission_id: submission.id,
          original_message: submission.message,
          original_subject: submission.subject
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Odpowiedź została wysłana pomyślnie!");
        onReplySent();
        onClose();
        setReplyData({ subject: `Re: ${submission.subject}`, message: "" });
      } else {
        throw new Error(data.error || "Błąd wysyłania odpowiedzi");
      }
    } catch (error) {
      console.error("Reply error:", error);
      toast.error("Wystąpił błąd podczas wysyłania odpowiedzi");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Send className="h-6 w-6 text-primary" />
            Odpowiedz na wiadomość od {submission.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reply Form */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Twoja odpowiedź</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="to" className="text-sm font-medium">Odbiorca:</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md border-l-4 border-primary/30">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{submission.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{submission.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-sm font-medium">Temat:</Label>
                  <Input
                    id="subject"
                    value={replyData.subject}
                    onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
                    className="mt-1"
                    placeholder="Temat odpowiedzi..."
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium">Treść odpowiedzi:</Label>
                  <Textarea
                    id="message"
                    value={replyData.message}
                    onChange={(e) => setReplyData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Napisz swoją odpowiedź..."
                    rows={12}
                    className="resize-none mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 10 znaków. Bądź profesjonalny i pomocny.
                  </p>
                </div>
              </div>
            </div>

            {/* Original Message */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg mb-4">Oryginalna wiadomość</h3>
              
              <Card>
                <CardContent className="p-4 space-y-4">
                  {/* Message Header */}
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(submission.created_at), 'dd MMMM yyyy, HH:mm', { locale: pl })}
                    </span>
                  </div>

                  {/* Sender Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{submission.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{submission.email}</span>
                    </div>
                    {submission.phone && (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 text-center text-xs">📱</span>
                        <span className="text-sm">{submission.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">TEMAT:</Label>
                    <p className="font-medium bg-muted/50 p-2 rounded text-sm">{submission.subject}</p>
                  </div>

                  {/* Message Content */}
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">WIADOMOŚĆ:</Label>
                    <div className="bg-muted/30 p-3 rounded-md border-l-4 border-primary/20 max-h-64 overflow-y-auto">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{submission.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t bg-muted/30">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSending}
              className="flex-1 sm:flex-none"
            >
              <X className="h-4 w-4 mr-2" />
              Anuluj
            </Button>
            <Button
              onClick={handleSendReply}
              disabled={isSending || !replyData.message.trim() || replyData.message.length < 10}
              className="flex-1 sm:flex-none sm:min-w-48"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Wysyłanie odpowiedzi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Wyślij odpowiedź
                </>
              )}
            </Button>
          </div>
          
          {replyData.message.trim() && replyData.message.length < 10 && (
            <p className="text-xs text-destructive mt-2">
              Wiadomość musi mieć co najmniej 10 znaków
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactReplyDialog;