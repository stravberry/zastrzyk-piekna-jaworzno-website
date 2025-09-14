import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Clock, MapPin, Reply, CheckCircle, Eye } from "lucide-react";
import { ContactSubmission } from "@/services/contactService";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface ContactCardProps {
  submission: ContactSubmission;
  onStatusUpdate: (id: string, status: 'reviewed' | 'responded') => void;
  onReply: (submission: ContactSubmission) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  submission,
  onStatusUpdate,
  onReply
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: 'Nowa', variant: 'destructive' as const, icon: Mail },
      reviewed: { label: 'Przejrzana', variant: 'default' as const, icon: Eye },
      responded: { label: 'Odpowiedziano', variant: 'secondary' as const, icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">{submission.name}</h3>
            {getStatusBadge(submission.status)}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {format(new Date(submission.created_at), 'dd MMM yyyy, HH:mm', { locale: pl })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <a 
              href={`mailto:${submission.email}`}
              className="text-primary hover:underline truncate"
            >
              {submission.email}
            </a>
          </div>
          
          {submission.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a 
                href={`tel:${submission.phone}`}
                className="text-primary hover:underline"
              >
                {submission.phone}
              </a>
            </div>
          )}
        </div>

        {/* Subject */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Temat:</h4>
          <p className="text-sm font-medium">{submission.subject}</p>
        </div>

        {/* Message */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-1">Wiadomość:</h4>
          <p className="text-sm leading-relaxed bg-muted/30 p-3 rounded-md border-l-4 border-primary/20">
            {submission.message}
          </p>
        </div>

        {/* Technical Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          {submission.ip_address && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              IP: {submission.ip_address}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onReply(submission)}
            className="flex items-center gap-2"
          >
            <Reply className="h-4 w-4" />
            Odpowiedz
          </Button>
          
          {submission.status === 'new' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(submission.id, 'reviewed')}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Oznacz jako przejrzaną
            </Button>
          )}
          
          {submission.status === 'reviewed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusUpdate(submission.id, 'responded')}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Oznacz jako odpowiedzianą
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};