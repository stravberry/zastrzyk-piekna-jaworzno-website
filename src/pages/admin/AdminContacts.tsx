
import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, Eye, CheckCircle, MessageSquare, Reply } from "lucide-react";
import { getContactSubmissions, updateContactStatus, ContactSubmission } from "@/services/contactService";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import ContactReplyDialog from "@/components/admin/crm/ContactReplyDialog";

const AdminContacts: React.FC = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['contact-submissions'],
    queryFn: getContactSubmissions
  });

  const handleStatusUpdate = async (id: string, status: 'new' | 'reviewed' | 'responded') => {
    try {
      await updateContactStatus(id, status);
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">Nowe</Badge>;
      case 'reviewed':
        return <Badge className="bg-yellow-100 text-yellow-800">Przejrzane</Badge>;
      case 'responded':
        return <Badge className="bg-green-100 text-green-800">Odpowiedziane</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: pl });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-pink-500" />
          <h2 className="text-xl font-semibold">Contact Submissions</h2>
        </div>
        <div className="text-sm text-gray-600">
          Total: {submissions?.length || 0} submissions
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New</p>
                <p className="text-2xl font-bold text-blue-600">
                  {submissions?.filter(s => s.status === 'new').length || 0}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reviewed</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {submissions?.filter(s => s.status === 'reviewed').length || 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Responded</p>
                <p className="text-2xl font-bold text-green-600">
                  {submissions?.filter(s => s.status === 'responded').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions && submissions.length > 0 ? (
          submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="font-semibold text-lg break-words">{submission.name}</h3>
                      {getStatusBadge(submission.status)}
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="break-all">{submission.email}</span>
                      </div>
                      {submission.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0" />
                          <span>{submission.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0" />
                        <span>{formatDate(submission.created_at)}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="font-medium text-gray-900 mb-1">Subject:</p>
                      <p className="text-gray-700 break-words">{submission.subject}</p>
                    </div>

                    <div className="mb-4">
                      <p className="font-medium text-gray-900 mb-1">Message:</p>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md break-words">
                        {submission.message}
                      </p>
                    </div>

                    {submission.ip_address && (
                      <div className="text-xs text-gray-500 break-all">
                        IP: {submission.ip_address}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2 lg:gap-2 lg:ml-4 lg:shrink-0 lg:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setReplyDialogOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 min-w-0 flex-1 lg:flex-initial lg:min-w-[120px]"
                    >
                      <Reply className="h-4 w-4 shrink-0" />
                      <span className="hidden xs:inline">Reply</span>
                    </Button>
                    
                    {submission.status === 'new' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(submission.id, 'reviewed')}
                        className="flex-1 lg:flex-initial lg:min-w-[120px] text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">Mark as Reviewed</span>
                        <span className="sm:hidden">Reviewed</span>
                      </Button>
                    )}
                    {submission.status === 'reviewed' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 flex-1 lg:flex-initial lg:min-w-[120px] text-xs sm:text-sm"
                        onClick={() => handleStatusUpdate(submission.id, 'responded')}
                      >
                        <span className="hidden sm:inline">Mark as Responded</span>
                        <span className="sm:hidden">Responded</span>
                      </Button>
                    )}
                    {submission.status === 'responded' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(submission.id, 'reviewed')}
                        className="flex-1 lg:flex-initial lg:min-w-[120px] text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">Mark as Reviewed</span>
                        <span className="sm:hidden">Reviewed</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contact submissions</h3>
              <p className="text-gray-600">Contact form submissions will appear here when received.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reply Dialog */}
      {selectedSubmission && (
        <ContactReplyDialog
          isOpen={replyDialogOpen}
          onClose={() => {
            setReplyDialogOpen(false);
            setSelectedSubmission(null);
          }}
          submission={selectedSubmission}
          onReplySent={() => {
            queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
            handleStatusUpdate(selectedSubmission.id, 'responded');
          }}
        />
      )}
    </div>
  );
};

export default AdminContacts;
