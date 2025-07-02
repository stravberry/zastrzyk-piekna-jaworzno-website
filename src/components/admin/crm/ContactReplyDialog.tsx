import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Send, X } from "lucide-react";
import { ContactSubmission } from "@/services/contactService";
import { supabase } from "@/integrations/supabase/client";

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Odpowiedz na wiadomość
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reply Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="to">Do:</Label>
              <Input
                id="to"
                value={`${submission.name} <${submission.email}>`}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="subject">Temat:</Label>
              <Input
                id="subject"
                value={replyData.subject}
                onChange={(e) => setReplyData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="message">Treść odpowiedzi:</Label>
              <Textarea
                id="message"
                value={replyData.message}
                onChange={(e) => setReplyData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Napisz swoją odpowiedź..."
                rows={8}
                className="resize-none"
              />
            </div>
          </div>

          {/* Original Message */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Oryginalna wiadomość:</h4>
            <div className="bg-muted p-3 rounded-md text-sm space-y-2">
              <div><strong>Od:</strong> {submission.name} &lt;{submission.email}&gt;</div>
              <div><strong>Temat:</strong> {submission.subject}</div>
              <div><strong>Data:</strong> {new Date(submission.created_at).toLocaleString('pl-PL')}</div>
              <div className="border-t pt-2 mt-2">
                <strong>Treść:</strong>
                <div className="mt-1 whitespace-pre-wrap">{submission.message}</div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSending}
          >
            <X className="h-4 w-4 mr-2" />
            Anuluj
          </Button>
          <Button
            onClick={handleSendReply}
            disabled={isSending || !replyData.message.trim()}
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Wysyłanie...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Wyślij odpowiedź
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContactReplyDialog;